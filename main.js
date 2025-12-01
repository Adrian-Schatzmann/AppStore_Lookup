//------------------------
//JS Import
//------------------------
import * as ui from "./ui.js";
import * as apiHandler from "./apiHandler.js";
import * as filter from "./filter.js";

//------------------------
//DOM Referenzen
//------------------------
const searchButton = $("#searchButton");
const developerInput = $("#developerInput");
const developerSuggestions = $("#developerSuggestions");
const searchTermInput = $("#searchTermInput");
const softwareSuggestions = $("#softwareSuggestions");

//------------------------
//Output
//------------------------
/**
 * Schreibt Infos zur ersten App aus aus dem Results Objekt in den DOM
 * @param {*} apps Array mit der anzuzeigenden App im Index 0
 * @returns null bei Error
 */
function displayApp(apps) {
  console.log(apps);
  //Benötigte Infos aus App Objekt extrahieren (DOMPurify entfernt schädlichen code, || "" ist ein fallback falls es diesen Eintrag nicht gibt.)
  //DOMPurify siehe https://github.com/cure53/DOMPurify

  //Extrahieren der ersten App im Array
  let app = "";
  if (apps.length >= 0) {
    app = apps[0];
  } else {
    console.error("API Error - Keine App Daten gefunden");
    return null;
  }
  //Einzelne Daten extrahieren
  const img = DOMPurify.sanitize(app.artworkUrl512 || app.artworkUrl100 || "");
  const name = DOMPurify.sanitize(app.trackName || "");
  const bundle = DOMPurify.sanitize(app.bundleId || "");
  const version = DOMPurify.sanitize(app.version || "");
  const genre = DOMPurify.sanitize(app.primaryGenreName || "");
  const platform = filter.getPlatforms(app).join(", ");
  const description = DOMPurify.sanitize(app.description || "");
  const developer = DOMPurify.sanitize(app.sellerName || "");
  const appStoreUrl = DOMPurify.sanitize(app.trackViewUrl || "#");

  //Daten in den DOM schreiben in das Objekt mit der ID result.
  $("#result").html(`
      <div class="d-flex align-items-start mb-3">
        <img src="${img}" class="rounded me-3 shadow-sm" width="120" height="120" onerror="this.style.display='none'">
        <div class="flex-grow-1">
          <h4>${name}</h4>
          <p class="mb-1"><strong>Bundle ID:</strong> ${bundle}</p>
          <p class="mb-1"><strong>Version:</strong> ${version}</p>
          <p class="mb-1"><strong>Category:</strong> ${genre}</p>
          <p class="mb-1"><strong>Platform:</strong> ${platform}</p>
          <p class="mb-1"><strong>Developer:</strong> ${developer}</p>
          <p class="mb-1"><strong>Description:</strong> ${description.substring(
            0,
            2000
          )}${description.length > 2000 ? "…" : ""}</p>
          <a href="${appStoreUrl}" class="btn btn-outline-primary btn-sm mt-2" target="_blank">Open in App Store
  </a>
          <button class="btn btn-success btn-sm mt-2 save-fav" data-bundle="${bundle}" data-name="${name}" data-art="${DOMPurify.sanitize(
    app.artworkUrl60 || ""
  )}">Save to Favorites</button>
        </div>
      </div>
    `);
}

/**
 * Event Listener für den Such-Button. Startet die App Abfrage und Ergebnisfilter.
 */
searchButton.on("click", async function (e) {
  e.preventDefault(); //verhindet das Neuladen der Seite beim Absenden vom Formular
  const input = searchTermInput.val(); //Suchbegriff vom User holen
  const apps = await getProcessedApps(input);
  console.log("wir sind beim searchButton-Eventlistener. " + apps); //debug
  //Steuerung für weiteren Ablauf
  const appliedDevFilter = filter.filterDeveloper(apps); //Entwicklerfilter anwenden
  const appliedPlatformFilter = filter.filterPlatform(appliedDevFilter); //Platformfilter anwenden
  displayApp(appliedPlatformFilter);
});

//------------------------
//Hauptfunktionen
//------------------------
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
          apiHandler.iTunesSearchAPI(input, "desktop", "", 25)
        );
      } catch (error) {
        //Error handling
        console.error(
          "Fehler bei der macOS-spezifischen iTunes API-Ajax Abfrage:",
          error.message
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
          apiHandler.iTunesSearchAPI(input, "mobile", "", 25)
        );
      } catch (error) {
        console.error("Fehler bei der iTunes API-Ajax Abfrage:", error.message); //Error handling
      }

      return combineResults(searchPromises);
    }

    //---------Suche nach ID.---------
  } else if (selectedSearchMode === "id") {
    try {
      //Ajax Abfrage mit Error Handling
      const apiResponse = await apiHandler.appIdLookup(input); //Ajax Abfrage starten und bei Erfolg Erebnis speichern
      const apps = apiResponse.results; //Umwandlung zu normalem Array für einfachere Handhabung
      return apps;
    } catch (error) {
      console.error("Fehler bei der iTunes API-Ajax Abfrage:", error.message); //Error handling
    }
  } else {
    //Error bei der Auswahl vom Suchmodus
    console.error("Unbekannte Suchmodus Auswahl");
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
    console.log("test" + combinedResults);
    return combinedResults;
  } catch (error) {
    //Error handling wenn mindestens eine der Anfragen fehlschlägt
    console.error("Fehler bei der kombinierten Suche:", error);
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
 * Event Listener für das Entwickler-Eingabefeld
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
      console.error("Fehler bei der kombinierten Entwicklersuche:", error);
      return []; //Leeres Array zurückgeben, damit die UI nicht crasht
    }
  }, 300)
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
      //Resultate dem User anzeigen
      ui.populateSuggestions(
        softwareSuggestions,
        combinedResults,
        searchTermInput
      );
    } catch (error) {
      //Error handling
      console.error("Fehler bei der Softwaresuche:", error);
      return []; //Leeres Array zurückgeben, damit die UI nicht crasht
    }
  }, 300)
);
