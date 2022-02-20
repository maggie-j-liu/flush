const isBlocked = () => {
  return window.location.origin === "https://svelte.dev";
};

const redirect = () => {
  window.location = `${chrome.runtime.getURL("index.html")}?site=${
    window.location.href
  }`;
};

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
