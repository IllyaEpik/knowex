let button = document.querySelector(".button_filter");
let container_tests = document.querySelector(".container_tests");
function checkTestCount(count,test_count,test) {
    console.log(count);
    console.log(test_count);
    test_count -= 1;
    let counts = count.split("-");
    console.log(test);
    console.log(counts);
    if (count === "all") {
        test.style.display = "flex";
        return true;
    } else if (Number(counts[0]) <= test_count && Number(counts[1]) >= test_count) {
        test.style.display = "flex";
        return true;
    }else{
        test.style.display = "none";
    }
}
if (button) {
    button.addEventListener("click", function() {
        let question = document.querySelector("#questions");
        let date = document.querySelector("#date");
        let popularity = document.querySelector("#popularity");
        let container_test = document.querySelectorAll(".container_test");
        let testList = [];

        container_test.forEach(function(test) {
            let test_class = test.dataset.class;
            let test_subject = test.dataset.subject;
            let test_question_count = test.dataset.questionCount;
            let test_date = test.dataset.date;

            // Фильтр по классу
            let classFilter = document.querySelector("#class").value;
            if (classFilter !== "all" && classFilter !== test_class) {
                test.style.display = "none";
                return;
            }
            // Фильтр по предмету
            let subjectFilter = document.querySelector("#subject").value;
            if (subjectFilter !== "all" && subjectFilter !== test_subject) {
                test.style.display = "none";
                return;
            }

            if (checkTestCount(question.value, test_question_count, test)) {
                testList.push(test);
            }
        });

        // Сортировка по дате
        if (date.value == 'new') {
            testList.sort((a, b) => Number(b.dataset.date) - Number(a.dataset.date));
        } else if (date.value == 'old') {
            testList.sort((a, b) => Number(a.dataset.date) - Number(b.dataset.date));
        }
        // Сортировка по популярности
        if (popularity && popularity.value === 'desc') {
            testList.sort((a, b) => Number(b.dataset.questionCount) - Number(a.dataset.questionCount));
        } else if (popularity && popularity.value === 'asc') {
            testList.sort((a, b) => Number(a.dataset.questionCount) - Number(b.dataset.questionCount));
        }

        container_tests.innerHTML = "";
        testList.forEach(function(container) {
            container_tests.append(container);
        });
        console.log(testList);
    });
}