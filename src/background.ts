/**
 * This is a background script
 * It is running in the background process of chrome
 * You can debug it by clicking the "background page"
 * button in the extension settings
 *
 * Read more about background scripts:
 * https://developer.chrome.com/docs/extensions/mv2/background_pages/
 */

console.log("background script");
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log("Received %o from %o, frame", msg, sender.tab, sender.frameId);
  sendResponse("Gotcha!");
});
export {};
