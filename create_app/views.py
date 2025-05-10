import flask, flask_login
import flask
from .models import Questions, Test
from project.settings import DATABASE

def render_create():
    if 'messages' not in flask.session:
        flask.session['messages'] = []

    if flask.request.method == "POST":
        print(flask.request.form)
        question = Questions(
            text = flask.request.form['text'],
            answers = flask.request.form.get('answer'),
            correct_answers = flask.request.form.get('correct_answer')
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
        email = flask_login.current_user.email
        password = flask_login.current_user.password
    else:
        nickname = ''
        password = ''
        email = ''
        profile_icon = 'profile.png'
    try:
        test = Test(
            user = flask_login.current_user.id, 
        )
        DATABASE.session.add(test)
        DATABASE.session.commit()
        flask.session['messages'].append('Запитання успішно додано!')
    except Exception as error:
        print(error)
        flask.session['messages'].append(f'Помилка при добавлении запитання: {error}')
    return flask.render_template("create.html", nickname=nickname, email=email, password=password, is_authenticated=flask_login.current_user.is_authenticated)

