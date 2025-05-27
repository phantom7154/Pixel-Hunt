const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const aiToggle = document.getElementById("aiToggle");
const autoStartToggle = document.getElementById("autoStartToggle");
const modeSelect = document.getElementById("modeSelect");
const currentScore = document.getElementById("currentScore");
const highScore = document.getElementById("highScore");
const avgTime = document.getElementById("avgTime");
const totalClicks = document.getElementById("totalClicks");
const leaderboardDiv = document.getElementById("leaderboard");

// Load user settings
chrome.storage.sync.get(["pixelPursuitName", "aiEvasionEnabled"], data => {
  if (data.pixelPursuitName) {
    nameInput.value = data.pixelPursuitName;
    startBtn.disabled = false;
  }
  aiToggle.checked = !!data.aiEvasionEnabled;
});

chrome.storage.local.get(["autoStart", "gameMode", "currentScore", "highScore", "totalClicks", "totalTime", "leaderboard"], data => {
  autoStartToggle.checked = !!data.autoStart;
  modeSelect.value = data.gameMode || "normal";
  currentScore.textContent = data.currentScore || "--";
  highScore.textContent = data.highScore || "--";
  const avg = data.totalClicks ? (parseFloat(data.totalTime) / data.totalClicks).toFixed(2) : "--";
  avgTime.textContent = avg;
  totalClicks.textContent = data.totalClicks || "0";

  if (data.leaderboard && data.leaderboard.length) {
    const top5 = data.leaderboard.sort((a, b) => a.time - b.time).slice(0, 5);
    leaderboardDiv.innerHTML = top5.map((entry, i) => `<p>#${i + 1} ${entry.name}: ${entry.time} ms</p>`).join("");
  }
});

// Reflect session state
chrome.storage.session.get("active", ({ active }) => {
  startBtn.style.display = active ? "none" : "block";
  stopBtn.style.display = active ? "block" : "none";
});

// Input handlers
nameInput.addEventListener("input", () => {
  const valid = nameInput.value.trim().length > 0;
  startBtn.disabled = !valid;
  if (valid) chrome.storage.sync.set({ pixelPursuitName: nameInput.value });
});
aiToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ aiEvasionEnabled: aiToggle.checked });
});
autoStartToggle.addEventListener("change", () => {
  chrome.storage.local.set({ autoStart: autoStartToggle.checked });
});
modeSelect.addEventListener("change", () => {
  chrome.storage.local.set({ gameMode: modeSelect.value });
});

// Start game
startBtn.addEventListener("click", () => {
  chrome.storage.session.set({ active: true }, () => {
    chrome.tabs.query({}, tabs => {
      tabs.forEach(tab => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });
      });
    });
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
  });
});

// Stop game
stopBtn.addEventListener("click", () => {
  chrome.storage.session.set({ active: false });
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.querySelectorAll("#pixel-hunt").forEach(el => el.remove());
          window.pixelPursuitActive = false;
        }
      });
    });
  });
  startBtn.style.display = "block";
  stopBtn.style.display = "none";
});
