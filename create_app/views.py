import flask, flask_login
import flask
from .models import Questions
from project.settings import DATABASE
def render_create():
    if flask.request.method == "POST":
        print(flask.request.form)
        question = Questions(
            
            text = flask.request.form['question'],
            answers = flask.request.form['options'],
            correct_answer = flask.request.form['correctAnswer']
            
            
        )
        try:
            DATABASE.session.add(question)
            DATABASE.session.commit()
        except Exception as error:
            print(error)

    return flask.render_template("create.html")
