//------------------------
//JS Import
//------------------------
import * as ui from "./ui.js";
import * as apiHandler from "./apiHandler.js";
import * as filter from "./filter.js";
import * as localStorageHandler from "./localStorageHandler.js";

//------------------------
//DOM Referenzen
//------------------------
const searchButton = $("#searchButton");
const developerInput = $("#developerInput");
const developerSuggestions = $("#developerSuggestions");
const searchTermInput = $("#searchTermInput");
const softwareSuggestions = $("#softwareSuggestions");

//------------------------
//Hauptfunktionen
//------------------------
loadFavorites();
ui.initializeUI();
/**
 * Event Listener für den Such-Button. Startet die App Abfrage und Ergebnisfilter. Wird aller Wahrscheinlichkeit nur im ID-Modus verwendet.
 */
searchButton.on("click", async function (e) {
  e.preventDefault(); //verhindet das Neuladen der Seite beim Absenden vom Formular
  const input = searchTermInput.val(); //Suchbegriff vom User holen
  const apps = await getProcessedApps(input);
  console.log("wir sind beim searchButton-Eventlistener. " + apps); //debug
  //Steuerung für weiteren Ablauf.
  const appliedDevFilter = filter.filterDeveloper(apps); //Entwicklerfilter anwenden
  const appliedPlatformFilter = filter.filterPlatform(appliedDevFilter); //Platformfilter anwenden
  const sortedByRelevance = filter.sortAppsByRelevance(
    appliedPlatformFilter,
    input
  );
  ui.displayApp(appliedPlatformFilter);
});

/**
 * Handelt ajax requests anhand von Usereingaben. Kombiniert wenn nötig macOS und mobile Abfragen.
 * @param {*} input Suchbegriff
 * @returns Array mit den Apps aus der iTunes api.
 */
async function getProcessedApps(input) {
  const selectedSearchMode = $("#searchMode").val(); //Aktuell gewählten Modus holen
  const searchPromises = []; //Dynamische Promises-Liste

  //---------Suche nach String---------
  if (selectedSearchMode === "name") {
    //Benutzerauswahl für Platform holen und in ein Array umwandeln
    const selectedPlatforms = $(
      ".platform-dropdown input[type='checkbox']:checked"
    )
      .map(function () {
        return $(this).val();
      })
      .get();

    //Separate ajax Abfrage für macOS, weil die iTunes API bei der normalen Abfrage mobile-Apps zu stark priorisiert
    if (
      selectedPlatforms.includes("macOS") ||
      selectedPlatforms.length === 0 ||
      selectedPlatforms.length === 5
    ) {
      console.log("macOS Ajax Abfrage startet"); //debug
      try {
        //Ajax Abfrage spezifisch für macOS starten und in searchPromises speichern. Await kommt später.
        searchPromises.push(
          apiHandler.iTunesSearchAPI(input, "desktop", "", 10)
        );
      } catch (error) {
        //Error handling
        console.error(
          "Fehler bei der macOS-spezifischen iTunes API-Ajax Abfrage:",
          error.message
        );
        ui.displayError(
          "Fehler bei der macOS-spezifischen iTunes API-Ajax Abfrage"
        );
      }
    }

    //immer ausser wenn ausschliesslich nach macOS gesucht wird:
    const isOnlyMacSelected =
      selectedPlatforms.length === 1 && selectedPlatforms.includes("macOS");
    if (
      !isOnlyMacSelected ||
      selectedPlatforms.length === 0 ||
      selectedPlatforms.length === 5
    ) {
      console.log("mobile Ajax Abfrage startet"); //debug
      try {
        //Ajax Abfrage, in searchPromises speichern. Await kommt später.
        searchPromises.push(
          apiHandler.iTunesSearchAPI(input, "mobile", "", 10)
        );
      } catch (error) {
        console.error("Fehler bei der iTunes API-Ajax Abfrage:", error.message); //Error handling
        ui.displayError("Fehler bei der iTunes API-Ajax Abfrage");
      }
    }
    return combineResults(searchPromises);
    //---------Suche nach ID.---------
  } else if (selectedSearchMode === "id") {
    try {
      //Ajax Abfrage mit Error Handling
      const apiResponse = await apiHandler.iTunesLookupAPI(input); //Ajax Abfrage starten und bei Erfolg Erebnis speichern
      const apps = apiResponse.results; //Umwandlung zu normalem Array für einfachere Handhabung
      return apps;
    } catch (error) {
      console.error("Fehler bei der iTunes API-Ajax Abfrage:", error.message); //Error handling
      ui.displayError("Fehler bei der iTunes API-Ajax Abfrage");
    }
  } else {
    //Error bei der Auswahl vom Suchmodus
    console.error("Unbekannte Suchmodus Auswahl");
    ui.displayError("Unbekannte Suchmodus Auswahl");
  }
}

/**
 * Kobiniert die Resultate mehrerer Ajax Abfragen
 * @param {*} searchPromises Array mit promises aus Ajax Abfragen
 * @returns Kombiniertes Array
 */
async function combineResults(searchPromises) {
  //beide cases zusammenführen
  //Auf alle (1 oder 2) Ergebnisse warten. Promise.all wartet auf alle Promises im Array, egal wie viele es sind.
  let combinedResults = [];

  try {
    const allResponses = await Promise.all(searchPromises);

    //Iterieren über alle erhaltenen Responses
    for (const response of allResponses) {
      //Kombinieren mit Umwandlung zu normalem Array für einfachere Handhabung
      combinedResults.push(...(response.results || []));
    }
    return combinedResults;
  } catch (error) {
    //Error handling wenn mindestens eine der Anfragen fehlschlägt
    console.error("Fehler bei der kombinierten Suche: ", error);
    ui.displayError("Fehler bei der kombinierten Suche");
    return []; //Leeres Array zurückgeben, damit die UI nicht crasht
  }
}

/**
 * Debounce Timer für Funktionen, in denen auf Usereingaben gewartet werden soll.
 * @param {*} fn Funktion die nach dem Timer ausgeführt wird
 * @param {*} delay Verzögerung in ms
 */
function debounce(fn, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Event Listener für das Entwickler-Eingabefeld. Suche nach Entwicklern von Apps nach mehreren Platformen.
 */
developerInput.on(
  "input",
  debounce(async function () {
    const searchPromises = []; //Dynamische Promises-Liste
    console.log(developerInput.val());
    console.log("Entwicklerabfrage startet"); //debug
    try {
      //Ajax Abfrage
      searchPromises.push(
        apiHandler.iTunesSearchAPI(
          developerInput.val(),
          "desktop",
          "softwareDeveloper",
          10
        )
      );
      searchPromises.push(
        apiHandler.iTunesSearchAPI(
          developerInput.val(),
          "mobile",
          "softwareDeveloper",
          10
        )
      );
      //Beide cases zusammenführen
      const combinedResults = await combineResults(searchPromises);
      //Duplikate entfernen
      const uniqueDeveloperNames = [
        ...new Set(
          combinedResults
            .map((app) => app.artistName) // 1. Nur den Entwicklernamen extrahieren
            .filter((name) => name) // 2. Leere oder undefined Werte entfernen
        ),
      ];
      ui.populateSuggestions(
        developerSuggestions,
        uniqueDeveloperNames,
        developerInput
      );
      console.log("test2", uniqueDeveloperNames); //debug
    } catch (error) {
      //Error handling
      console.error("Fehler bei der kombinierten Entwicklersuche: ", error);
      ui.displayError("Fehler bei der kombinierten Entwicklersuche");
      return []; //Leeres Array zurückgeben, damit die UI nicht crasht
    }
  }, 200)
);

/**
 * Event Listener für das App-Namen-Eingabefeld
 */
searchTermInput.on(
  "input",
  debounce(async function () {
    //Überspringen, wenn Suchmodus ID ist.
    if ($("#searchMode").val() === "id") {
      return;
    }
    try {
      //Ajax Abfrage
      const combinedResults = await getProcessedApps(searchTermInput.val());
      const appliedDevFilter = filter.filterDeveloper(combinedResults); //Entwicklerfilter anwenden
      const appliedPlatformFilter = filter.filterPlatform(appliedDevFilter); //Platformfilter anwenden
      const sortedByRelevance = filter.sortAppsByRelevance(
        appliedPlatformFilter,
        searchTermInput.val()
      ); //Ergebnisse nach Relevanz sortieren
      console.log("Fertig gefilterte und sortierte Apps: ", sortedByRelevance);
      //Resultate dem User anzeigen
      ui.populateSuggestions(
        softwareSuggestions,
        sortedByRelevance,
        searchTermInput
      );
    } catch (error) {
      //Error handling
      console.error("Fehler bei der Softwaresuche: ", error);
      ui.displayError("Fehler bei der Softwaresuche");
      return []; //Leeres Array zurückgeben, damit die UI nicht crasht
    }
  }, 200)
);

async function loadFavorites() {
  const searchPromises = []; //Dynamische Promises-Liste
  let favoriteApps = [];
  //Bestehendes array holen falls vorhanden
  const currentArray = localStorageHandler.getFavorites();
  //iterieren durch alle Favoriten
  currentArray.forEach((id) => {
    try {
      searchPromises.push(apiHandler.iTunesLookupAPI(id)); //ajax Abfragen für alle Favoriten starten
    } catch (error) {
      //Error handling
      console.error("Fehler beim Laden der Favoriten: ", error.message);
      ui.displayError("Fehler beim Laden der Favoriten.");
    }
    //Auf alle Antworten warten und ein "normales" Array erstellen.
  });
  favoriteApps = await combineResults(searchPromises);
  ui.populateFavorites(favoriteApps);
}
document.addEventListener("reloadFavorites", loadFavorites);
