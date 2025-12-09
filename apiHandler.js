/**
 * Gibt Infos zu einer spezifischen App zurück, die über die iTunes lookup API geholt werden.
 * @param {*} appID App ID der gesuchten App
 */
export function iTunesLookupAPI(appID) {
  return new Promise((resolve, reject) => {
    //Rückgabe der Daten oder eines Fehlers vorbereiten
    const url = "https://itunes.apple.com/lookup"; //API URL
    const country = "CH"; //Schweizer AppStore        //funktioniert noch nicht! das hier geht: https://itunes.apple.com/lookup?id=1542025935&country=CH

    $.ajax({
      //Startet per jQuery eine neue Ajax Abfrage
      url: url,
      dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
      cache: true, //Verhindert den "&_=timestamp" Parameter. Dieser macht Probleme beim Anwenden der eigenen Parameter.
      data: {
        //Parameter mitgeben
        id: appID,
        country: country,
      },
      success: function (data) {
        resolve(data); //Bei Erfolg Daten zurückgeben
      },
      error: function () {
        //Error handling
        reject(new Error("Fehler: Timeout oder ungültige Anfrage."));
      },
    });
  });
}

/**
 * Gibt die wahrscheinlichsten Ergebnisse für den angegebenen Suchbegriff zurück.
 * @param {*} term Suchbegriff für die Software
 * @param {*} platform "desktop" für macOS Apps, "mobile" für alles andere. Standard ist "all".
 * @param {*} attribute "softwareDeveloper" für Entwickleruche, "" für Software.
 * @param {*} limit Maximale Anzahl Ergebnisse (int)
 */
export function iTunesSearchAPI(term, platform, attribute, limit) {
  //Rückgabe der Daten oder eines Fehlers vorbereiten
  return new Promise((resolve, reject) => {
    //Filtere Medientyp anhand des Platformfilters.
    let media = "all";
    if (platform === "desktop") {
      media = "macSoftware";
    } else if (platform === "mobile") {
      media = "software";
    }
    const country = "CH"; //Schweizer AppStore

    $.ajax({
      url: "https://itunes.apple.com/search",
      dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
      cache: true, //Verhindert den "&_=timestamp" Parameter. Dieser macht Probleme beim Anwenden der eigenen Parameter.
      data: {
        //Parameter mitgeben
        term: term,
        country: country,
        media: media,
        attribute: attribute,
        limit: limit,
      },
      success: function (data) {
        resolve(data); //Bei Erfolg Daten zurückgeben
      },
      error: function () {
        //Error handling
        reject(new Error("Fehler: Timeout oder ungültige Anfrage."));
      },
    });
  });
}

/**
 * Fragt die National Vulnerability Database API von NIST nach den heutigen kritischen Sicherheitslücken ab.
 */
export function nistNVDApi() {
  return new Promise((resolve, reject) => {
    const url = "https://services.nvd.nist.gov/rest/json/cves/2.0";

    //Datum berechnen (heute und vor 119 Tagen in ISO-8601)
    const date = new Date();
    const pubEndDate = date.toISOString();
    date.setDate(date.getDate() - 1); //120 Tage wäre ist das Maximum, dass die API erlaubt.
    const pubStartDate = date.toISOString();
    console.log(pubStartDate);
    console.log(pubEndDate);

    //Weitere Parameter
    const severity = "CRITICAL";
    const limit = 5;

    $.ajax({
      url: url,
      dataType: "json",
      cache: true,
      data: {
        cvssV3Severity: severity,
        pubStartDate: pubStartDate,
        pubEndDate: pubEndDate,
        //resultsPerPage: limit,
        //keywordSearch: keyword,
      },
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, status, error) {
        // Error handling mit Details aus dem Request
        reject(new Error(`Fehler: ${status} - ${error}`));
      },
    });
  });
}
