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
//Hilfsfunktionen
//------------------------
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
    console.error("Error when combining search results: ", error);
    ui.displayError("Error when combining search results");
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
 * Neuladen der Favoriten nach einer Änderung
 */
$(document).on("reloadFavorites", function () {
  loadFavorites();
});

/**
 * Initialisiert das CVE-Feature
 */
async function initializeCVE() {
  const cve = await apiHandler.nistNVDApi();
  cve.vulnerabilities.sort(
    (a, b) => new Date(b.cve.published) - new Date(a.cve.published)
  ); //Nach Datum sortieren
  ui.displayCVEs(cve.vulnerabilities);
}

/**
 * Bestimmt, ob nach einer App ID oder einem App Namen gesucht werden soll.
 * Wird als ID klassifiziert, wenn nur Zahlen (min. 5) vorkommen.
 * @param {*} input Zu prüfende Eingabe
 * @returns String "id" oder "name"
 */
function determineSearchMode(input) {
  if (/^\d+$/.test(input) && input.length >= 5) {
    return "id";
  } else {
    return "name";
  }
}

//------------------------
//Hauptfunktionen
//------------------------

ui.initializeUI(); //UI initialisieren

/**
 * Event Listener für den Such-Button. Startet die App Abfrage und Ergebnisfilter. Wird aller Wahrscheinlichkeit nur im ID-Modus verwendet.
 */
searchButton.on("click", async function (e) {
  e.preventDefault(); //verhindet das Neuladen der Seite beim Absenden vom Formular
  ui.resetErrorMessage(); //Fehler zurücksetzen
  const input = searchTermInput.val(); //Suchbegriff vom User holen
  const apps = await getProcessedApps(input);
  //Steuerung für weiteren Ablauf.
  const appliedDevFilter = filter.filterDeveloper(apps); //Entwicklerfilter anwenden
  let appliedPlatformFilter = filter.filterPlatform(appliedDevFilter); //Platformfilter anwenden
  if (determineSearchMode(searchTermInput.val()) === "name") {
    //Nach Relevanz sortieren falls der Input ein Name ist
    appliedPlatformFilter = filter.sortAppsByRelevance(
      appliedPlatformFilter,
      input
    );
  }
  ui.displayApp(appliedPlatformFilter);
});

/**
 * Handelt ajax requests anhand von Usereingaben. Kombiniert wenn nötig macOS und mobile Abfragen.
 * @param {*} input Suchbegriff
 * @returns Array mit den Apps aus der iTunes api.
 */
async function getProcessedApps(input) {
  const selectedSearchMode = determineSearchMode(input); //Suchmodus bestimmen
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
      selectedPlatforms.length === 4
    ) {
      console.log("macOS Ajax query starts"); //debug
      try {
        //Ajax Abfrage spezifisch für macOS starten und in searchPromises speichern. Await kommt später.
        searchPromises.push(
          apiHandler.iTunesSearchAPI(input, "desktop", "", 10)
        );
      } catch (error) {
        //Error handling
        console.error(
          "Error with macOS-specific iTunes API Ajax query:",
          error.message
        );
        ui.displayError("Error with macOS-specific iTunes API Ajax query");
      }
    }

    //immer ausser wenn ausschliesslich nach macOS gesucht wird:
    const isOnlyMacSelected =
      selectedPlatforms.length === 1 && selectedPlatforms.includes("macOS");
    if (
      !isOnlyMacSelected ||
      selectedPlatforms.length === 0 ||
      selectedPlatforms.length === 4
    ) {
      console.log("mobile Ajax query starts"); //debug
      try {
        //Ajax Abfrage, in searchPromises speichern. Await kommt später.
        searchPromises.push(
          apiHandler.iTunesSearchAPI(input, "mobile", "", 10)
        );
      } catch (error) {
        console.error(
          "Error with non-macOS-specific iTunes API Ajax query:",
          error.message
        ); //Error handling
        ui.displayError("Error with non-macOS-specific iTunes API Ajax query");
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
      console.error(
        "Error in iTunes API Ajax query for App ID:",
        error.message
      ); //Error handling
      ui.displayError("Error in iTunes API Ajax query for App ID");
    }
  } else {
    //Error bei der Auswahl vom Suchmodus
    console.error("Search Mode Error");
    ui.displayError("Search Mode Error");
  }
}

/**
 * Event Listener für das Entwickler-Eingabefeld. Suche nach Entwicklern von Apps nach mehreren Platformen.
 */
developerInput.on(
  "input",
  debounce(async function () {
    const searchPromises = []; //Dynamische Promises-Liste
    console.log("Developer query starts: ", developerInput.val()); //debug
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
    } catch (error) {
      //Error handling
      console.error("Error while searching for developers : ", error);
      ui.displayError("Error while searching for developers");
      return []; //Leeres Array zurückgeben, damit die UI nicht crasht
    }
  }, 200)
);

/**
 * setzt die Vorschläge zurück und startet neue Abfragen, für den Fall dass nach einer Eingabe ein filter geändert wird
 */
searchTermInput.on("click", function () {
  ui.populateSuggestions(
    softwareSuggestions,
    [],
    searchTermInput
  );
  searchTermInput.trigger("input");
});

/**
 * Event Listener für das App-Namen-Eingabefeld
 */
searchTermInput.on(
  "input",
  debounce(async function () {
    //Überspringen, wenn Suchmodus ID ist.
    if (determineSearchMode(searchTermInput.val()) === "id") {
      return;
    }

    ui.resetErrorMessage(); //Vorherige Fehlermeldungen zurücksetzen
    ui.closeSuggestionDropdown(); //Dropdowns schliessen

    try {
      //Ajax Abfrage
      const combinedResults = await getProcessedApps(searchTermInput.val());
      const appliedDevFilter = filter.filterDeveloper(combinedResults); //Entwicklerfilter anwenden
      const appliedPlatformFilter = filter.filterPlatform(appliedDevFilter); //Platformfilter anwenden
      const sortedByRelevance = filter.sortAppsByRelevance(
        appliedPlatformFilter,
        searchTermInput.val()
      ); //Ergebnisse nach Relevanz sortieren
      console.log("Filtered and sorted apps: ", sortedByRelevance);
      //Resultate dem User anzeigen
      if (sortedByRelevance && sortedByRelevance.length > 0) {
        ui.populateSuggestions(
          softwareSuggestions,
          sortedByRelevance,
          searchTermInput
        );
      } else if (searchTermInput.val() != "") {
        console.error("No data found");
        ui.displayError("No data found");
        return;
      } else {
        console.warn("API query with empty input");
      }
    } catch (error) {
      //Error handling
      console.error("Error during software search: ", error);
      ui.displayError("Error during software search");
      return []; //Leeres Array zurückgeben, damit die UI nicht crasht
    }
  }, 250)
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
      console.error("Error loading favorites: ", error.message);
      ui.displayError("Error loading favorites.");
    }
    //Auf alle Antworten warten und ein "normales" Array erstellen.
  });
  favoriteApps = await combineResults(searchPromises);
  ui.populateFavorites(favoriteApps);
}

//Teile der UI, die API Abfragen brauchen, initialisieren. Werden am Ende ausgeführt, damit andere Funktionen schon verfügbar sind.
loadFavorites();
await initializeCVE();