(function () {
  if (window.pixelPursuitActive) return;
  window.pixelPursuitActive = true;

  let currentPixel;
  let startTime;

  function createPixel() {
    if (currentPixel) currentPixel.remove();

    const images = ["cat1.png", "cat2.png", "cat3.png"];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const imageURL = chrome.runtime.getURL("assets/" + randomImage);

    const pixel = document.createElement("img");
    pixel.src = imageURL;
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
    currentPixel = pixel;
    startTime = performance.now();

    pixel.addEventListener("click", () => {
      const endTime = performance.now();
      const reactionTime = (endTime - startTime).toFixed(2);

      chrome.storage.sync.get("pixelPursuitName", ({ pixelPursuitName }) => {
        const name = pixelPursuitName || "Anonymous";

        // Save to Firebase
        fetch("https://pixel-hunt-33f06-default-rtdb.asia-southeast1.firebasedatabase.app/leaderboard.json", {
          method: "POST",
          body: JSON.stringify({ name, time: parseFloat(reactionTime), timestamp: Date.now() })
        });

        // Store score locally
        chrome.storage.local.set({ currentScore: reactionTime });
        chrome.storage.local.get(["highScore"], ({ highScore }) => {
          if (!highScore || parseFloat(reactionTime) < parseFloat(highScore)) {
            chrome.storage.local.set({ highScore: reactionTime });
          }
        });

        currentPixel.remove();
        setTimeout(createPixel, 3000); // respawn after 3 seconds
      });
    });
  }

  createPixel();
})();
