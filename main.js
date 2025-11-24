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
//Output
//------------------------

function displayApp(app) {
  //Benötigte Infos aus App Objekt extrahieren (DOMPurify entfernt schädlichen code, || "" ist ein fallback falls es diesen Eintrag nicht gibt.)
  //DOMPurify siehe https://github.com/cure53/DOMPurify
  console.log("DisplayApp erhält diese Daten aps PArameter: ", app.results);

  if (app.results.length >= 0) {
    app = app.results[0];
  } else {
    console.error("API Error - Keine App Daten gefunden");
    return;
  }
  const img = DOMPurify.sanitize(app.artworkUrl512 || app.artworkUrl100 || "");
  const name = DOMPurify.sanitize(app.trackName || "");
  const bundle = DOMPurify.sanitize(app.bundleId || "");
  const version = DOMPurify.sanitize(app.version || "");
  const genre = DOMPurify.sanitize(app.primaryGenreName || "");
  const platform = DOMPurify.sanitize(getPlatform(app));
  const description = DOMPurify.sanitize(app.description || "");
  const developer = DOMPurify.sanitize(app.sellerName || "");
  const appStoreUrl = DOMPurify.sanitize(app.trackViewUrl || "#");

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

  console.log("supported Array: ", supported);
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

/**
 * Filtert das Resultat nach dem angegebenen Entwickler
 * @param {*} data data Objekt aus einer ajax Abfrage
 */
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

function filterPlatform(data) {
  //todo
  //use getPlatform()
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

  if (selectedSearchMode === "name") {
    //Suche nach String
    try {
      //Ajax Abfrage mit Error Handling
      const data = await apiHandler.softwareSearch(input); //Ajax Abfrage starten und bei Erfolg Erebnis speichern
      filterDeveloper(data); //Filter anwenden
      console.log("Results from main: ", data.results); //debug
    } catch (error) {
      console.error("Fehler im Erfolgsbeispiel:", error.message); //Error handling
    }
  } else if (selectedSearchMode === "id") {
    //Suche nach ID.
    try {
      //Ajax Abfrage mit Error Handling
      const data = await apiHandler.appIdLookup(input); //Ajax Abfrage starten und bei Erfolg Erebnis speichern
      console.log("Results from main: ", data.results);
      displayApp(data);
    } catch (error) {
      console.error("Fehler im Erfolgsbeispiel:", error.message); //Error handling
    }
  } else {
    //Error bei der Auswahl vom Suchmodus
    console.error("Unbekannte Suchmodus Auswahl");
  }
});

//apiHandler.appIdLookup("909253");
//apiHandler.softwareSearch("spotify");
//apiHandler.developerSearch("Microsoft");
