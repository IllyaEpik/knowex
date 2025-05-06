import flask, flask_login
import flask
from .models import Questions
from project.settings import DATABASE

def render_create():
    if 'messages' not in flask.session:
        flask.session['messages'] = []

    if flask.request.method == "POST":
        print(flask.request.form)
        question = Questions(
# <<<<<<< HEAD
            
#             text = flask.request.form['question'],
#             answers = flask.request.form['options'],
#             correct_answer = flask.request.form['correctAnswer']
            
            
# =======
            text = flask.request.form['text'],
            answers = flask.request.form.get('answer'),
            correct_answers = flask.request.form.get('correct_answer')
# >>>>>>> origin/Max
        )
        try:
            DATABASE.session.add(question)
            DATABASE.session.commit()
            flask.session['messages'].append('Запитання успішно додано!')
        except Exception as error:
            print(error)
            flask.session['messages'].append(f'Помилка при добавлении запитання: {error}')
    if flask_login.current_user.is_authenticated:
        nickname = flask_login.current_user.nickname
        # profile_icon = flask_login.current_user.profile_icon
        email = flask_login.current_user.email
        password = flask_login.current_user.password
    else:
        nickname = ''
        password = ''
        email = ''
        profile_icon = 'profile.png'
    return flask.render_template("create.html", nickname=nickname, email=email, password=password, is_authenticated=flask_login.current_user.is_authenticated)

