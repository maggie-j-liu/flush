(function () {
  'use strict';

  let blockedSites = [];

  const isBlocked = () => {
    return blockedSites.includes(window.location.origin);
  };

  const redirect = () => {
    window.location = `${chrome.runtime.getURL("index.html")}?site=${
    window.location.href
  }`;
  };

  chrome.storage.local.get("sites", (res) => {
    if (res.sites) {
      blockedSites = res.sites;
    }
    if (isBlocked()) {
      chrome.storage.local.get(window.location.origin, (res) => {
        if (
          !res[window.location.origin] ||
          Date.now() > res[window.location.origin]
        ) {
          redirect();
        }
      });
    }
  });

})();
//# sourceMappingURL=content.js.map
