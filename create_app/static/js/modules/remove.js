
function removeElems(){
    let bins = document.querySelectorAll('.trashQuestionMark')
    let bins2 = document.querySelectorAll('.removeButton')
    for (let bin of bins){
        bin.addEventListener('click', () => bin.parentElement.parentElement.remove()
        )
    }
    for (let bin2 of bins2){
        bin2.addEventListener('click', () => bin2.parentElement.remove())
    }
}
export default removeElems