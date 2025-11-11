$(function () {
  // ---------- Localization ----------
  const userLang = navigator.language || navigator.userLanguage;
  const isGerman = userLang.startsWith("de");

const TEXT = {
  appNameLabel: "App Name",
  appIdLabel: "App Store ID",
  placeholderName: "App Name",
  placeholderId: "123456789",
  searchButton: "Search",
  clearButton: "Clear",
  noResults: "No apps found matching your query.",
  apiError: "Unable to reach the iTunes API. Please check your internet connection and try again.",
  noEntries: "No entries",
  noFavorites: "No favorites",
  saveFav: "Save to Favorites",
  openStore: "Open in App Store",
  pleaseEnter: "Please enter a value.",
  developerLabel: "Developer",
  placeholderDeveloper: "Developer Name",
  noDeveloperResults: "No developers found matching your query.",
  selectedPlatformsLabel: "Selected Platform:"
};

  // ---------- DOM References ----------
  const suggestionBox = $("#suggestions");
  const lookupValue = $("#lookupValue");
  const developerInput = $("#developerInput");
  const developerSuggestionBox = $("#developerSuggestions");
  const selectedPlatformsDisplay = $('<div id="selectedPlatforms" class="mt-2 small text-muted"></div>');

  const HISTORY_KEY = "lookupHistory_v2";
  const FAVORITES_KEY = "lookupFavorites_v2";
  const MAX_ITEMS = 20;
  let currentPlatform = "ios";
  let selectedDeveloper = "";

  // ---------- Initialize ----------
  initAll();

  function initAll() {
    $("#lookupLabel").text(TEXT.appNameLabel);
    lookupValue.attr("placeholder", TEXT.placeholderName);
    $("#lookupButton").text(TEXT.searchButton);
    $("#clearButton").text(TEXT.clearButton);

    // Place selectedPlatformsDisplay below the entire platform selection (outside dropdown)
    // Find the platform button container and insert after it
    var $platformContainer = $("#platformIOS").parent().parent();
    $platformContainer.after(selectedPlatformsDisplay);

    updateSelectedPlatformsDisplay();

    renderHistory();
    renderFavorites();
  }

  // ---------- Utility ----------
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function saveList(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }
  function loadList(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; } }
  function addUnique(list, item, idKey = "bundleId") { const filtered=list.filter(x=>x[idKey]!==item[idKey]); filtered.unshift(item); return filtered.slice(0,MAX_ITEMS); }

  // ---------- Platform Buttons ----------
  $("#platformIOS").on("click", function() {
    currentPlatform = "ios";
    $(this).addClass("btn-primary active").removeClass("btn-outline-primary");
    $("#platformMac").addClass("btn-outline-primary").removeClass("btn-primary active");
    updateSelectedPlatformsDisplay();
  });

  $("#platformMac").on("click", function() {
    currentPlatform = "mac";
    $(this).addClass("btn-primary active").removeClass("btn-outline-primary");
    $("#platformIOS").addClass("btn-outline-primary").removeClass("btn-primary active");
    updateSelectedPlatformsDisplay();
  });

  function updateSelectedPlatformsDisplay() {
    let displayText = TEXT.selectedPlatformsLabel + " ";
    if (currentPlatform === "ios") displayText += "iOS";
    else if (currentPlatform === "mac") displayText += "Mac";
    else displayText += currentPlatform;
    selectedPlatformsDisplay.text(displayText);
  }

  // ---------- Get Platform per App ----------
  function getPlatform(app) {
    const kind = app.kind || "";
    const supported = app.supportedDevices || [];
    const isMac = kind.includes("mac") || supported.some(d => d.toLowerCase().includes("mac"));
    const isIOS = !isMac;
    if (isMac && isIOS) return "Universal";
    if (isMac) return "Mac";
    return "iOS";
  }

  // ---------- Autocomplete ----------
  lookupValue.on("input", function () {
    const type = $("#lookupType").val();
    const query = $(this).val().trim();
    clearSuggestions();
    if (type !== "name" || query.length < 2) return;

    const entity = currentPlatform === "mac" ? "macSoftware" : "software";

    let dataParams = { term: query, entity: entity, limit: 8 };
    if(selectedDeveloper) {
      dataParams.attribute = "softwareDeveloper";
      dataParams.term = selectedDeveloper;
    }

    $.ajax({
      url: "https://itunes.apple.com/search",
      dataType: "jsonp",
      data: dataParams,
      success: function(data) {
        if (!data.results || !data.results.length) {
          $("#result").html(`<div class="alert alert-warning">${TEXT.noResults}</div>`);
          return;
        }
        data.results.forEach(app => {
          suggestionBox.append(`
            <button type="button" class="dropdown-item d-flex align-items-center suggestion-item"
              data-bundle="${escapeHtml(app.bundleId)}"
              data-track="${escapeHtml(app.trackName)}"
              data-art="${escapeHtml(app.artworkUrl60||'')}">
              <img src="${app.artworkUrl60}" class="rounded me-2" width="40" height="40" onerror="this.style.display='none'">
              <div>
                <div class="small fw-semibold">${escapeHtml(app.trackName)}</div>
                <div class="small text-muted">${escapeHtml(app.bundleId)}</div>
              </div>
            </button>
          `);
        });
        suggestionBox.addClass("show");
      },
      error: function() {
        $("#result").html(`<div class="alert alert-danger">${TEXT.apiError}</div>`);
      }
    });
  });

  // ---------- Developer Autocomplete ----------
  developerInput.on("input", function () {
    const query = $(this).val().trim();
    developerSuggestionBox.empty();
    if(query.length < 2) return;

    $.ajax({
      url: "https://itunes.apple.com/search",
      dataType: "jsonp",
      data: { term: query, attribute: "softwareDeveloper", entity: "software", limit: 8 },
      success: function(data) {
        if (!data.results || !data.results.length) {
          developerSuggestionBox.append(`<div class="list-group-item disabled">${TEXT.noDeveloperResults}</div>`);
          return;
        }
        // Extract unique developers from results
        const seenDevelopers = new Set();
        data.results.forEach(app => {
          const devName = app.sellerName || "";
          if(devName && !seenDevelopers.has(devName)) {
            seenDevelopers.add(devName);
            developerSuggestionBox.append(`
              <button type="button" class="list-group-item list-group-item-action developer-suggestion-item">${escapeHtml(devName)}</button>
            `);
          }
        });
      },
      error: function() {
        // silently ignore developer lookup errors
      }
    });
  });

  // ---------- Click Developer Suggestion ----------
  $(document).on("click", ".developer-suggestion-item", function () {
    const devName = $(this).text();
    selectedDeveloper = devName;
    developerInput.val(devName);
    developerSuggestionBox.empty();
    clearSuggestions();
  });

  // ---------- Click Suggestion ----------
  $(document).on("click", ".suggestion-item", function () {
    const bundle = $(this).data("bundle");
    const name = $(this).data("track");
    clearSuggestions();
    lookupValue.val(name);
    if (bundle) lookupByBundle(bundle);
  });

  // ---------- Lookup ----------
  $("#lookupButton").on("click", function () {
    const type = $("#lookupType").val();
    const value = lookupValue.val().trim();
    if (!value) { $("#result").text(TEXT.pleaseEnter); return; }

    if (type === "id") lookupByBundle(value);
    else {
      const entity = currentPlatform === "mac" ? "macSoftware" : "software";
      let dataParams = { term: value, entity: entity, limit: 1 };
      if(selectedDeveloper) {
        dataParams.attribute = "softwareDeveloper";
        dataParams.term = selectedDeveloper;
      }
      $.ajax({
        url: "https://itunes.apple.com/search",
        dataType: "jsonp",
        data: dataParams,
        success: function(data){
          if (!data.results || !data.results.length) {
            $("#result").html(`<div class="alert alert-warning">${TEXT.noResults}</div>`);
            return;
          }
          const app = data.results[0];
          displayApp(app);
          persistHistory(app);
        },
        error: function() {
          $("#result").html(`<div class="alert alert-danger">${TEXT.apiError}</div>`);
        }
      });
    }
  });

  function lookupByBundle(bundleId){
    $.ajax({
      url: "https://itunes.apple.com/lookup",
      dataType: "jsonp",
      data: { bundleId },
      success: function(data){
        if (!data.results || !data.results.length) {
          $("#result").html(`<div class="alert alert-warning">${TEXT.noResults}</div>`);
          return;
        }
        const app = data.results[0];
        displayApp(app);
        persistHistory(app);
      },
      error: function() {
        $("#result").html(`<div class="alert alert-danger">${TEXT.apiError}</div>`);
      }
    });
  }

  // ---------- Display App ----------
  function displayApp(app){
    const img = escapeHtml(app.artworkUrl512 || app.artworkUrl100 || "");
    const name = escapeHtml(app.trackName || "");
    const bundle = escapeHtml(app.bundleId || "");
    const version = escapeHtml(app.version || "");
    const genre = escapeHtml(app.primaryGenreName || "");
    const platform = getPlatform(app);
    const description = escapeHtml(app.description || "");
    const developer = escapeHtml(app.sellerName || "");
    const appStoreUrl = escapeHtml(app.trackViewUrl || "#");

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
          <p class="mb-1"><strong>Description:</strong> ${description.substring(0,200)}${description.length>200?"…":""}</p>
          <a href="${appStoreUrl}" class="btn btn-outline-primary btn-sm mt-2" target="_blank">${TEXT.openStore}</a>
          <button class="btn btn-success btn-sm mt-2 save-fav" data-bundle="${bundle}" data-name="${name}" data-art="${escapeHtml(app.artworkUrl60||'')}">${TEXT.saveFav}</button>
        </div>
      </div>
    `);
  }

  // ---------- History & Favorites ----------
  function persistHistory(app){
    const list = loadList(HISTORY_KEY);
    const item = { bundleId: app.bundleId||"", trackName: app.trackName||"", artworkUrl60: app.artworkUrl60||"" };
    saveList(HISTORY_KEY, addUnique(list,item,"bundleId"));
    renderHistory();
  }

  function renderHistory() {
    const list = loadList(HISTORY_KEY);
    const target = $("#historyList");
    target.empty();
    if (!list.length) { target.append(`<div class="text-muted small">${TEXT.noEntries}</div>`); return; }
    list.forEach(app=>{
      target.append(`
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div class="d-flex align-items-center">
            <img src="${app.artworkUrl60||''}" class="rounded me-2" width="40" height="40" onerror="this.style.display='none'">
            <div>
              <div class="small fw-semibold">${escapeHtml(app.trackName)}</div>
              <div class="small text-muted">${escapeHtml(app.bundleId)}</div>
            </div>
          </div>
          <div class="d-flex flex-column flex-sm-row gap-1">
            <button class="btn btn-sm btn-primary load-history" data-bundle="${encodeURIComponent(app.bundleId)}">Load</button>
            <button class="btn btn-sm btn-outline-danger ms-1 remove-history" data-bundle="${encodeURIComponent(app.bundleId)}">Remove</button>
          </div>
        </div>
      `);
    });
  }

  function renderFavorites() {
    const list = loadList(FAVORITES_KEY);
    const target = $("#favoritesList");
    target.empty();
    if (!list.length) { target.append(`<div class="text-muted small">${TEXT.noFavorites}</div>`); return; }
    list.forEach(app=>{
      target.append(`
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div class="d-flex align-items-center">
            <img src="${app.artworkUrl60||''}" class="rounded me-2" width="40" height="40" onerror="this.style.display='none'">
            <div>
              <div class="small fw-semibold">${escapeHtml(app.trackName)}</div>
              <div class="small text-muted">${escapeHtml(app.bundleId)}</div>
            </div>
          </div>
          <div class="d-flex flex-column flex-sm-row gap-1">
            <button class="btn btn-sm btn-primary load-fav" data-bundle="${encodeURIComponent(app.bundleId)}">Load</button>
            <button class="btn btn-sm btn-outline-danger ms-1 remove-fav" data-bundle="${encodeURIComponent(app.bundleId)}">Remove</button>
          </div>
        </div>
      `);
    });
  }

  // ---------- Event delegation ----------
  $(document).on("click",".save-fav",function(){
    const bundle=$(this).data("bundle"),name=$(this).data("name"),art=$(this).data("art")||"";
    const list=loadList(FAVORITES_KEY);
    saveList(FAVORITES_KEY, addUnique(list,{bundleId:bundle,trackName:name,artworkUrl60:art},"bundleId"));
    renderFavorites();
  });

  $(document).on("click",".load-fav, .load-history",function(){
    const bundle=decodeURIComponent($(this).data("bundle"));
    if(bundle) lookupByBundle(bundle);
  });

  $(document).on("click",".remove-fav",function(){
    const bundle=decodeURIComponent($(this).data("bundle"));
    const list=loadList(FAVORITES_KEY).filter(x=>x.bundleId!==bundle);
    saveList(FAVORITES_KEY,list);
    renderFavorites();
  });

  $(document).on("click",".remove-history",function(){
    const bundle=decodeURIComponent($(this).data("bundle"));
    const list=loadList(HISTORY_KEY).filter(x=>x.bundleId!==bundle);
    saveList(HISTORY_KEY,list);
    renderHistory();
  });

  function clearSuggestions(){ suggestionBox.empty().removeClass("show"); }
  $(document).on("click", function(e){ 
    if(!$(e.target).closest("#lookupValue,#suggestions").length) clearSuggestions();
    if(!$(e.target).closest("#developerInput,#developerSuggestions").length) developerSuggestionBox.empty();
  });

  $("#clearButton").on("click", function(){ 
    lookupValue.val(""); 
    developerInput.val("");
    selectedDeveloper = "";
    $("#result").text(TEXT.pleaseEnter); 
    clearSuggestions(); 
    developerSuggestionBox.empty();
  });
});
