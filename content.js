const images = ["characters/cat1.png","characters/cat2.png","characters/cat3.png","characters/cat4.png","characters/cat5.png","characters/cat6.png"];

function createPixelObject() {
    let pixel = document.createElement("img");

    let randomImage = images[Math.floor(Math.random() * images.length)];
    pixel.src = chrome.runtime.getURL(randomImage);

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
