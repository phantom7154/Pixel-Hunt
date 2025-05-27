const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const aiToggle = document.getElementById("aiToggle");
const currentScore = document.getElementById("currentScore");
const highScore = document.getElementById("highScore");
const avgTime = document.getElementById("avgTime");
const totalClicks = document.getElementById("totalClicks");
const leaderboardDiv = document.getElementById("leaderboard");
const autoStartToggle = document.getElementById("autoStartToggle");
const modeSelect = document.getElementById("modeSelect");

// Load and reflect stored settings
chrome.storage.local.get(["autoStart", "gameMode"], (data) => {
  autoStartToggle.checked = !!data.autoStart;
  modeSelect.value = data.gameMode || "normal";
});

// Save settings when toggled
autoStartToggle.addEventListener("change", () => {
  chrome.storage.local.set({ autoStart: autoStartToggle.checked });
});
modeSelect.addEventListener("change", () => {
  chrome.storage.local.set({ gameMode: modeSelect.value });
});

nameInput.addEventListener("input", () => {
  const valid = nameInput.value.trim().length > 0;
  startBtn.disabled = !valid;
  if (valid) chrome.storage.sync.set({ pixelPursuitName: nameInput.value });
});

aiToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ aiEvasionEnabled: aiToggle.checked });
});

chrome.storage.sync.get(["pixelPursuitName", "aiEvasionEnabled"], (data) => {
  if (data.pixelPursuitName) {
    nameInput.value = data.pixelPursuitName;
    startBtn.disabled = false;
  }
  aiToggle.checked = !!data.aiEvasionEnabled;
});

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

stopBtn.addEventListener("click", () => {
  chrome.storage.session.set({ active: false });
  startBtn.style.display = "block";
  stopBtn.style.display = "none";
});

chrome.storage.local.get(["currentScore", "highScore", "totalClicks", "totalTime"], (data) => {
  if (data.currentScore) currentScore.textContent = data.currentScore;
  if (data.highScore) highScore.textContent = data.highScore;
  const avg = data.totalClicks ? (parseFloat(data.totalTime) / data.totalClicks).toFixed(2) : "--";
  avgTime.textContent = avg;
  totalClicks.textContent = data.totalClicks || "0";
});

function loadLeaderboard() {
  db.ref("leaderboard").orderByChild("time").on("value", snapshot => {
    const data = snapshot.val();
    leaderboardDiv.innerHTML = "";
    if (!data) return;

    const entries = Object.values(data).sort((a, b) => a.time - b.time);
    chrome.storage.sync.get("pixelPursuitName", ({ pixelPursuitName }) => {
      const currentUser = pixelPursuitName || "Anonymous";
      let rank = "Not ranked";

      entries.forEach((entry, i) => {
        if (entry.name === currentUser && rank === "Not ranked") rank = i + 1;
      });

      leaderboardDiv.innerHTML += `<p><strong>Your Rank:</strong> ${rank}</p><hr>`;
      entries.slice(0, 10).forEach((entry, i) => {
        leaderboardDiv.innerHTML += `<p>#${i + 1} ${entry.name}: ${entry.time} ms</p>`;
      });
    });
  });
}
loadLeaderboard();
