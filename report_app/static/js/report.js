let button = document.querySelector(".button_filter");
let container_tests = document.querySelector(".container_tests");
function checkTestCount(count,test_count,test) {
    console.log(count);
    console.log(test_count);
    test_count--;
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
        // container_test
        let container_test = document.querySelectorAll(".container_test");
        testList = [];
        
        container_test.forEach(function(test) {
            // test_class
            let test_class = test.querySelector(".test_class").value;
            let test_subject = test.querySelector(".test_subject").value;
            let test_question_count = test.querySelector(".test_question_count").value;
            let test_date = test.querySelector(".test_date").value;

            if (checkTestCount(question.value,test_question_count,test)) {
                testList.push(test);
            }
            console.log(test_date);
        });
        
        if (date.value == 'new') {
            testList.sort((a, b) => a.querySelector(".test_date").value - b.querySelector(".test_date").value);
            
        }else if (date.value == 'old') {
            testList.sort((a, b) => b.querySelector(".test_date").value - a.querySelector(".test_date").value);
        }
        container_tests.innerHTML = ""; // Clear the container before appending new tests
        testList.forEach(function(container) {
            container_tests.append(container);
        });
        console.log(testList);
    });
}