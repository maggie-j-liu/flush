console.log(document.location.href);
if (document.location.href.startsWith("https://svelte.dev")) {
  window.location.assign(
    `${chrome.runtime.getURL("index.html")}?site=${document.location.href}`
  );
}
