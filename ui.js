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
  results.slice(0, 20).forEach((item) => {
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
      $itemButton.append($img).append($textDiv);
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
    });

    //Ins DOM hängen
    $(suggestionsContainer).append($itemButton);
  });

  //Anzeigen
  $(suggestionsContainer).addClass("show");
}
