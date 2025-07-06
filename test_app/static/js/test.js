
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        if (e.target.tagName === 'FORM') {
            const selected = e.target.querySelector('input[name="answer"]:checked');
            if (!selected) {
                alert('Будь ласка, оберіть відповідь.');
                return;
            }

            $.ajax({
                url: window.location.pathname,
                type: 'POST',
                data: { answer: selected.value },
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

                                document.querySelector('.question-container').innerHTML = data;

                                history.pushState({}, '', response.next_url);
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