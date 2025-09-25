function save() {
    let select = document.querySelector('.select')
    let payload = {}

    if (select.id != "settingButton") {
        let selectImgEl = document.querySelector(".selectImg");
        let selectImgParent = selectImgEl ? selectImgEl.parentElement : null;

        let saveData = {
            "question": document.querySelector("#questionNameInput").value,
            "answers": [],
            "correct": [],
            "type": "OneAnswerQuestion"
        };

        if (selectImgParent) {
            if (selectImgParent.id == 'questionType') {
                let sel = selectImgParent.querySelector('select')
                saveData["type"] = sel && sel.value == "2" ? "multipleQuestion" : "OneAnswerQuestion"
            } else {
                saveData["type"] = selectImgParent.id
            }
        }

        for (let question of document.querySelectorAll(".questionForTest")) {
            let answer = question.querySelector("textarea").value
            if (question.querySelector(".isAnswerCorrect").checked) {
                saveData.correct.push(answer)
            }
            saveData.answers.push(answer)
        }

        if (saveData["type"] == "OneAnswerQuestion") {
            saveData['correct'] = saveData['correct'][0]
        }

        // localStorage
        localStorage.setItem(select.querySelector(".questionNumber").textContent, JSON.stringify(saveData))

        payload = {
            key: select.querySelector(".questionNumber").textContent,
            data: saveData,
            type: "question"
        }

    } else {
        let objectsToSave = ['class', 'testNameInput', 'subject', 'description']
        let data = {}
        for (let object of objectsToSave) {
            data[object] = document.querySelector(`#${object}`).value
        }
        localStorage.setItem('settingsOfTest', JSON.stringify(data))

        payload = {
            key: "settingsOfTest",
            data: data,
            type: "settings"
        }
    }

    fetch("/save", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    }).catch(err => console.error("Ошибка при сохранении:", err));
}

window.addEventListener('beforeunload', save)
export default save