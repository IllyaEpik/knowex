from flask import request, jsonify, session
import flask
import json
import flask_login
from .models import Questions, Test
from project.settings import DATABASE
from project.config_page import config_page
from os.path import abspath, join


@config_page("create.html")
def render_create():
    if 'messages' not in session:
        session['messages'] = []
    return {"messages": session['messages']}
                            

def create_test():
    all_questions = ''
    for question in json.loads( request.form.get('data')):
        
        question_object = Questions(
            text = question['question'],
            correct_answer = question['correct'],
            answers = json.dumps(question['options'])
        )
        DATABASE.session.add(question_object)
        DATABASE.session.commit()
        all_questions += f"{question_object.id} "
    test = Test(
        subject = request.form.get('subject'),
        class_name = request.form.get('class_name'),
        questions = all_questions,
        name = request.form.get('name'),
        description = request.form.get('description'),
        user = flask_login.current_user.id,
    )
    DATABASE.session.add(test)
    DATABASE.session.commit()
    
    image = flask.request.files.get('image')
    if image:
        image.save(abspath(join(__file__, '..', '..', "test_app", 'static', 'images', 'test_icons', f'{test.id}.png')))
    else:
        print("No image provided, using default profile image.")
    
    user = flask_login.current_user
    if user.create_tests:
        user.create_tests += f" {test.id}"
    else:
        user.create_tests = str(test.id)
    DATABASE.session.commit()
    return jsonify({'ok':True})

def get_all_tests():
    return jsonify( {'tests':Test.query.all()})
