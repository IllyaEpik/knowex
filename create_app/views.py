import flask, flask_login
import json
from .models import Questions, Test
from project.settings import DATABASE

def render_create():
    if 'messages' not in flask.session:
        flask.session['messages'] = []

    if flask.request.method == "POST":
        
        
        try:
            id_question = []
            for question_form in json.loads(flask.request.form.get('data')):

                question = Questions(
                    text = question_form["question"],
                    correct_answer= question_form["correct"],
                    answers = json.dumps(question_form["options"])
                )
                DATABASE.session.add(question)
                DATABASE.session.commit()
                id_question.append(str(question.id))
                print(id_question,question.id)
                # flask.session['messages'].append('Запитання успішно додано!')
            test = Test(
                user = flask_login.current_user.id, 
                questions = json.dumps(id_question),
                subject = 'NONE',
                class_name = "NONE",
                name = "NONE",
                count = len(id_question)
            )
            DATABASE.session.add(test)
            DATABASE.session.commit()
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
    # try:
        
    #     flask.session['messages'].append('Запитання успішно додано!')
    # except Exception as error:
    #     print(error)
    #     flask.session['messages'].append(f'Помилка при добавлении запитання: {error}')
    return flask.render_template("create.html", nickname=nickname, email=email, password=password, is_authenticated=flask_login.current_user.is_authenticated)

