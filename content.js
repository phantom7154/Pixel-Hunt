(async function () {
  if (window.pixelPursuitActive) return;
  window.pixelPursuitActive = true;

  const { pixelPursuitName } = await chrome.storage.sync.get("pixelPursuitName");
  const { aiEvasionEnabled } = await chrome.storage.sync.get("aiEvasionEnabled");
  const { gameMode } = await chrome.storage.local.get("gameMode");

  const name = pixelPursuitName || "Anonymous";
  let pixel, startTime;
  let streakCount = 0;
  let timeAttackClicks = 0;
  let timeAttackStart = null;

  if (gameMode === "streak") {
    setTimeout(() => {
      alert(`🔥 Streak Mode Over!\nYou clicked ${streakCount} pixels.`);
      window.pixelPursuitActive = false;
      document.querySelectorAll("#pixel-hunt").forEach(el => el.remove());
    }, 30000);
  }

  function spawnPixel() {
    if (pixel) pixel.remove();

    const images = ["cat1.png", "cat2.png", "cat3.png", "cat4.png", "cat5.png", "cat6.png"];
    const src = chrome.runtime.getURL("assets/" + images[Math.floor(Math.random() * images.length)]);

    pixel = document.createElement("img");
    pixel.src = src;
    pixel.id = "pixel-hunt";
    Object.assign(pixel.style, {
      position: "fixed",
      width: "20px",
      height: "20px",
      zIndex: 999999,
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
      cursor: "pointer"
    });

    document.body.appendChild(pixel);
    startTime = performance.now();

    if (aiEvasionEnabled) document.addEventListener("mousemove", onMouseMove);

    pixel.onclick = () => {
      const now = performance.now();
      const reactionTime = (now - startTime).toFixed(2);

      if (gameMode === "normal") {
        recordScore(reactionTime);
        setTimeout(spawnPixel, 3000);

      } else if (gameMode === "streak") {
        streakCount++;
        setTimeout(spawnPixel, 300);

      } else if (gameMode === "timeattack") {
        if (timeAttackClicks === 0) timeAttackStart = now;
        timeAttackClicks++;

        if (timeAttackClicks >= 10) {
          const total = (now - timeAttackStart).toFixed(2);
          alert(`⚡ Time Attack Complete!\nTotal Time: ${total} ms`);
          recordScore(total);
          window.pixelPursuitActive = false;
          return;
        } else {
          setTimeout(spawnPixel, 200);
        }
      }

      pixel.remove();
      document.removeEventListener("mousemove", onMouseMove);
    };
  }

  function onMouseMove(e) {
    const rect = pixel.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 100) {
      const angle = Math.atan2(dy, dx);
      let x = rect.left - Math.cos(angle) * 50;
      let y = rect.top - Math.sin(angle) * 50;
      x = Math.max(0, Math.min(window.innerWidth - 40, x));
      y = Math.max(0, Math.min(window.innerHeight - 40, y));
      pixel.style.left = `${x}px`;
      pixel.style.top = `${y}px`;
    }
  }

  function recordScore(reactionTime) {
    chrome.storage.local.set({ currentScore: reactionTime });
    chrome.storage.local.get(["highScore", "totalClicks", "totalTime", "leaderboard"], (data) => {
      const hs = data.highScore;
      const totalClicks = (data.totalClicks || 0) + 1;
      const totalTime = (parseFloat(data.totalTime || 0) + parseFloat(reactionTime)).toFixed(2);
      const leaderboard = data.leaderboard || [];

      if (!hs || parseFloat(reactionTime) < parseFloat(hs)) {
        chrome.storage.local.set({ highScore: reactionTime });
      }

      const newEntry = { name, time: parseFloat(reactionTime), timestamp: Date.now() };
      leaderboard.push(newEntry);
      leaderboard.sort((a, b) => a.time - b.time);
      const top5 = leaderboard.slice(0, 5);

      chrome.storage.local.set({ totalClicks, totalTime, leaderboard: top5 });
    });
  }

  spawnPixel();
})();
