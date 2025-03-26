function createPixelObject() {
    let pixel = document.createElement("img");
    pixel.src = chrome.runtime.getURL("characters/cat2.png"); 
    pixel.style.position = "absolute";
    pixel.style.width = "30px";
    pixel.style.height = "30px";
    pixel.style.cursor = "pointer";

    let x = Math.random() * (window.innerWidth - 60);
    let y = Math.random() * (window.innerHeight - 60);
    pixel.style.left = `${x}px`;
    pixel.style.top = `${y}px`;
    pixel.style.zIndex = "9999";

    pixel.onclick = () => {
        updateScore();
        pixel.remove();
        setTimeout(createPixelObject, 3000);
    };

    document.body.appendChild(pixel);
}

function updateScore() {
    chrome.storage.local.get({ score: 0 }, (data) => {
        let newScore = data.score + 1;
        chrome.storage.local.set({ score: newScore });
        console.log("New Score:", newScore);
    });
}

createPixelObject();
