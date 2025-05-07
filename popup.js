document.addEventListener("DOMContentLoaded", async () => {
    const toggleBtn = document.getElementById("toggle-game");
    const autoStart = document.getElementById("auto-start");
  
    // Load stored settings
    chrome.storage.local.get(["autoStart"], (data) => {
      autoStart.checked = !!data.autoStart;
    });
  
    // Toggle auto-start
    autoStart.addEventListener("change", () => {
      chrome.storage.local.set({ autoStart: autoStart.checked });
    });
  
    // Toggle game on/off for session
    toggleBtn.addEventListener("click", () => {
      chrome.storage.session.get(["isGameActive"], (data) => {
        const newState = !data.isGameActive;
        chrome.storage.session.set({ isGameActive: newState });
  
        toggleBtn.textContent = newState ? "Stop Game" : "Start Game";
  
        // Refresh all tabs to inject or remove content
        chrome.tabs.query({}, (tabs) => {
          for (let tab of tabs) {
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: [newState ? "content.js" : "deactivate.js"]
            });
          }
        });
      });
    });
  });
  