document.addEventListener("DOMContentLoaded", () => {
    const themeToggleButton = document.getElementById("theme_change");
    const body = document.body;


    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.add(savedTheme);
    }

    themeToggleButton.addEventListener("click", () => {
        if (body.classList.contains("dark")) {
            body.classList.remove("dark");
            localStorage.setItem("theme", "");
        } else {
            body.classList.add("dark");
            localStorage.setItem("theme", "dark"); 
        }
    });
});

