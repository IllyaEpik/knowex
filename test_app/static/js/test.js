document.addEventListener('DOMContentLoaded', function () {
    let responseName = window.location.pathname;

    document.addEventListener('submit', function (e) {
        e.preventDefault();

        if (e.target.tagName === 'FORM') {
            let selected = document.querySelectorAll('input[name="answer"]:checked');
            if (!selected) {
                alert('Будь ласка, оберіть відповідь.');
                return;
            }
            let selectList = []
            for (let select of selected){
                selectList.push(select.value)
            }
            if (selected.length == 1 && selected[0].type=='radio'){
                selected = selected[0].value
            }else{
                selected = JSON.stringify(selectList)
            }
            $.ajax({
                url: responseName,
                type: 'POST',
                data: { answer: selected },
                success: function (response) {
                    if (response.error) {
                        alert('Помилка: ' + response.error);
                        return;
                    }

                    if (response.next_url) {
                        $.ajax({
                            url: response.next_url,
                            headers: { 'X-Requested-With': 'XMLHttpRequest' },
                            success: function (data) {
                                let elem = document.createElement('div');
                                elem.innerHTML = data;
                                document.querySelector('.question-container').innerHTML =
                                    elem.querySelector('.question-container').innerHTML;
                                responseName = response.next_url;
                            },
                            error: function () {
                                alert('Не вдалося завантажити наступне питання.');
                            }
                        });
                    } else if (response.result_url) {
                        window.location.href = response.result_url;
                    }
                },
                error: function () {
                    alert('Сталася помилка при перевірці відповіді.');
                }
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const ratingList = document.getElementById('rating-container');
    if (!ratingList || !ratingList.classList.contains('result-container')) {
        console.log('rating-container не найден или не имеет класс result-container');
        return;
    }

    const total = Number(ratingList.dataset.total);
    const correctAnswers = Number(ratingList.dataset.correct);
    const incorrectAnswers = Number(ratingList.dataset.incorrect);
    const nullAnswers = Number(ratingList.dataset.null);

    if (isNaN(total) || total <= 0) {
        return;
    }

    ratingList.innerHTML = '';

    const oneWidth = 300 / total;

    const bar = document.createElement('div');
    bar.className = 'rating-bar-single';

    function setBar(answersCount, className) {
        if (answersCount > 0) {
            const widthPx = answersCount * oneWidth;
            const segment = document.createElement('div');
            segment.className = `rating-bar-segment-single rating-bar-${className}`;            
            segment.style.width = `${widthPx}px`;
            segment.innerHTML = `<span>${answersCount}</span>`;
            bar.appendChild(segment);
        }
    }

    setBar(correctAnswers, 'correct');
    setBar(incorrectAnswers, 'incorrect');
    setBar(nullAnswers, 'null');

    ratingList.appendChild(bar);
});










document.querySelectorAll('.answer-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('.answer-card').forEach(card => {
            card.classList.remove('selected');
        });
        if (this.checked) {
            this.closest('.answer-card').classList.add('selected');
        }
    });
});