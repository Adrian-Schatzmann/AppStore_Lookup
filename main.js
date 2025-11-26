//------------------------
//JS Import
//------------------------
import * as ui from "./ui.js";
import * as apiHandler from "./apiHandler.js";
import * as filter from "./filter.js";

//------------------------
//DOM Referenzen
//------------------------
const lookupButton = document.getElementById("lookupButton");
//Referenzen für das Entwickler-Feature
const developerInput = document.getElementById("developerInput");
const developerSuggestions = document.getElementById("developerSuggestions");
const lookupInput = document.getElementById("lookupValue");
const suggestionsMenu = document.getElementById("suggestions");

//------------------------
//Output
//------------------------
/**
 * Schreibt Infos zur ersten App aus aus dem Results Objekt in den DOM
 * @param {*} apps Array mit der anzuzeigenden App im Index 0
 * @returns null bei Error
 */
function displayApp(apps) {
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

//------------------------
//Main-Ablauf
//------------------------
/**
 * Erkennt das Auslösen einer Suche und startet die entsprechenden Funktionen
 */
lookupButton.addEventListener("click", async function (e) {
  e.preventDefault(); //verhindet das Neuladen der Seite beim Absenden vom Formular

  const selectedSearchMode = document.getElementById("lookupType").value; //Aktuell gewählten Modus holen
  const input = document.getElementById("lookupValue").value; //Suchbegriff vom User holen
  let mobileApps = [];
  let mac_apps = [];

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
        const macOS_apiResponse = await apiHandler.softwareSearch(
          input,
          "desktop"
        ); //Ajax Abfrage spezifisch für macOS starten und bei Erfolg Erebnis speichern
        mac_apps = macOS_apiResponse.results; //Umwandlung zu normalem Array für einfachere Handhabung
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
        //Ajax Abfrage mit Error Handling
        const apiResponse = await apiHandler.softwareSearch(input, "mobile"); //Ajax Abfrage starten und bei Erfolg Erebnis speichern
        mobileApps = apiResponse.results; //Umwandlung zu normalem Array für einfachere Handhabung
      } catch (error) {
        console.error("Fehler bei der iTunes API-Ajax Abfrage:", error.message); //Error handling
      }
    }

    //beide cases zusammenführen
    let combinedResults = [...(mobileApps || []), ...(mac_apps || [])]; //egal welche Kombination vorhanden ist fehlerfrei zusammenführen.
    //Steuerung für weiteren Ablauf
    combinedResults = filter.filterDeveloper(combinedResults); //Entwicklerfilter anwenden
    combinedResults = filter.filterPlatform(combinedResults); //Platformfilter anwenden
    displayApp(combinedResults); //todo! Temporät wird das erste ergebnis angezeigt. Muss aber ins dropdown.

    //---------Suche nach ID.---------
  } else if (selectedSearchMode === "id") {
    try {
      //Ajax Abfrage mit Error Handling
      const apiResponse = await apiHandler.appIdLookup(input); //Ajax Abfrage starten und bei Erfolg Erebnis speichern
      const apps = apiResponse.results; //Umwandlung zu normalem Array für einfachere Handhabung
      displayApp(apps); //Daten aufbereiten und in den DOM schreiben
    } catch (error) {
      console.error("Fehler bei der iTunes API-Ajax Abfrage:", error.message); //Error handling
    }
  } else {
    //Error bei der Auswahl vom Suchmodus
    console.error("Unbekannte Suchmodus Auswahl");
  }
});

//------------------------
//Entwickler-Autocomplete Feature
//------------------------
let debounceTimer;

/**
 * Zeigt die Entwickler-Vorschläge im Dropdown an
 * @param {*} results Array von API-Resultaten
 */
function showDeveloperSuggestions(results) {
  // Container leeren
  developerSuggestions.innerHTML = "";

  if (!results || results.length === 0) {
    developerSuggestions.classList.remove("show"); // Verstecken
    return;
  }

  // Set nutzen, um Duplikate zu entfernen (API liefert oft denselben Dev mehrfach für verschiedene Apps)
  const uniqueDevelopers = [...new Set(results.map((item) => item.artistName))];

  // HTML für jeden Vorschlag erstellen
  uniqueDevelopers.forEach((devName) => {
    const item = document.createElement("button");
    item.type = "button";
    item.classList.add("dropdown-item");
    item.textContent = devName; // Sicherer als innerHTML

    // Klick-Handler für Auswahl
    item.addEventListener("click", () => {
      developerInput.value = devName; // Wert übernehmen
      developerSuggestions.classList.remove("show"); // Dropdown schließen
      developerSuggestions.innerHTML = ""; // Aufräumen
    });

    developerSuggestions.appendChild(item);
  });

  // Dropdown anzeigen
  developerSuggestions.classList.add("show");
}

/**
 * Event Listener für das Entwickler-Eingabefeld
 */
developerInput.addEventListener("input", function () {
  const term = this.value.trim();

  // Laufenden Timer abbrechen
  clearTimeout(debounceTimer);

  if (term.length < 3) {
    developerSuggestions.classList.remove("show");
    return;
  }

  // API-Aufruf um 300ms verzögern
  debounceTimer = setTimeout(async () => {
    try {
      const response = await apiHandler.developerSearch(term);
      showDeveloperSuggestions(response.results);
    } catch (error) {
      console.error("Fehler beim Entwickler-Autocomplete:", error);
    }
  }, 300);
});

// Schließen des Dropdowns, wenn man woanders hinklickt
document.addEventListener("click", function (e) {
  if (
    !developerInput.contains(e.target) &&
    !developerSuggestions.contains(e.target)
  ) {
    developerSuggestions.classList.remove("show");
  }
});
