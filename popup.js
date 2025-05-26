const nameInput = document.getElementById("nameInput");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const currentScore = document.getElementById("currentScore");
const highScore = document.getElementById("highScore");
const leaderboardDiv = document.getElementById("leaderboard");

// Enable start only if name is filled
nameInput.addEventListener("input", () => {
  const valid = nameInput.value.trim().length > 0;
  startBtn.disabled = !valid;
  if (valid) chrome.storage.sync.set({ pixelPursuitName: nameInput.value });
});

// Load saved name
chrome.storage.sync.get("pixelPursuitName", ({ pixelPursuitName }) => {
  if (pixelPursuitName) {
    nameInput.value = pixelPursuitName;
    startBtn.disabled = false;
  }
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
  startBtn.style.display = "block";
  stopBtn.style.display = "none";
});

// Load scores
chrome.storage.local.get(["currentScore", "highScore"], ({ currentScore: cs, highScore: hs }) => {
  if (cs) currentScore.textContent = cs;
  if (hs) highScore.textContent = hs;
});

// Load leaderboard
function loadLeaderboard() {
  db.ref("leaderboard").orderByChild("time").once("value", snapshot => {
    const data = snapshot.val();
    leaderboardDiv.innerHTML = "";
    if (!data) return;

    const entries = Object.values(data);
    entries.sort((a, b) => a.time - b.time);

    chrome.storage.sync.get("pixelPursuitName", ({ pixelPursuitName }) => {
      const currentUser = pixelPursuitName || "Anonymous";
      let rank = "Not ranked";

      entries.forEach((entry, index) => {
        if (entry.name === currentUser && rank === "Not ranked") {
          rank = index + 1;
        }
      });

      leaderboardDiv.innerHTML += `<p><strong>Your Rank:</strong> ${rank}</p><hr>`;
      entries.slice(0, 10).forEach((entry, i) => {
        leaderboardDiv.innerHTML += `<p>#${i + 1} ${entry.name}: ${entry.time} ms</p>`;
      });
    });
  });
}

loadLeaderboard();
