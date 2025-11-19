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
        console.log("Results:", data.results);//Daten zurückgeben
    },
    error: function () {
      //Error handling
      console.error("Network/API error");
    },
  });
}

export function iTunesSearch(searchTerm) {
const entityType = "software";
const maxResults = 10;

$.ajax({
  url: "https://itunes.apple.com/search",
  dataType: "jsonp", //JSONP statt XHR weil XHR ein CORS-Problem verursacht bei der iTunes API
  data: {
//Parameter mitgeben
    term: searchTerm,
    entity: entityType,
    limit: maxResults
  },
  success: function(data) {
    console.log("Results:", data.results);
  },
  error: function() {
    console.error("Network/API error");
  }
});
}