let button1 = document.getElementById("regBtn")
let button2 = document.querySelector(".line_log")
let button4 = document.getElementById("logBtn")
let button5 = document.querySelector(".line_reg")
let reg = document.getElementById("reg")
let auth = document.getElementById("auth")

button1.addEventListener("click", ()=> {
    // button2.classList.remove("hidden"),
    // button4.classList.add("hidden")
    button5.classList.add("select"),
    button2.classList.remove("select")
    reg.hidden = false
    auth.hidden = true
})

button4.addEventListener("click", ()=> {

    button5.classList.remove("select"),
    button2.classList.add("select")
    // reg.classList.add('hidden')
    // auth.classList.remove('hidden')
    reg.hidden = true
    auth.hidden = false
})