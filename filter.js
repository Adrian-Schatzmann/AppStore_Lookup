//------------------------
//Resultatfilter
//------------------------
/**
 * Bestimmt die Plattform einer App aus iTunes Search API
 * Berücksichtigt sowohl supportedDevices als auch die Entity
 * @param {Object} app - App-Objekt aus iTunes API
 * @returns {string} Plattform: "iOS", "iPadOS", "Mac", "Universal", "tvOS", "watchOS", "unknown"
 */
export function getPlatforms(app) {
  const entity = (app.entity || "").toLowerCase();
  const kind = (app.kind || "").toLowerCase(); //Edgecase handling wegen inkonsistenten API Ergebnissen
  //supported ist ein Array von Gerätenamen aus supportedDevices der API (iPadAir2, iPhone12 etc.)
  const supported = app.supportedDevices || [];
  let platformList = [];
  //.some(...) prüft, ob mindestens ein Eintrag die Bedingung erfüllt
  //d.toLowerCase().includes("iphone") → wandelt den Gerätenamen in Kleinbuchstaben und prüft, ob "iphone" darin vorkommt.
  //Ergebnis jeweils true, wenn mindestens ein Eintrag gefunden wurde
  if (supported.some((d) => d.toLowerCase().includes("iphone"))) {
    platformList.push("iOS");
  }
  if (supported.some((d) => d.toLowerCase().includes("ipad"))) {
    platformList.push("iPadOS");
  }
  if (
    supported.some((d) => d.toLowerCase().includes("mac")) ||
    kind === "mac-software"
  ) {
    //kind mac-software wegen edgecase für z.B. iMovie
    console.log("macos filter reached");
    platformList.push("macOS");
  }
  if (
    supported.some((d) => d.toLowerCase().includes("appletv")) ||
    kind === "tv-app" ||
    (app.appletvScreenshotUrls && app.appletvScreenshotUrls.length > 0) ||
    (app.tvosScreenshotUrls && app.tvosScreenshotUrls.length > 0)
  ) {
    platformList.push("tvOS");
  }
  if (supported.some((d) => d.toLowerCase().includes("watch"))) {
    platformList.push("watchOS");
  }
  return platformList;
}

/**
 * Filtert das Resultat nach dem angegebenen Entwickler
 * @param {*} apps apps Array mit Apps aus einer ajax Abfrage
 * @returns Nach Entwickler gefiltertes apps Array
 */
export function filterDeveloper(apps) {
  const selectedDeveloper = document.getElementById("developerInput").value; //Gewählten Entwickler holen
  let filteredApps = [];
  //Funktion überspringen wenn kein Entwickler angegeben wurde. Weigergeben an nächsten Filterschritt
  if (!selectedDeveloper) {
    console.log("Keine Entwicklersuche"); //debug
    return apps;
  }

  for (const app of apps) {
    if (app.sellerName === selectedDeveloper) {
      filteredApps.push(app);
      console.log("Treffer:", app.trackName, "| ID:", app.trackId, "| Developer:", app.sellerName); //debug
    }
  }
  console.log("Nach Entwickler gefilterte Apps: " + filteredApps); //Debug
  return filteredApps;
}

export function filterPlatform(apps) {
  //Benutzerauswahl holen und in ein Array umwandeln
  const selectedPlatforms = $(
    ".platform-dropdown input[type='checkbox']:checked"
  )
    .map(function () {
      return $(this).val();
    })
    .get();

  let filteredApps = [];

  //Keine Filterung bei entsprechender Eingabe. Die restliche Funktion wird übersprungen.
  if (selectedPlatforms.length === 0 || selectedPlatforms.length === 6) {
    console.log("Keine Platformsuche");
    return apps;
  }

  //Schleife durch alle Apps
  for (const app of apps) {
    //erhalte ein Array mit den kompatiblen Platformen
    const appPlatforms = getPlatforms(app);

    //Gibt es irgendeine (some) ausgewählte Plattform, die in den App-Plattformen enthalten (includes) ist?
    if (selectedPlatforms.some((selected) => appPlatforms.includes(selected))) {
      //App zum Output Array hinzufügen
      filteredApps.push(app);
      console.log("Platform Treffer:", app.trackName); //debug
    }
  }

  console.log("Nach Platform gefilterte Apps: " + filteredApps.length); //debug
  return filteredApps;
}