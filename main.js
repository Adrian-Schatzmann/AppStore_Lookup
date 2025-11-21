//------------------------
//JS Import
//------------------------
import * as ui from "./ui.js";
import * as apiHandler from "./apiHandler.js";

//------------------------
//DOM Referenzen
//------------------------
const lookupButton = document.getElementById("lookupButton");

//------------------------
//Resultatfilter
//------------------------
/**
 * Bestimmt die Plattform einer App aus iTunes Search API
 * Berücksichtigt sowohl supportedDevices als auch die Entity
 * @param {Object} app - App-Objekt aus iTunes API
 * @returns {string} Plattform: "iOS", "iPadOS", "Mac", "Universal", "tvOS", "watchOS", "unknown"
 */
function getPlatform(app) {
  const entity = (app.entity || "").toLowerCase();
  //supported ist ein Array von Gerätenamen aus supportedDevices der API (iPadAir2, iPhone12 etc.)
  const supported = app.supportedDevices || [];
  //.some(...) prüft, ob mindestens ein Eintrag die Bedingung erfüllt
  //d.toLowerCase().includes("iphone") → wandelt den Gerätenamen in Kleinbuchstaben und prüft, ob "iphone" darin vorkommt.
  //Ergebnis jeweils true, wenn mindestens ein Eintrag gefunden wurde
  const hasIphone = supported.some((d) => d.toLowerCase().includes("iphone"));
  const hasIpad = supported.some((d) => d.toLowerCase().includes("ipad"));
  const hasMac =
    entity === "macsoftware" ||
    supported.some((d) => d.toLowerCase().includes("mac"));
  const hasAppleTV =
    (app.appletvScreenshotUrls || []).length > 0 || //sucht zusätzlich nach appletvScreenshotUrls -> zuverlässiger als supportedDevices für AppleTV
    supported.some((d) => d.toLowerCase().includes("appletv"));
  const hasWatch = supported.some((d) => d.toLowerCase().includes("watch"));

  // macOS
  if (hasMac) return "Mac";

  // tvOS
  if (hasAppleTV) return "tvOS";

  // watchOS
  if (hasWatch) return "watchOS";

  // iPhone + iPad = Universal
  if (hasIphone && hasIpad) return "Universal";

  // nur iPad
  if (!hasIphone && hasIpad) return "iPadOS";

  // nur iPhone
  if (hasIphone && !hasIpad) return "iOS";

  // Fallback
  console.error(
    "Softwareplattform konnte nicht identifiziert werden! Details: ",
    app
  );
  return "unknown";
}

function filterDeveloper(data) {
  const selectedDeveloper = document.getElementById("developerInput").value; //Gewählten Entwickler holen

  //Funktion überspringen wenn kein Entwickler angegeben wurde. Weigergeben an nächsten Filterschritt
  if (!selectedDeveloper) {
    filterPlatform(result); //TODO fix
  }

  for (const app of data.results) {
    if (app.sellerName === selectedDeveloper) {
      console.log("Treffer:", app.trackName, app.sellerName);
    }
  }
}

function filterPlatform(result) {
//todo implement

}


//------------------------
//Main-Ablauf
//------------------------

lookupButton.addEventListener("click", function (e) {
  e.preventDefault(); //verhindet das Neuladen der Seite beim Absenden vom Formular
  let data = ""; //Variable für Resultate der API Abfragen

  const selectedSearchMode = document.getElementById("lookupType").value; //Aktuell gewählten Modus holen
  const input = document.getElementById("lookupValue").value; //Suchbegriff vom User holen

  if (selectedSearchMode === "name") {
    //Suche nach String
    data = apiHandler.softwareSearch(input);
    filterDeveloper(data);
  } else if (selectedSearchMode === "id") {
    //Suche nach ID
    data = apiHandler.appIdLookup(input);
    console.log(data);
  } else {
    console.error("Unbekannte Suchmodus Auswahl");
  }
});

//apiHandler.appIdLookup("909253");
//apiHandler.softwareSearch("spotify");
//apiHandler.developerSearch("Microsoft");
