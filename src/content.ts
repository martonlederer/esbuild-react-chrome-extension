/**
 * This is a content script
 * It is used to inject other scripts into
 * the opened windows
 *
 * Read more about content scripts:
 * https://developer.chrome.com/docs/extensions/mv2/content_scripts/
 */

console.log("Behrooz's content script");

// inject the "injected.ts" script
// addScriptToWindow(chrome.extension.getURL("/build/injected.js"));
chrome.runtime.sendMessage({ text: "hey" }, function (response) {
  console.log("Response: ", response);
});

export {};
