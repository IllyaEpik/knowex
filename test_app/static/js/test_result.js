let ratingContainer = document.querySelector("#rating-container")
let answersDiv = ratingContainer.querySelector(".answers")
let correct = ratingContainer.dataset.correct
let total = ratingContainer.dataset.total
let incorrect = ratingContainer.dataset.incorrect
let unanswered = ratingContainer.dataset.null
let oneQuestionWidth = ratingContainer.clientWidth / total
function setAnswers(questions, color){

    let div = document.createElement("div")
    div.style.width = questions*oneQuestionWidth
    div.style.backgroundColor = color
    div.className = "partOfRating"
    answersDiv.append(div)
    console.log(div)
}
setAnswers(correct,"#77b670")
setAnswers(incorrect,"#eb5254")
// setAnswers(unanswered,"#00FF88")
// FE5454