import flask, flask_login
import flask
from .models import Questions
from project.settings import DATABASE
def render_create():
    if flask.request.method == "POST":
        question = Questions(
            
            text = flask.request.form['text'],
            answers = flask.request.form['answer'],
            correct_answers = flask.request.form['correct_answer']
            
            
        )
        try:
            DATABASE.session.add(question)
            DATABASE.session.commit()
        except Exception as error:
            print(error)

    return flask.render_template("create.html")
