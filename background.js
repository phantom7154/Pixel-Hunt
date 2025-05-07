chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(["autoStart"], (data) => {
      if (data.autoStart) {
        chrome.storage.session.set({ isGameActive: true }, () => {
          injectGameIntoAllTabs();
        });
      }
    });
  });
  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      chrome.storage.session.get(["isGameActive"], (data) => {
        if (data.isGameActive) {
          chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"]
          });
        }
      });
    }
  });
  
  function injectGameIntoAllTabs() {
    chrome.tabs.query({}, (tabs) => {
      for (let tab of tabs) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      }
    });
  }
  