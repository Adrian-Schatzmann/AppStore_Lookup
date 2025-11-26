//------------------------
//JS Import
//------------------------
import * as ui from "./ui.js";
import * as apiHandler from "./apiHandler.js";

//------------------------
//DOM Referenzen
//------------------------
const lookupButton = document.getElementById("lookupButton");
const lookupInput = document.getElementById("lookupValue");
const suggestionsMenu = document.getElementById("suggestions");

//------------------------
// Helper: Debounce (Verzögerung für Tippen)
//------------------------
/**
 * Verhindert, dass eine Funktion zu oft ausgeführt wird (z.B. bei jedem Tastendruck)
 */
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

//------------------------
// Core Logic (Refactored)
//------------------------

/**
 * Führt die Suche und ALLE Filter aus.
 * Wird vom Button UND vom Live-Dropdown verwendet.
 * @returns {Promise<Array>} Gefiltertes Array von Apps
 */
async function getProcessedApps(term, searchMode) {
  let rawApps = [];

  // 1. API Abfragen
  if (searchMode === "name") {
    // Check: Nur macOS gewählt?
    const selectedPlatforms = $(".platform-dropdown input[type='checkbox']:checked")
      .map(function () { return $(this).val().toLowerCase(); })
      .get();
      
    const isOnlyMacSelected =
      selectedPlatforms.length === 1 &&
      selectedPlatforms.some((p) => p === "macos");

    // macOS Suche (wenn nötig)
    let macApps = [];
    if (selectedPlatforms.length === 0 || selectedPlatforms.some((p) => p === "macos")) {
       try {
          const res = await apiHandler.softwareSearch(term, "desktop"); // desktop = macSoftware entity
          macApps = res.results || [];
       } catch(e) { console.error(e); }
    }

    // Mobile Suche (wenn nicht nur Mac)
    let mobileApps = [];
    if (!isOnlyMacSelected) {
       try {
          const res = await apiHandler.softwareSearch(term, "mobile"); // mobile = software entity
          mobileApps = res.results || [];
       } catch(e) { console.error(e); }
    }
    
    // Zusammenführen
    rawApps = [...mobileApps, ...macApps];

  } else if (searchMode === "id") {
    const apiResponse = await apiHandler.appIdLookup(term);
    rawApps = apiResponse.results || [];
  }

  // 2. Filter anwenden (Developer & Plattform)
  // Wir nutzen die existierenden Funktionen, die global oder im Scope verfügbar sind
  let processed = filterDeveloper(rawApps);
  processed = filterPlatform(processed);

  return processed;
}

//------------------------
// Output / UI Functions
//------------------------

function displayApp(apps) {
  // ... (Dein existierender displayApp Code hier unverändert lassen) ...
  if (!apps || apps.length === 0) {
    $("#result").html('<div class="alert alert-warning">Keine Ergebnisse.</div>');
    return;
  }
  const app = apps[0];
  // ... (Rest deiner Funktion) ...
  // Nur zum Test, damit der Code läuft:
  const name = app.trackName || "Unbekannt";
  const bundle = app.bundleId || "N/A";
  const img = app.artworkUrl100 || "";
  
  $("#result").html(`
    <div class="d-flex align-items-start">
        <img src="${img}" class="rounded me-3" width="100">
        <div>
            <h3>${name}</h3>
            <p>${bundle}</p>
        </div>
    </div>
  `);
}

/**
 * Zeigt die Vorschläge im Dropdown an
 */
function showSuggestions(apps) {
  suggestionsMenu.innerHTML = ""; // Leeren
  suggestionsMenu.classList.remove("show");

  if (!apps || apps.length === 0) {
    return;
  }

  // Max 10 Vorschläge anzeigen
  const topApps = apps.slice(0, 10);

  topApps.forEach((app) => {
    const img = app.artworkUrl60 || "";
    const name = app.trackName || "Unbekannt";
    const bundle = app.bundleId || "N/A";
    const dev = app.sellerName || "";

    // List Item erstellen
    const item = document.createElement("a");
    item.className = "dropdown-item d-flex align-items-center py-2";
    item.href = "#";
    item.style.cursor = "pointer";
    
    // HTML Struktur: Bild links, Text rechts
    item.innerHTML = `
      <img src="${img}" class="rounded me-3 border" width="40" height="40" style="object-fit: cover;">
      <div class="flex-grow-1" style="line-height: 1.2;">
        <div class="fw-bold text-truncate" style="max-width: 250px;">${name}</div>
        <small class="text-muted d-block text-truncate" style="max-width: 250px;">${bundle}</small>
        <small class="text-muted" style="font-size: 0.75rem;">${dev}</small>
      </div>
    `;

    // Klick auf Vorschlag
    item.addEventListener("click", (e) => {
      e.preventDefault();
      // Wert ins Input übernehmen
      lookupInput.value = name; // Oder ID, je nach Wunsch
      suggestionsMenu.classList.remove("show");
      
      // App direkt anzeigen
      displayApp([app]); 
    });

    suggestionsMenu.appendChild(item);
  });

  suggestionsMenu.classList.add("show");
}


//------------------------
// Event Listeners (Live Search)
//------------------------

// Funktion für die Live-Suche (Debounced)
const performLiveSearch = debounce(async () => {
  const term = lookupInput.value.trim();
  const searchMode = document.getElementById("lookupType").value;

  if (term.length < 2) {
    suggestionsMenu.classList.remove("show");
    return;
  }

  try {
    const apps = await getProcessedApps(term, searchMode);
    showSuggestions(apps);
  } catch (error) {
    console.error("Live Search Error:", error);
  }
}, 300); // 300ms warten nach dem Tippen

// Trigger 1: Beim Tippen
lookupInput.addEventListener("input", performLiveSearch);

// Trigger 2: Beim Klicken (Focus), falls schon Text da ist
lookupInput.addEventListener("click", () => {
    if (lookupInput.value.trim().length >= 2) {
        performLiveSearch();
    }
});

// Dropdown schließen, wenn man woanders hinklickt
document.addEventListener("click", (e) => {
  if (!lookupInput.contains(e.target) && !suggestionsMenu.contains(e.target)) {
    suggestionsMenu.classList.remove("show");
  }
});


//------------------------
// Main-Ablauf (Button Search)
//------------------------
lookupButton.addEventListener("click", async function (e) {
  e.preventDefault();
  suggestionsMenu.classList.remove("show"); // Dropdown schließen

  const selectedSearchMode = document.getElementById("lookupType").value;
  const input = lookupInput.value.trim();
  const resultDiv = $("#result");

  if (!input) {
    resultDiv.html('<div class="alert alert-danger">Bitte Suchbegriff eingeben.</div>');
    return;
  }

  resultDiv.html('<div class="text-center p-3">Lade Daten...</div>');

  try {
    // Hier nutzen wir jetzt die gleiche Funktion wie das Dropdown! Code gespart!
    const processedApps = await getProcessedApps(input, selectedSearchMode);

    if (processedApps.length > 0) {
      displayApp(processedApps);
    } else {
      resultDiv.html('<div class="alert alert-info">Keine Ergebnisse gefunden (Filter aktiv?).</div>');
    }

  } catch (error) {
    console.error("Fehler:", error);
    resultDiv.html(`<div class="alert alert-danger">Fehler: ${error.message}</div>`);
  }
});

//------------------------
// Existierende Filter Funktionen (Platzhalter für deinen Code)
//------------------------
// ... hier deine filterDeveloper, filterPlatform, getPlatforms Funktionen einfügen ...
// Ich gehe davon aus, dass diese im Scope vorhanden sind.