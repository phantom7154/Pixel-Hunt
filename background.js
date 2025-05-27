chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["autoStart"], (data) => {
    if (data.autoStart) {
      chrome.storage.session.set({ active: true }, () => {
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ["content.js"]
            });
          });
        });
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.storage.session.get(["active"], (data) => {
      if (data.active) {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ["content.js"]
        });
      }
    });
  }
});
