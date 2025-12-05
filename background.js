chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse({ success: true });
  return true;
});
