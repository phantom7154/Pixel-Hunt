(async function () {
  if (window.pixelPursuitActive) return;
  window.pixelPursuitActive = true;

  const { pixelPursuitName } = await chrome.storage.sync.get("pixelPursuitName");
  const name = pixelPursuitName || "Anonymous";

  const { aiEvasionEnabled } = await chrome.storage.sync.get("aiEvasionEnabled");
  const { gameMode } = await chrome.storage.local.get("gameMode");

  let pixel, startTime;
  let streakCount = 0;
  let timeAttackClicks = 0;
  let timeAttackStart = null;

  if (gameMode === "streak") {
    setTimeout(() => {
      alert(`🕹️ Streak over! You clicked ${streakCount} pixels.`);
      window.pixelPursuitActive = false;
      pixel?.remove();
    }, 30000); // 30s
  }

  async function spawnPixel() {
    if (pixel) pixel.remove();

    const images = ["cat1.png", "cat2.png", "cat3.png"];
    const src = chrome.runtime.getURL("assets/" + images[Math.floor(Math.random() * images.length)]);

    pixel = document.createElement("img");
    pixel.src = src;
    pixel.id = "pixel-hunt";
    Object.assign(pixel.style, {
      position: "fixed",
      width: "40px",
      height: "40px",
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
        recordScore(name, reactionTime);
        setTimeout(spawnPixel, 3000);

      } else if (gameMode === "streak") {
        streakCount++;
        setTimeout(spawnPixel, 300);

      } else if (gameMode === "timeattack") {
        if (timeAttackClicks === 0) timeAttackStart = now;
        timeAttackClicks++;

        if (timeAttackClicks >= 10) {
          const total = (now - timeAttackStart).toFixed(2);
          alert(`⏱️ Time Attack complete in ${total} ms`);
          recordScore(name, total);
          window.pixelPursuitActive = false;
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

  function recordScore(name, score) {
    fetch("https://pixel-hunt-33f06-default-rtdb.asia-southeast1.firebasedatabase.app/leaderboard.json", {
      method: "POST",
      body: JSON.stringify({ name, time: parseFloat(score), timestamp: Date.now() })
    });

    chrome.storage.local.set({ currentScore: score });
    chrome.storage.local.get(["highScore", "totalClicks", "totalTime"], (data) => {
      const hs = data.highScore;
      const totalClicks = (data.totalClicks || 0) + 1;
      const totalTime = (parseFloat(data.totalTime || 0) + parseFloat(score)).toFixed(2);

      if (!hs || parseFloat(score) < parseFloat(hs)) {
        chrome.storage.local.set({ highScore: score });
      }
      chrome.storage.local.set({ totalClicks, totalTime });
    });
  }

  spawnPixel();
})();
