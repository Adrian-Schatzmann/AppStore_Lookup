$(function () {
  const suggestionBox = $("#suggestions");
  const lookupValue = $("#lookupValue");
  const HISTORY_KEY = "lookupHistory_v2";
  const FAVORITES_KEY = "lookupFavorites_v2";
  const MAX_ITEMS = 20;

  initAll();

  function initAll() {
    renderHistory();
    renderFavorites();
    // initiale Dropdown-Einstellung
    if ($("#lookupType").val() === "name") {
      lookupValue.attr("data-bs-toggle", "dropdown");
    } else {
      lookupValue.removeAttr("data-bs-toggle");
    }
  }

  function saveList(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function loadList(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function addUnique(list, item, idKey = "bundleId") {
    const filtered = list.filter((x) => x[idKey] !== item[idKey]);
    filtered.unshift(item);
    return filtered.slice(0, MAX_ITEMS);
  }

  function renderHistory() {
    const list = loadList(HISTORY_KEY);
    const target = $("#historyList");
    target.empty();
    if (!list.length) {
      target.append(`<div class="text-muted small">Keine Eintraege</div>`);
      return;
    }
    list.forEach((app) => {
      target.append(`
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div class="d-flex align-items-center">
            <img src="${app.artworkUrl60 || ''}" class="rounded me-2" width="40" height="40" onerror="this.style.display='none'">
            <div>
              <div class="small fw-semibold">${escapeHtml(app.trackName)}</div>
              <div class="small text-muted">${escapeHtml(app.bundleId)}</div>
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-primary load-history" data-bundle="${encodeURIComponent(app.bundleId)}">Laden</button>
            <button class="btn btn-sm btn-outline-danger ms-1 remove-history" data-bundle="${encodeURIComponent(app.bundleId)}">Entfernen</button>
          </div>
        </div>
      `);
    });
  }

  function renderFavorites() {
    const list = loadList(FAVORITES_KEY);
    const target = $("#favoritesList");
    target.empty();
    if (!list.length) {
      target.append(`<div class="text-muted small">Keine Favoriten</div>`);
      return;
    }
    list.forEach((app) => {
      target.append(`
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div class="d-flex align-items-center">
            <img src="${app.artworkUrl60 || ''}" class="rounded me-2" width="40" height="40" onerror="this.style.display='none'">
            <div>
              <div class="small fw-semibold">${escapeHtml(app.trackName)}</div>
              <div class="small text-muted">${escapeHtml(app.bundleId)}</div>
            </div>
          </div>
          <div>
            <button class="btn btn-sm btn-primary load-fav" data-bundle="${encodeURIComponent(app.bundleId)}">Laden</button>
            <button class="btn btn-sm btn-outline-danger ms-1 remove-fav" data-bundle="${encodeURIComponent(app.bundleId)}">Entfernen</button>
          </div>
        </div>
      `);
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getPlatform(app) {
    const kind = app.kind || "";
    const supported = app.supportedDevices || [];
    const isMac = kind.includes("mac") || supported.some(d => d.toLowerCase().includes("mac"));
    const isIOS = !isMac;
    if (isMac && isIOS) return "Universal";
    if (isMac) return "Mac";
    return "iOS";
  }

  $("#lookupType").on("change", function () {
    lookupValue.val("");
    clearSuggestions();
    if ($(this).val() === "name") {
      $("#lookupLabel").text("Appname");
      lookupValue.attr("placeholder", "Facebook");
      lookupValue.attr("data-bs-toggle", "dropdown");
    } else {
      $("#lookupLabel").text("AppStore ID");
      lookupValue.attr("placeholder", "123456789");
      lookupValue.removeAttr("data-bs-toggle");
    }
  });

  // Autocomplete
  lookupValue.on("input", function () {
    const type = $("#lookupType").val();
    const query = $(this).val().trim();
    clearSuggestions();
    if (type !== "name" || query.length < 2) return;

    const entity = $("#platformSwitch").is(":checked") ? "macSoftware" : "software";

    $.ajax({
      url: `https://itunes.apple.com/search`,
      dataType: "jsonp",
      data: {
        term: query,
        entity: entity,
        limit: 8
      },
      success: function(data){
        if (!data.results || !data.results.length) return;

        data.results.forEach((app) => {
          suggestionBox.append(`
            <button type="button"
              class="dropdown-item d-flex align-items-center suggestion-item"
              data-bundle="${escapeHtml(app.bundleId)}"
              data-track="${escapeHtml(app.trackName)}"
              data-art="${escapeHtml(app.artworkUrl60 || '')}"
            >
              <img src="${app.artworkUrl60}" class="rounded me-2" width="40" height="40" onerror="this.style.display='none'">
              <div>
                <div class="small fw-semibold">${escapeHtml(app.trackName)}</div>
                <div class="small text-muted">${escapeHtml(app.bundleId)}</div>
              </div>
            </button>
          `);
        });
        suggestionBox.addClass("show");
      }
    });
  });

  // Klick auf Vorschlag
$(document).on("click", ".suggestion-item", function () {
    const bundle = $(this).data("bundle");
    const name = $(this).data("track");
    clearSuggestions();
    lookupValue.val(name); // optional, Inputfeld auffüllen

    if (bundle) {
        // Direkt nachschlagen per Bundle ID
        lookupByBundle(bundle);
    } else {
        // Fallback: falls Bundle fehlt, über Name suchen
        $("#lookupButton").trigger("click");
    }
});


  // Lookup per Button
  $("#lookupButton").on("click", function () {
    const type = $("#lookupType").val();
    const value = lookupValue.val().trim();
    const isMac = $("#platformSwitch").is(":checked");
    const entity = isMac ? "macSoftware" : "software";

    if (!value) {
      $("#result").text("Bitte Eingabe machen.");
      return;
    }

    if (type === "id") {
      lookupByBundle(value);
    } else {
      $.ajax({
        url: "https://itunes.apple.com/search",
        dataType: "jsonp",
        data: {
          term: value,
          entity: entity,
          limit: 1
        },
        success: function(data){
          if (!data.results || !data.results.length) {
            $("#result").text("Keine Ergebnisse gefunden.");
            return;
          }
          const app = data.results[0];
          displayApp(app);
          persistHistory(app);
        }
      });
    }
  });

  function lookupByBundle(bundleId) {
    $.ajax({
      url: "https://itunes.apple.com/lookup",
      dataType: "jsonp",
      data: { bundleId: bundleId },
      success: function(data){
        if (!data.results || !data.results.length) {
          $("#result").text("Keine Ergebnisse gefunden.");
          return;
        }
        const app = data.results[0];
        displayApp(app);
        persistHistory(app);
      }
    });
  }

  function displayApp(app) {
    const img = escapeHtml(app.artworkUrl512 || app.artworkUrl100 || "");
    const name = escapeHtml(app.trackName || "");
    const bundle = escapeHtml(app.bundleId || "");
    const version = escapeHtml(app.version || "");
    const genre = escapeHtml(app.primaryGenreName || "Keine Kategorie");
    const platform = getPlatform(app);
    const description = escapeHtml(app.description || "Keine Beschreibung verfügbar.");
    const appStoreUrl = escapeHtml(app.trackViewUrl || "#");

    $("#result").html(`
      <div class="d-flex align-items-start mb-3">
        <img src="${img}" class="rounded me-3 shadow-sm" width="120" height="120" onerror="this.style.display='none'">
        <div class="flex-grow-1">
          <h4>${name}</h4>
          <p class="mb-1"><strong>Bundle Identifier:</strong> ${bundle}</p>
          <p class="mb-1"><strong>Version:</strong> ${version}</p>
          <p class="mb-1"><strong>Kategorie:</strong> ${genre}</p>
          <p class="mb-1"><strong>Plattform:</strong> ${platform}</p>
          <p class="mb-1"><strong>Entwickler:</strong> ${escapeHtml(app.sellerName || "unbekannt")}</p>
          <p class="mb-1"><strong>Kurzbeschreibung:</strong> ${description.substring(0,200)}${description.length>200?"…":""}</p>
          <a href="${appStoreUrl}" class="btn btn-outline-primary btn-sm mt-2" target="_blank">Im App Store öffnen</a>
          <button class="btn btn-success btn-sm mt-2 save-fav" data-bundle="${bundle}" data-name="${name}" data-art="${escapeHtml(app.artworkUrl60 || '')}">Favorit speichern</button>
        </div>
      </div>
    `);
  }

  function persistHistory(app) {
    const list = loadList(HISTORY_KEY);
    const item = { bundleId: app.bundleId || "", trackName: app.trackName || "", artworkUrl60: app.artworkUrl60 || "" };
    const newList = addUnique(list, item, "bundleId");
    saveList(HISTORY_KEY, newList);
    renderHistory();
  }

  // Favoriten speichern
  $(document).on("click", ".save-fav", function () {
    const bundle = $(this).data("bundle");
    const name = $(this).data("name");
    const art = $(this).data("art") || "";
    if (!bundle) return;
    const list = loadList(FAVORITES_KEY);
    const item = { bundleId: bundle, trackName: name, artworkUrl60: art };
    const newList = addUnique(list, item, "bundleId");
    saveList(FAVORITES_KEY, newList);
    renderFavorites();
  });

  // Favorit laden per Klick
  $(document).on("click", ".load-fav", function () {
    const bundle = decodeURIComponent($(this).data("bundle"));
    if (!bundle) return;
    lookupByBundle(bundle);
  });

  // Favorit entfernen
  $(document).on("click", ".remove-fav", function () {
    const bundle = decodeURIComponent($(this).data("bundle"));
    let list = loadList(FAVORITES_KEY);
    list = list.filter((x) => x.bundleId !== bundle);
    saveList(FAVORITES_KEY, list);
    renderFavorites();
  });

  // Verlauf laden per Klick
  $(document).on("click", ".load-history", function () {
    const bundle = decodeURIComponent($(this).data("bundle"));
    if (!bundle) return;
    lookupByBundle(bundle);
  });

  // Verlauf entfernen
  $(document).on("click", ".remove-history", function () {
    const bundle = decodeURIComponent($(this).data("bundle"));
    let list = loadList(HISTORY_KEY);
    list = list.filter((x) => x.bundleId !== bundle);
    saveList(HISTORY_KEY, list);
    renderHistory();
  });

  function clearSuggestions() {
    suggestionBox.empty().removeClass("show");
  }

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#lookupValue, #suggestions").length) {
      clearSuggestions();
    }
  });

  $("#clearButton").on("click", function () {
    lookupValue.val("");
    $("#result").text("Noch keine Anfrage ausgefuehrt.");
    clearSuggestions();
  });

});
