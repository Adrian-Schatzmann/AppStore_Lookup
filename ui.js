//------------------------
//JS Import
//------------------------
import * as filter from "./filter.js";
import * as localStorageHandler from "./localStorageHandler.js";

//------------------------
//DOM Referenzen
//------------------------
//Findet alle Dropdown-Menüs mit der Klasse 'keep-open'
const platformCheckboxes = $(".platform-dropdown .form-check-input");
const platformButton = $("#platformSelectButton");
const keepOpenMenus = $(".dropdown-menu.keep-open");
const developerInput = $("#developerInput");
const favoritesList = $("#favoritesList");
const resultField = $("#result");
const softwareSuggestions = $("#softwareSuggestions");
const searchTermInput = $("#searchTermInput");

//Mapping für Plattform-Icons als Inline SVGs (Das gibt es unglaublicherweise tatsächlich!!)
const platformIcons = {
  iOS: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-phone" viewBox="0 0 16 16"><path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/><path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`,
  iPadOS: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-tablet" viewBox="0 0 16 16"><path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/><path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`,
  macOS: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-laptop" viewBox="0 0 16 16"><path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5h11zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2h-11zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5z"/></svg>`,
  tvOS: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-tv" viewBox="0 0 16 16"><path d="M2.5 13.5A.5.5 0 0 1 3 13h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zM13.991 3l.024.001a1.46 1.46 0 0 1 .538.143.757.757 0 0 1 .302.254c.067.1.145.277.145.602v5.991l-.001.024a1.464 1.464 0 0 1-.143.538.758.758 0 0 1-.254.302c-.1.067-.277.145-.602.145H2.009l-.024-.001a1.464 1.464 0 0 1-.538-.143.758.758 0 0 1-.302-.254C1.078 10.502 1 10.325 1 10V4.009l.001-.024a1.46 1.46 0 0 1 .143-.538.758.758 0 0 1 .254-.302C1.498 3.078 1.675 3 2 3h11.991zM14 2H2C0 2 0 4 0 4v6c0 2 2 2 2 2h12c2 0 2-2 2-2V4c0-2-2-2-2-2z"/></svg>`,
  watchOS: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-smartwatch" viewBox="0 0 16 16"><path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V5z"/><path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666c.92 0 1.667-.746 1.667-1.667v-.383a2.5 2.5 0 0 0 2-2.45V4.5a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.254 0 10.333 0H5.667C4.747 0 4 .746 4 1.667zM4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3z"/></svg>`,
};

//------------------------
//Hilfsfunktionen
//------------------------
/**
 * Erstellt Containerm mit passenden Platform Icons
 * @param {*} item App Objekt
 * @returns jQuery Div Container mit den Platformicons für die jeweilige App
 */
function createPlatformIconContainer(item) {
  const platforms = filter.getPlatforms(item); //Platform für die aktuelle App holen
  const iconContainer = $("<div>").addClass(
    "d-flex align-items-center gap-1 ms-auto opacity-50"
  ); //container erstellen
  //passende icons dem Container hinzufügen
  platforms.forEach((plat) => {
    if (platformIcons[plat]) {
      const icon = $(platformIcons[plat]).attr("title", plat);
      iconContainer.append(icon);
    }
  });
  return iconContainer;
}

/**
 * Schreibt eine Fehlermeldung für den User sichtbar in das Resultat-Div
 * @param {*} message Fehlermeldung
 */
export function displayError(message) {
  resultField.html(message);
  resultField.removeClass("text-muted");
  resultField.addClass("alert alert-danger");
}

/**
 * Setzt Formatierungen nach Fehlermeldung zurück
 */
export function resetErrorMessage() {
  resultField.html("");
  resultField.addClass("text-muted");
  resultField.removeClass("alert alert-danger");
}

/**
 * Schliesst das Dropdown Menü der App-Vorschläge
 */
export function closeSuggestionDropdown() {
  softwareSuggestions.removeClass("show").empty();
}

/**
 * Aktualisiert den Button-Text
 */
function updatePlatformButtonText() {
  //Filtere nach 'checked'
  const checkedCheckboxes = Array.from(platformCheckboxes).filter(
    (checkbox) => checkbox.checked
  );

  if (checkedCheckboxes.length > 0) {
    //Erstelle ein Array mit den Texten der Labels
    const selectedLabels = checkedCheckboxes.map(function (checkbox) {
      // Nimm den Text vom .form-check-label (dem nächsten Element)
      return checkbox.nextElementSibling.textContent;
    });

    // Setze den Button-Text, getrennt mit Komma
    platformButton.text(selectedLabels.join(", "));
  } else {
    // Setze den Text zurück, wenn nichts ausgewählt ist
    platformButton.text("Select Platforms");
  }
}

export function initializeUI() {
  //Verbesserung der Bootstrap Dropdown Menüs
  keepOpenMenus.each(function () {
    $(this).on("click", function (e) {
      e.stopPropagation(); //Verhindert, dass ein Klick *innerhalb* des Menüs das Menü schliesst
    });
  });

  //Platform Button Text bei Änderung aktualisieren
  platformCheckboxes.on("change", updatePlatformButtonText);
  //Platform Button Text beim Laden der Seite aktualisieren
  updatePlatformButtonText();
}

/**
 * Expandiert den Beschreibungstext einer App bei Klick auf show more.
 */
$(document).on("click", ".expand-btn", function () {
  const parent = $(this).closest("p");
  parent.find(".short-text").hide();
  parent.find(".full-text").show();
  $(this).remove();
});

//------------------------
//Hauptfunktionen
//------------------------
/**
 * Universelle Funktion für Dropdown-Vorschläge.
 * Erkennt automatisch, ob es sich um einfache Strings (Entwickler)
 * oder App-Objekte (mit Icon/BundleID) handelt.
 * @param {HTMLElement} suggestionsContainer Das Dropdown-DOM-Element
 * @param {Array} results Array von Strings ODER App-Objekten
 * @param {jQuery} targetInput Bei Klick auf ein Dropdown Element wird der Inhalt in dieses Feld geschrieben
 */
export function populateSuggestions(
  suggestionsContainer,
  results,
  targetInput
) {
  //Container leeren und ausblenden
  suggestionsContainer.removeClass("show").empty();

  if (!results || results.length === 0) return;

  //Max 20 Vorschläge anzeigen
  results.slice(0, 20).forEach((item) => {
    let itemButton;
    let valueToInsert;

    // --- FALL 1: App-Objekt (mit Bild und Details) ---
    if (typeof item === "object" && item !== null) {
      const name = item.trackName || "Unbekannt";
      const iconUrl = item.artworkUrl60 || "";
      const bundleId = item.bundleId || "";
      valueToInsert = name; //Was ins Input-Feld geschrieben wird

      //Button Container erstellen
      itemButton = $("<button>")
        .attr("type", "button")
        .addClass("dropdown-item d-flex align-items-center py-2")
        .attr("title", name);

      //Icon
      const img = $("<img>")
        .attr("src", iconUrl)
        .addClass("rounded me-3 border")
        .attr("width", "32")
        .attr("height", "32")
        .css("object-fit", "cover");

      //Text Container
      const textDiv = $("<div>").addClass("flex-grow-1 text-truncate");
      const nameSpan = $("<div>").addClass("fw-bold text-truncate").text(name);
      const bundleSpan = $("<small>")
        .addClass("text-muted d-block text-truncate")
        .css("font-size", "0.75rem")
        .text(bundleId);
      textDiv.append(nameSpan).append(bundleSpan);

      //Platformicons
      const iconContainer = createPlatformIconContainer(item);

      //Alles zusammenfügen
      itemButton.append(img).append(textDiv).append(iconContainer);
    }

    // --- FALL 2: Einfacher String (Entwickler) ---
    else {
      valueToInsert = item; //Der String selbst

      itemButton = $("<button>")
        .attr("type", "button")
        .addClass("dropdown-item")
        .text(item)
        .attr("title", item);
    }

    // --- GEMEINSAMER KLICK-HANDLER ---
    itemButton.on("click", (e) => {
      e.preventDefault();
      //Wert ins Inputfeld schreiben
      targetInput.val(valueToInsert);

      //Dropdown schließen
      suggestionsContainer.removeClass("show").empty();

      //Bei Klick auf das Dropdown Element, die Daten direkt anzeigen lassen.
      if (typeof item === "object" && item !== null) {
        let i = [item];
        displayApp(i);
      }
    });

    //Ins DOM hängen
    suggestionsContainer.append(itemButton);
  });

  //Anzeigen
  suggestionsContainer.addClass("show");
}

/**
 * Schreibt Infos zur ersten App aus aus dem Results Objekt in den DOM
 * @param {*} apps Array mit der anzuzeigenden App im Index 0
 * @returns null bei Error
 */
export function displayApp(apps) {
  console.log("App to display: ", apps);
  resultField.empty();
  //Benötigte Infos aus App Objekt extrahieren (DOMPurify entfernt schädlichen code, || "" ist ein fallback falls es diesen Eintrag nicht gibt.)
  //DOMPurify siehe https://github.com/cure53/DOMPurify

  //Extrahieren der ersten App im Array
  let app = "";
  if (apps && apps.length > 0) {
    app = apps[0];
  } else if (searchTermInput.val().length === 0) {
    console.warn("Search with empty input");
    displayError("Search with empty input");
    return;
  } else {
    console.error("API Error - no App data found");
    displayError("API Error - no App data found");
    return;
  }
  //Einzelne Daten extrahieren
  const img = DOMPurify.sanitize(app.artworkUrl512 || app.artworkUrl100 || "");
  const name = DOMPurify.sanitize(app.trackName || "");
  const bundle = DOMPurify.sanitize(app.bundleId || "");
  const id = DOMPurify.sanitize(app.trackId || "");
  const version = DOMPurify.sanitize(app.version || "");
  const genre = DOMPurify.sanitize(app.primaryGenreName || "");
  const platform = filter.getPlatforms(app).join(", ");
  const minimumVersion = DOMPurify.sanitize(app.minimumOsVersion || "");
  const description = DOMPurify.sanitize(app.description || "");
  const developer = DOMPurify.sanitize(app.sellerName || "");
  const contentAdvisoryRating = DOMPurify.sanitize(
    app.contentAdvisoryRating || ""
  );
  const fileSize = DOMPurify.sanitize(
    Math.round(app.fileSizeBytes / 1000000) || ""
  );
  const appStoreUrl = DOMPurify.sanitize(app.trackViewUrl || "#");

  //Daten in den DOM schreiben in das Objekt mit der ID result.
  resultField.removeClass("text-center text-muted");
  resultField.html(`
  <div class="d-flex align-items-start mb-3 resultDiv">
    <img src="${img}" class="rounded me-3 shadow-sm appIcon" width="120" height="120" onerror="this.style.display='none'">
    <div class="flex-grow-1">
      <a href="${appStoreUrl}" target="_blank" class="text-decoration-none"><h4 class="mb-3 text-primary text-break">${name}</h4></a>
      <p class="mb-1"><strong>App ID:</strong> ${id}</p>
      <p class="mb-1"><strong>Bundle ID:</strong> ${bundle}</p>
      <p class="mb-1"><strong>Version:</strong> ${version}</p>
      <p class="mb-1"><strong>Category:</strong> ${genre}</p>
      <p class="mb-1"><strong>Platform:</strong> ${platform}</p>
      <p class="mb-1"><strong>Minimum OS version:</strong> ${minimumVersion}</p>
      <p class="mb-1"><strong>Developer:</strong> ${developer}</p>
      <p class="mb-1"><strong>Age rating:</strong> ${contentAdvisoryRating}</p>
      <p class="mb-1"><strong>File size in MB:</strong> ${fileSize}</p>   
      <p class="mb-1">
        <strong>Description:</strong>
        <span class="short-text">${description.substring(0, 200)}</span>
        <span class="full-text" style="display:none;">${description}</span>
        ${
          description.length > 200
            ? '<button class="expand-btn btn btn-link p-0 ms-1">Expand</button>'
            : ""
        }
      </p>
      <button id="saveFavButton" class="btn btn-primary btn-sm mt-2 save-fav" data-bundle="${bundle}" data-name="${name}" data-art="${DOMPurify.sanitize(
    app.artworkUrl60 || ""
  )}">Save to Favorites</button>
    </div>
  </div>
  `);
  //Event listener für den Favoriten-Button
  const saveFavButton = $("#saveFavButton");
  saveFavButton.on("click", function (e) {
    e.preventDefault(); //Standardverhalten deaktivieren
    localStorageHandler.addFavorites(app.trackId);

    //Custom Event auslösen, um die Favoriten neu zu laden.
    const event = new CustomEvent("reloadFavorites");
    document.dispatchEvent(event);
  });
}

/**
 * Zeigt die Liste der Favoriten an
 * @param {Array} favoriteApps Array von App-Objekten
 */
export function populateFavorites(favoriteApps) {
  favoritesList.html(""); //Liste leeren
  if (!favoriteApps || favoriteApps.length === 0) {
    //Wenn keine Favoriten gefunden werden
    favoritesList.html(
      '<div class="list-group-item text-muted text-center">No favorites saved yet.</div>'
    );
    return;
  }

  favoriteApps.forEach((app) => {
    //Daten extrahieren
    const name = app.trackName || "Unbekannt";
    const iconUrl = app.artworkUrl60 || "";
    const bundleId = app.bundleId || "";
    const id = app.trackId;

    //Container für Listenelemente
    const item = $("<div>").addClass(
      "list-group-item list-group-item-action d-flex align-items-center p-3 gap-3 me-3 border image-text-wrapper"
    );

    //Icon
    const img = $("<img>")
      .attr("src", iconUrl)
      .addClass("rounded border flex-shrink-0")
      .attr("width", "40")
      .attr("height", "40")
      .css("object-fit", "cover");

    //Text-Bereich
    const contentDiv = $("<div>").addClass("flex-grow-1 overflow-hidden w-100");

    //Titel + Icons
    const titleRow = $("<div>").addClass(
      "d-flex align-items-center gap-2 flex-wrap"
    );
    const nameSpan = $("<div>").addClass("fw-bold text-truncate").text(name);

    //Plattform Icons holen und ms-auto entfernen, damit sie links beim Titel kleben
    const platIcons = createPlatformIconContainer(app)
      .removeClass("ms-auto opacity-50")
      .addClass("opacity-75");

    titleRow.append(nameSpan).append(platIcons);

    //ID text
    const bundleSpan = $("<small>")
      .addClass("text-muted d-block text-truncate")
      .text(`${bundleId}, ${id}`);

    contentDiv.append(titleRow).append(bundleSpan);

    //Buttons
    const rightSection = $("<div>").addClass(
      "favoritesRightSection d-flex align-items-center gap-2 ms-auto"
    );

    //Löschen Button
    const deleteBtn = $("<button>")
      .addClass("btn btn-sm btn-danger deleteButton")
      .text("Delete")
      .data("trackId", app.trackId)
      .on("click", (e) => {
        e.preventDefault();
        const idToDelete = $(e.currentTarget).data("trackId");
        localStorageHandler.removeFavorites(idToDelete);
        const event = new CustomEvent("reloadFavorites");
        document.dispatchEvent(event);
      });

    //Details Button
    const detailBtn = $("<button>")
      .addClass("btn btn-sm btn-primary detailsButton")
      .text("Details")
      .on("click", (e) => {
        e.preventDefault();
        displayApp([app]);
        document
          .getElementById("result")
          .scrollIntoView({ behavior: "smooth" });
      });

    rightSection.append(deleteBtn).append(detailBtn);

    // Zusammenfügen
    item.append(img).append(contentDiv).append(rightSection);
    favoritesList.append(item);
  });
}

/**
 * Zeigt eine Liste von CVEs (Sicherheitslücken) im DOM an.
 * @param {Array} cveList Das Array von CVE-Items aus der API
 */
export function displayCVEs(cveList) {
  const cveDomContainer = $("#cve");
  cveDomContainer.empty(); // Container leeren

  if (!cveList || cveList.length === 0) {
    cveDomContainer.html(
      '<div class="text-muted text-center">No critical CVEs found. What a day!</div>'
    );
    return;
  }

  cveList.forEach((item) => {
    //Die API kapselt alles in einem "cve"-Objekt
    const cve = item.cve;

    //Daten extrahieren
    const id = DOMPurify.sanitize(cve.id);
    const source = DOMPurify.sanitize(cve.sourceIdentifier || "unknown");
    const publishedDate = DOMPurify.sanitize(
      new Date(cve.published).toLocaleDateString("de-DE")
    );
    const status = DOMPurify.sanitize(cve.vulnStatus || "unknown");

    //Beschreibung finden (bevorzugt Englisch)
    const descObj =
      cve.descriptions.find((d) => d.lang === "en") || cve.descriptions[0];
    const description = DOMPurify.sanitize(descObj ? descObj.value : "N/A");

    //Score extrahieren (CVSS v3.1 bevorzugt)
    let score = "N/A";
    let severity = "UNKNOWN";

    // Prüfen, ob v3.1 Metriken vorhanden sind
    if (
      cve.metrics &&
      cve.metrics.cvssMetricV31 &&
      cve.metrics.cvssMetricV31.length > 0
    ) {
      const metric = cve.metrics.cvssMetricV31[0].cvssData;
      score = metric.baseScore;
      severity = metric.baseSeverity;
    }

    //HTML Template bauen
    const html = `
    <div class="list-group-item rounded me-3 border p-3">
      <div class="d-flex flex-wrap justify-content-between align-items-start mb-2">      
        <div class="order-1 order-md-2 ms-0 ms-md-auto text-start text-md-end">
          <span class="badge bg-danger fs-6">${score} ${severity}</span>
          <div class="small text-muted mt-1 text-nowrap">${status}</div>
        </div>      
        <div class="order-2 order-md-1 me-2 mb-1">
          <h5 class="mb-0 text-primary text-break">
            <a href="https://nvd.nist.gov/vuln/detail/${id}" target="_blank" class="text-decoration-none">${id}</a>
          </h5>
          <small class="text-muted text-break">Published: ${publishedDate} | Source: ${source}</small>
        </div>
      </div>       
      <p class="mb-2 mt-2 text-break">${description}</p>
    </div>`;
    //In den DOM schreiben
    cveDomContainer.append(html);
  });
}
