document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get({ score: 0 }, (data) => {
        document.getElementById("score").textContent = data.score;
    });
});
