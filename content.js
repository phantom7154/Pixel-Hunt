const images = ["characters/cat1.png","characters/cat2.png","characters/cat3.png","characters/cat4.png","characters/cat5.png","characters/cat6.png"];

(function () {
    // Prevent multiple instances
    if (window.pixelPursuitActive) return;
    window.pixelPursuitActive = true;
  
    const pixelId = "pixel-hunt";
    const existing = document.getElementById(pixelId);
    if (existing) existing.remove();
  
    // Create pixel
    const pixel = document.createElement("div");
    let randomImage = images[Math.floor(Math.random() * images.length)];
    pixel.id = pixelId;
    Object.assign(pixel.style, {
      position: "fixed",
      width: "20px",
      height: "20px",
      backgroubdImage: chrome.runtime.getURL(randomImage),
      borderRadius: "50%",
      zIndex: 999999,
      top: "50%",
      left: "50%",
      transition: "top 0.1s linear, left 0.1s linear",
      cursor: "pointer",
    });
  
    document.body.appendChild(pixel);
  
    // Initial position
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    let x = Math.random() * (screenW - 40);
    let y = Math.random() * (screenH - 40);
    pixel.style.left = `${x}px`;
    pixel.style.top = `${y}px`;
  
    let startTime = performance.now();
  
    // Avoidance logic
    document.addEventListener("mousemove", onMouseMove);
  
    function onMouseMove(e) {
      const dx = e.clientX - x;
      const dy = e.clientY - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
  
      if (distance < 100) {
        // Move away from mouse
        const angle = Math.atan2(dy, dx);
        x -= Math.cos(angle) * 50;
        y -= Math.sin(angle) * 50;
  
        // Clamp position within viewport
        x = Math.max(0, Math.min(screenW - 20, x));
        y = Math.max(0, Math.min(screenH - 20, y));
  
        pixel.style.left = `${x}px`;
        pixel.style.top = `${y}px`;
      }
    }
  
    // Click to stop timer
    pixel.addEventListener("click", () => {
      const endTime = performance.now();
      const reactionTime = (endTime - startTime).toFixed(2);
      alert(`🎉 You clicked it in ${reactionTime} ms`);
      pixel.remove();
      window.pixelPursuitActive = false;
      document.removeEventListener("mousemove", onMouseMove);
    });
  })();
  