import load from "./load.js";
import save from "./save.js";

function update() {
    let questionContainer = document.querySelector('.questionContainer')
    let questionButtons = document.querySelectorAll('.questionButton')
    let settingButton = document.getElementById('settingButton')
    let TestSettings = document.getElementById('TestSettings')
    let TestQuestion = document.getElementById('TestQuestion')
    let bins = document.querySelectorAll('.trashQuestionMark')
    let bins2 = document.querySelectorAll('.removeButton')
    let number = 0

    // переключение между вопросами
    for (let questionButton of questionButtons) {
        questionButton.addEventListener("click", () => {
            save()
            removeSelect(questionButtons)
            TestSettings.classList.add('hidden')
            TestQuestion.classList.remove('hidden')
            settingButton.classList.remove('select')
            questionButton.classList.add("select")
            load()
        })
    }

    // переключение на настройки
    settingButton.addEventListener('click', () => {
        save()
        removeSelect(questionButtons)
        TestSettings.classList.remove('hidden')
        TestQuestion.classList.add('hidden')
        settingButton.classList.add('select')
        load()
    })

    // удаление варианта ответа
    for (let bin of bins) {
        bin.addEventListener('click', () => {
            bin.closest(".answersBlock").querySelector("#addAnswer").classList.remove("hidden")
            let answers = bin.closest(".answersBlock").querySelectorAll(".questionForTest")
            if (answers.length > 2) {
                bin.parentElement.parentElement.remove()
            }
        })
    }

    // нумерация вопросов
    for (let question of questionContainer.querySelectorAll(".questionNumber")) {
        number++
        question.textContent = number
    }

    // удаление вопроса
    for (let bin2 of bins2) {
        bin2.addEventListener('click', () => {
            let parent = bin2.parentElement;

            // если удаляем активный вопрос → переключаемся на настройки
            if (parent.classList.contains("select")) {
                TestSettings.classList.remove('hidden')
                TestQuestion.classList.add('hidden')
                settingButton.classList.add('select')
                load()
            }

            // удаляем из localStorage старый ключ
            let oldNum = parent.querySelector('.questionNumber').textContent
            localStorage.removeItem(oldNum)

            // удаляем сам элемент
            parent.remove()

            // 🔄 обновляем нумерацию и localStorage
            renumberQuestionsAndResave()

            // сохраняем в БД
            save()
        })
    }
}

// убираем выделение со всех вопросов
function removeSelect(questionButtons) {
    for (let questionButton of questionButtons) {
        questionButton.classList.remove("select")
    }
}

// функция перенумерации и пересохранения
function renumberQuestionsAndResave() {
    let questionContainer = document.querySelector('.questionContainer')
    let number = 0
    let newStorage = {}

    // собираем новые данные
    for (let question of questionContainer.querySelectorAll(".questionButton")) {
        number++
        let numEl = question.querySelector(".questionNumber")
        if (numEl) {
            numEl.textContent = number
            let data = localStorage.getItem(numEl.textContent)
            if (data) {
                newStorage[number] = JSON.parse(data)
            }
        }
    }

    // очищаем старые числовые ключи
    Object.keys(localStorage).forEach(key => {
        if (!isNaN(parseInt(key))) {
            localStorage.removeItem(key)
        }
    })

    // перезаписываем с новыми ключами
    for (let key in newStorage) {
        localStorage.setItem(key, JSON.stringify(newStorage[key]))
    }
}

export default update
