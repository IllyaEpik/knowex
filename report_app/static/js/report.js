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
        // container_test
        let container_test = document.querySelectorAll(".container_test");
        let testList = [];

        container_test.forEach(function(test) {
            let test_class = test.querySelector(".test_class").value;
            let test_subject = test.querySelector(".test_subject").value;
            let test_question_count = test.querySelector(".test_question_count").value;
            let test_date = test.querySelector(".test_date").value;
            
            
            if (question.value !== "all" && question.value !== test_class) {
                test.style.display = "none";

                return; 
            }

            if (checkTestCount(question.value, test_question_count, test)) {
                testList.push(test);
            }
        });
            
        
        if (date.value == 'new') {
            testList.sort((a, b) => a.querySelector(".test_date").value - b.querySelector(".test_date").value);
            
        }else if (date.value == 'old') {
            testList.sort((a, b) => b.querySelector(".test_date").value - a.querySelector(".test_date").value);
        }
        if (popularity && popularity.value === 'most') {
            testList.sort((a, b) => Number(b.querySelector(".test_question_count").value) - Number(a.querySelector(".test_question_count").value));
        } else if (popularity && popularity.value === 'least') {
            testList.sort((a, b) => Number(a.querySelector(".test_question_count").value) - Number(b.querySelector(".test_question_count").value));
        }

        container_tests.innerHTML = ""; 
        testList.forEach(function(container) {
            container_tests.append(container);
        });
        console.log(testList);
    });
}