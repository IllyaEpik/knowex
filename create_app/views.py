from flask import request, jsonify, session
import flask
import json
import flask_login
from .models import Questions, Test
from project.settings import DATABASE
from project.config_page import config_page
from os.path import abspath, join
import time

@config_page("create.html")
def render_create():
    if 'messages' not in session:
        session['messages'] = []
    return {"messages": session['messages']}
                            

def create_test():

    print('eqweqweweqw')
    if not flask_login.current_user.is_authenticated:
        return jsonify({'error': 1})
    all_questions = ''
    questionsTest = json.loads( request.form.get('data'))
    print(request.form.get('data'))
    for question in questionsTest:
        print(question,type(question))
        question = json.loads( question)
        question = json.loads(questionsTest[str(question)])
        print(question,type(question))
        # if type(question)!=type(1):
        correct = question['correct']
        print(correct)
        typeQuestion = "standart"
        if type(correct) != type("31132"): 
            correct = json.dumps(correct)
            typeQuestion = "multiple"
        question_object = Questions(
            text = question['question'],
            correct_answer = correct,
            answers = json.dumps(question['answers']),
            type = typeQuestion
        )
        DATABASE.session.add(question_object) 
        DATABASE.session.commit()
        all_questions += f"{question_object.id} "
    description = request.form.get('description')
    test = Test(
        subject = request.form.get('subject'),
        class_name = request.form.get('class_name'),
        questions = all_questions,
        name = request.form.get('name'),
        description = description,
        user = flask_login.current_user.id,
        date = int(time.time()),
        count = 0
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
    return jsonify({'ok':True,'error':0})

def get_all_tests():
    return jsonify( {'tests':Test.query.all()} )