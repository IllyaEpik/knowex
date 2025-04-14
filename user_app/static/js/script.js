let button1 = document.getElementById("regBtn")
let button2 = document.getElementById("formFields")
let button4 = document.getElementById("logBtn")
let button5 = document.getElementById("formField")



button1.addEventListener("click", ()=> {
    button2.classList.toggle("hidden")
})

button4.addEventListener("click", ()=>{
    button5.classList.toggle("hidden")
})