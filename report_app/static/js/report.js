let button = document.querySelector(".button_filter");
let container_tests = document.querySelector(".container_tests");

function checkTestCount(count, test_count, test) {
    test_count -= 1;
    let counts = count.split("-");
    if (count === "all") {
        return true;
    } else if (counts[1] === "+") {
        return Number(test_count) >= Number(counts[0]);
    } else if (Number(counts[0]) <= test_count && Number(counts[1]) >= test_count) {
        return true;
    } else {
        return false;
    }
}

if (button) {
    button.addEventListener("click", function() {
        let question = document.querySelector("#questions");
        let date = document.querySelector("#date");
        let popularity = document.querySelector("#popularity");
        let classFilter = document.querySelector("#class").value;
        let subjectFilter = document.querySelector("#subject").value;
        let container_test = Array.from(document.querySelectorAll(".container_test"));
        let testList = [];

        container_test.forEach(test => {
            test.style.display = "flex";
        });

        container_test.forEach(function(test) {
            let test_class = test.dataset.class;
            let test_subject = test.dataset.subject;
            let test_question_count = test.dataset.questionCount;

            if (classFilter !== "all" && classFilter !== test_class) {
                test.style.display = "none";
                return;
            }
            if (subjectFilter !== "all" && subjectFilter !== test_subject) {
                test.style.display = "none";
                return;
            }
            if (checkTestCount(question.value, test_question_count, test)) {
                testList.push(test);
            } else {
                test.style.display = "none";
            }
        });

        if (date.value == 'new') {
            testList.sort((a, b) => Number(b.dataset.date) - Number(a.dataset.date));
        } else if (date.value == 'old') {
            testList.sort((a, b) => Number(a.dataset.date) - Number(b.dataset.date));
        }
        if (popularity && popularity.value === 'desc') {
            testList.sort((a, b) => Number(b.dataset.questionCount) - Number(a.dataset.questionCount));
        } else if (popularity && popularity.value === 'asc') {
            testList.sort((a, b) => Number(a.dataset.questionCount) - Number(b.dataset.questionCount));
        }

        testList.forEach(function(container) {
            container_tests.append(container);
        });
    });
}
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".input-search-tests");
    const testCards = document.querySelectorAll(".test-card"); // класс карточки теста

    searchInput.addEventListener("input", function () {
        const query = searchInput.value.toLowerCase();

        testCards.forEach(card => {
            const title = card.querySelector(".test-title").textContent.toLowerCase();
            if (title.includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });
});