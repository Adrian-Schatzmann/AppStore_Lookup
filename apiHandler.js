/**
 * Gibt Infos zu einer spezifischen App zurück, die über die iTunes lookup API geholt werden.
 * @param {*} appID App ID der gesuchten App
 */
export function appIdLookup(appID) {
  const url = "https://itunes.apple.com/lookup"; //API URL

  $.ajax({
    url: url,
    dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
    data: { id: appID }, //Parameter mitgeben
    success: function (data) {
      console.log("Results:", data.results); //Daten zurückgeben
    },
    error: function () {
      //Error handling
      console.error("Network/API error");
    },
  });
}

/**
 * Gibt die wahrscheinlichsten Ergebnisse für den angegebenen Suchbegriff zurück.
 * @param {*} term Suchbegriff für die Software
 */
export function softwareSearch(term) {
  const media = "software";
  const country = "CH"; //Schweizer AppStore
  const entity = "software"; //softwareinfos erhalten, keine Filme, Musik etc.
  const maxResults = 50;

  $.ajax({
    url: "https://itunes.apple.com/search",
    dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
    data: {
      //Parameter mitgeben
      term: term,
      country: country,
      media: media,
      entity: entity,
      limit: maxResults,
    },
    success: function (data) {
      console.log("Results:", data.results);
      callback(data.results);
    },
    error: function () {
      console.error("Network/API error");
    },
  });
}

/**
 * Gibt ein Array mit Entwicklernamen zurück. Duplikate sind bereits entfernt.
 * @param {*} term Suchbegriff für den Entwickler (sollte so genau wie möglich dem Entwicklernamen entsprechen)
 */
export function developerSearch(term) {
  const media = "software";
  const entity = "software"; //softwareinfos erhalten, keine Filme, Musik etc.
  const maxResults = 20;

  $.ajax({
    url: "https://itunes.apple.com/search",
    dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
    data: {
      //Parameter mitgeben
      term: term,
      media: media,
      entity: entity,
      attribute: "softwareDeveloper",
      limit: maxResults,
    },
    success: function (data) {
      //Erstellt ein Array mit eindeutigen Entwicklernamen aus den Ergebnissen
      const developers = [
        ...new Set(data.results.map((app) => app.sellerName)),
      ];
      console.log("Results:", developers);
    },
    error: function () {
      console.error("Network/API error");
    },
  });
}
