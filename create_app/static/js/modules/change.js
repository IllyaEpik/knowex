function change(){
    let settingButton = document.getElementById('settingButton')
    let TestSettings = document.getElementById('TestSettings')
    let TestQuestion = document.getElementById('TestQuestion')
    let questionButtons = document.querySelectorAll('.questionButton')
    function removeSelect(){
        for (let questionButton of questionButtons){
            questionButton.classList.remove("select")
        }
    }
    // TestQuestion
    settingButton.addEventListener('click', () => {
        TestSettings.classList.remove('hidden')
        TestQuestion.classList.add('hidden')
        settingButton.classList.add('select')
        removeSelect()
    })
    for (let questionButton of questionButtons){
        questionButton.addEventListener("click", () => {

            TestSettings.classList.add('hidden')
            TestQuestion.classList.remove('hidden')
            settingButton.classList.remove('select')
            removeSelect()
            questionButton.classList.add("select")
        })
        // select
    }
}
export default change