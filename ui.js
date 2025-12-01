//------------------------
//JS Import
//------------------------
import * as filter from "./filter.js";

//------------------------
//DOM Referenzen
//------------------------
//Findet alle Dropdown-Menüs mit der Klasse 'keep-open'
const platformCheckboxes = document.querySelectorAll(
  ".platform-dropdown .form-check-input"
);
const platformButton = $("#platformSelectButton");
const keepOpenMenus = $(".dropdown-menu.keep-open");
const searchMode = $("#searchMode");
const developerInput = $("#developerInput");

//------------------------
//Funktionen
//------------------------
//Diese Funktion aktualisiert den Button-Text
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

//Verbesserung der Bootstrap Dropdown Menüs
keepOpenMenus.each(function () {
  $(this).on("click", function (e) {
    e.stopPropagation(); //Verhindert, dass ein Klick *innerhalb* des Menüs das Menü schliesst
  });
});

//Platform Button Text bei Änderung aktualisieren
platformCheckboxes.forEach(function (checkbox) {
  checkbox.addEventListener("change", updatePlatformButtonText);
});

//------------------------
//Main-Ablauf
//------------------------
//Platform Button Text beim Laden der Seite aktualisieren
updatePlatformButtonText();

platformCheckboxes.forEach(function (menu) {
  //Abstand hinzufügen, weil wir hier keine eigenes CSS andwenden dürfen...
  menu.style.marginLeft = "10px";
});

//Event-Listener für das "Search Mode"-Dropdown
searchMode.on("change", function () {
  if (this.value === "id") {
    //Dieser Block wird ausgeführt, wenn "App Store ID" ausgewählt wird.
    //Inputs zurücksetzen und deaktivieren
    platformButton.prop("disabled", true);
    developerInput.val("");
    //    platformCheckboxes.forEach(function (checkbox) {
    //     checkbox.checked = keepOpenMenus.checked;
    //    });
    updatePlatformButtonText();
    developerInput.prop("disabled", true);
  } else {
    // Dieser Block wird ausgeführt, wenn "App Name" ausgewählt wird.
    //Inputs aktivieren
    platformButton.prop("disabled", false);
    developerInput.prop("disabled", false);
  }
});

//Mapping für Plattform-Icons als Inline SVGs (Das gibt es unglaublicherweise tatsächlich!!)
const platformIcons = {
  "iOS": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-phone" viewBox="0 0 16 16"><path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/><path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`,
  "iPadOS": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-tablet" viewBox="0 0 16 16"><path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z"/><path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/></svg>`,
  "macOS": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-laptop" viewBox="0 0 16 16"><path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5h11zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2h-11zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5z"/></svg>`,
  "tvOS": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-tv" viewBox="0 0 16 16"><path d="M2.5 13.5A.5.5 0 0 1 3 13h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zM13.991 3l.024.001a1.46 1.46 0 0 1 .538.143.757.757 0 0 1 .302.254c.067.1.145.277.145.602v5.991l-.001.024a1.464 1.464 0 0 1-.143.538.758.758 0 0 1-.254.302c-.1.067-.277.145-.602.145H2.009l-.024-.001a1.464 1.464 0 0 1-.538-.143.758.758 0 0 1-.302-.254C1.078 10.502 1 10.325 1 10V4.009l.001-.024a1.46 1.46 0 0 1 .143-.538.758.758 0 0 1 .254-.302C1.498 3.078 1.675 3 2 3h11.991zM14 2H2C0 2 0 4 0 4v6c0 2 2 2 2 2h12c2 0 2-2 2-2V4c0-2-2-2-2-2z"/></svg>`,
  "watchOS": `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-smartwatch" viewBox="0 0 16 16"><path d="M9 5a.5.5 0 0 0-1 0v3H6a.5.5 0 0 0 0 1h2.5a.5.5 0 0 0 .5-.5V5z"/><path d="M4 1.667v.383A2.5 2.5 0 0 0 2 4.5v7a2.5 2.5 0 0 0 2 2.45v.383C4 15.253 4.746 16 5.667 16h4.666c.92 0 1.667-.746 1.667-1.667v-.383a2.5 2.5 0 0 0 2-2.45V4.5a2.5 2.5 0 0 0-2-2.45v-.383C12 .747 11.254 0 10.333 0H5.667C4.747 0 4 .746 4 1.667zM4.5 3h7A1.5 1.5 0 0 1 13 4.5v7a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 3 11.5v-7A1.5 1.5 0 0 1 4.5 3z"/></svg>`
};

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
  $(suggestionsContainer).removeClass("show").empty();

  if (!results || results.length === 0) return;

  //Max 20 Vorschläge anzeigen
  results.slice(0, 50).forEach((item) => {
    let $itemButton;
    let valueToInsert;

    // --- FALL 1: App-Objekt (mit Bild und Details) ---
    if (typeof item === "object" && item !== null) {
      const name = item.trackName || "Unbekannt";
      const iconUrl = item.artworkUrl60 || "";
      const bundleId = item.bundleId || "";
      valueToInsert = name; //Was ins Input-Feld geschrieben wird

      //Button Container erstellen
      $itemButton = $("<button>")
        .attr("type", "button")
        .addClass("dropdown-item d-flex align-items-center py-2")
        .attr("title", name);

      //Icon
      const $img = $("<img>")
        .attr("src", iconUrl)
        .addClass("rounded me-3 border")
        .attr("width", "32")
        .attr("height", "32")
        .css("object-fit", "cover");

      //Text Container
      const $textDiv = $("<div>").addClass("flex-grow-1 text-truncate");
      const $nameSpan = $("<div>").addClass("fw-bold text-truncate").text(name);
      const $bundleSpan = $("<small>")
        .addClass("text-muted d-block text-truncate")
        .css("font-size", "0.75rem")
        .text(bundleId);

      $textDiv.append($nameSpan).append($bundleSpan);

      //Platformicons
      const platforms = filter.getPlatforms(item);
      const $iconContainer = $("<div>")
          .addClass("d-flex align-items-center gap-1 ms-auto opacity-50");

      platforms.forEach(plat => {
          if (platformIcons[plat]) {
              // Icon als HTML String einfügen und Tooltip setzen
              const $icon = $(platformIcons[plat]).attr("title", plat);
              $iconContainer.append($icon);
          }
      });

      $itemButton.append($img).append($textDiv).append($iconContainer);
    }

    // --- FALL 2: Einfacher String (Entwickler) ---
    else {
      valueToInsert = item; //Der String selbst

      $itemButton = $("<button>")
        .attr("type", "button")
        .addClass("dropdown-item")
        .text(item)
        .attr("title", item);
    }

    // --- GEMEINSAMER KLICK-HANDLER ---
    $itemButton.on("click", (e) => {
      e.preventDefault();
      //Wert ins Inputfeld schreiben
      targetInput.val(valueToInsert);

      //Dropdown schließen
      $(suggestionsContainer).removeClass("show").empty();

      //Bei Klick auf das Dropdown Element, die Daten direkt anzeigen lassen.
      if (typeof item === "object" && item !== null) {
        let i = [item];
        displayApp(i);
      }
    });

    //Ins DOM hängen
    $(suggestionsContainer).append($itemButton);
  });

  //Anzeigen
  $(suggestionsContainer).addClass("show");
}

/**
 * Schreibt Infos zur ersten App aus aus dem Results Objekt in den DOM
 * @param {*} apps Array mit der anzuzeigenden App im Index 0
 * @returns null bei Error
 */
export function displayApp(apps) {
  console.log(apps);
  //Benötigte Infos aus App Objekt extrahieren (DOMPurify entfernt schädlichen code, || "" ist ein fallback falls es diesen Eintrag nicht gibt.)
  //DOMPurify siehe https://github.com/cure53/DOMPurify

  //Extrahieren der ersten App im Array
  let app = "";
  if (apps && apps.length > 0) {
    app = apps[0];
  } else {
    console.error("API Error - Keine App Daten gefunden");
    return null;
  }
  //Einzelne Daten extrahieren
  const img = DOMPurify.sanitize(app.artworkUrl512 || app.artworkUrl100 || "");
  const name = DOMPurify.sanitize(app.trackName || "");
  const bundle = DOMPurify.sanitize(app.bundleId || "");
  const id = DOMPurify.sanitize(app.trackId || "");
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
          <p class="mb-1"><strong>App ID:</strong> ${id}</p>
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
