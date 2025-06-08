document.addEventListener("DOMContentLoaded", function () {
    const nicknameButton = document.querySelector(".nickname");
    const profileInfo = document.querySelector(".profile_info");

    if (nicknameButton && profileInfo) {
        profileInfo.style.display = "none";

        nicknameButton.addEventListener("click", function () {
            if (profileInfo.style.display === "none") {
                profileInfo.style.display = "block"; 
            } else {
                profileInfo.style.display = "none"; 
                profileInfo.style.cursor = "none";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
        const messages = messagesContainer.querySelectorAll(".message");

        messages.forEach((message, index) => {
            setTimeout(() => {
                message.classList.add("show");
            }, index * 100); 
        });

        messages.forEach((message, index) => {
            setTimeout(() => {
                message.classList.add("hide");
                setTimeout(() => {
                    message.remove();
                }, 500);
            }, 5000 + index * 1000); 
        });
    }
});