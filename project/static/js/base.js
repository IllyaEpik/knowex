// document.addEventListener("DOMContentLoaded", () => {
    let count = 0
    const themeToggleButton = document.getElementById("theme_change");
    const input = document.querySelector(".input");
    const body = document.body;
    console.log(themeToggleButton,localStorage.getItem("theme"),input)

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.classList.add(savedTheme);
        input.checked = 'true'
    }
    if (document.body.classList.contains('dark')){
        const svgs = document.getElementsByClassName("svgToWhite")
        for (let svg of svgs){
            svg.addEventListener("load", function() {
                const realSvg = this.contentDocument.querySelector("path");
                realSvg.style.stroke = "white";
            })
        }
	}
    themeToggleButton.addEventListener("click", function(event) {
        console.log(body.classList.contains("dark"))
        const svgs = document.getElementsByClassName("svgToWhite")
        if (count){
            if (body.classList.contains("dark")) {
                body.classList.remove("dark");
                localStorage.setItem("theme", "");
                
            } else {
                body.classList.add("dark");
                localStorage.setItem("theme", "dark"); 
            }
            count = false
        }else{
            count = true
        }
        for (let svg of svgs){
            console.log(svg)
            if (!svg || !svg.contentDocument){
                svg.addEventListener("load", function() {
                    const realSvg = this.contentDocument.querySelector("path");
                    realSvg.style.stroke = "white";
                })
                return;
            }
            svg.contentDocument.querySelector("path").style.stroke = body.classList.contains("dark") ? "white" : "black"
        }
    });
// });

document.addEventListener("DOMContentLoaded", 
function () {
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
}
);
function goToTest(event) {
    event.preventDefault();
    const id = document.getElementById('test_id_input').value.trim();
    if (id) {
        fetch(`/test/${id}`, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    window.location.href = `/test/${id}`;
                } else {
                    alert("Test not found. Please check the ID and try again.");
                }
            })
            .catch(() => {
            });
        }
        return false;
    }