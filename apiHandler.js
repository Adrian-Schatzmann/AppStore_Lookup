/**
 * Gibt Infos zu einer spezifischen App zurück, die über die iTunes lookup API geholt werden.
 * @param {*} appID App ID der gesuchten App
 */
export function appIdLookup(appID) {
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
 */
export function softwareSearch(term, platform) {
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
    const maxResults = 50;

    $.ajax({
      url: "https://itunes.apple.com/search",
      dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
      cache: true, //Verhindert den "&_=timestamp" Parameter. Dieser macht Probleme beim Anwenden der eigenen Parameter.
      data: {
        //Parameter mitgeben
        term: term,
        country: country,
        media: media,
        limit: maxResults,
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
 * Gibt ein Array mit Entwicklernamen zurück. Duplikate sind bereits entfernt.
 * @param {*} term Suchbegriff für den Entwickler (sollte so genau wie möglich dem Entwicklernamen entsprechen)
 */
export function developerSearch(term) {
  return new Promise((resolve, reject) => {
    const media = "software";
    const entity = "software"; //softwareinfos erhalten, keine Filme, Musik etc.
    const maxResults = 20;

    $.ajax({
      url: "https://itunes.apple.com/search",
      dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
      cache: true, //Verhindert den "&_=timestamp" Parameter. Dieser macht Probleme beim Anwenden der eigenen Parameter.
      data: {
        //Parameter mitgeben
        term: term,
        media: media,
        entity: entity,
        attribute: "softwareDeveloper",
        limit: maxResults,
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
