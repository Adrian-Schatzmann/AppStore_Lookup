//------------------------
//DOM Referenzen
//------------------------
//Findet alle Dropdown-Menüs mit der Klasse 'keep-open'
const platformCheckboxes = document.querySelectorAll(".platform-dropdown .form-check-input");
const platformButton = document.getElementById("platformSelectButton");
const keepOpenMenus = document.querySelectorAll(".dropdown-menu.keep-open");
const lookupTypeSelect = document.getElementById("lookupType");
const developerInput = document.getElementById("developerInput");

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
    platformButton.textContent = selectedLabels.join(", ");
  } else {
    // Setze den Text zurück, wenn nichts ausgewählt ist
    platformButton.textContent = "Select Platforms";
  }
}

//------------------------
//Event Listeners
//------------------------
//Verbesserung der Bootstrap Dropdown Menüs
document.addEventListener("DOMContentLoaded", function () {
  keepOpenMenus.forEach(function (menu) {
    //Verhindert, dass ein Klick *innerhalb* des Menüs das Menü schliesst
    menu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    //Abstand hinzufügen, weil wir hier keine eigenes CSS andwenden dürfen...
    menu.style.marginLeft = "10px";
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
lookupTypeSelect.addEventListener("change", function () {
  if (this.value === "id") {
    //Dieser Block wird ausgeführt, wenn "App Store ID" ausgewählt wird.
    //Inputs zurücksetzen und deaktivieren
    platformButton.disabled = true;
    developerInput.value = "";
//    platformCheckboxes.forEach(function (checkbox) {
//     checkbox.checked = keepOpenMenus.checked;
//    });
    updatePlatformButtonText();
    developerInput.disabled = true;
  } else {
    // Dieser Block wird ausgeführt, wenn "App Name" ausgewählt wird.
    //Inputs aktivieren
    platformButton.disabled = false;
    developerInput.disabled = false;
  }
});
