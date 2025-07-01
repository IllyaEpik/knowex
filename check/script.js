
let stakan = document.querySelector(".beer") // получаем елемент по класу для того что бы получить по айди нужна решетка #
let vodka = document.createElement("p") // создаем елемент p з также можно с div 

vodka.textContent = "cocain" // задаем текстовы контент 
vodka.className = 'cocain' // создаем класс с названием кокаин
vodka.id = "cocain" // создаем id с названием кокаин

vodka.style.color = 'purple' // задаем пурпурный цвет тексту

stakan.append(vodka) // добавляем елемент в div
