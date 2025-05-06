let button_filter = document.getElementById("filter");

button_filter.addEventListener("click", function () {
    let filtersDiv = document.querySelector(".filters");
    if (filtersDiv) {
        if (filtersDiv.style.display === "none") {
            filtersDiv.style.display = "block";
            filtersDiv.style.cursor = "";
        } else {
            filtersDiv.style.display = "none";
            filtersDiv.style.cursor = "none"; 
        }
    }
});
// localStorage