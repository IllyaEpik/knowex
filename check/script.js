










// создаем и сохраняем <p></p> в константу квас
const kwas = document.createElement("p")
// присваиваем ид
kwas.id = 'kwas' 
// result
// указываем содержание <p></p>
kwas.textContent = 'kwas'
// указиваем классы для <p></p>
kwas.className = 'kwas lol'
// добавляем класс kwasik  
kwas.classList.add('kwasik')
// создаем триггер на клик 
kwas.addEventListener('click', function (){
    // выводим kwasssss в консоль
    console.log('kwasssss')
})

// получаем стакан из документа
let stakan = document.querySelector('.stakan')
// добавляем в стакан квас 
stakan.append(kwas)



// получаем html елемент картинки без картинки 
let img = document.querySelector('img')
// получаем input который получает файлы 
let inp = document.querySelector('#fileInput')
// позволяет читать файлы
let reader = new FileReader()

// указивыем что будет происходить при загрузке картинки 
reader.onload = function(){
    // закидываем картинку в тег картинки (отображаем картинку)
    img.src = reader.result
}

// указываем что будет происходить при изменеии картинки в input
inp.addEventListener('change', function (event){
    // выводим данные картинки в терминал
    console.log(inp.files[0])
    // читаем файл читатилем
    reader.readAsDataURL(inp.files[0])
} )

