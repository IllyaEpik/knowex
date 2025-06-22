from flask import request, jsonify, render_template, session
# import sqlite3
import json
# import uuid
import flask_login
from .models import Questions, Test
from project.settings import DATABASE
from project.config_page import config_page


# @app1.route('/create', methods=['GET'])
@config_page("create.html")
def render_create():
    # print('rtyuiopuiuytrewe')
    # if
    # if request.method == 'POST':
    #     return create_test()
    if 'messages' not in session:
        session['messages'] = []

    # try:
    #     if flask_login.current_user.is_authenticated:
    #         nickname = flask_login.current_user.nickname
    #         email = flask_login.current_user.email
    #         password = flask_login.current_user.password
    #     else:
    #         nickname = ''
    #         password = ''
    #         email = ''
            # profile_icon = 'profile.png'

    return render_template("create.html",
                            # is_authenticated=flask_login.current_user.is_authenticated, 
                            messages=session['messages']
                            )
    # except Exception as e:
    #     print(f"Error in render_create: {str(e)}")
    #     session['messages'].append(f'Помилка при відображенні сторінки: {e}')
    #     return render_template("create.html", nickname='', email='', password='', 
    #                           is_authenticated=False, messages=session['messages'])

def create_test():
    
    # class Questions(DATABASE.Model):
    #     id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    #     text = DATABASE.Column(DATABASE.String(255))
    #     image = DATABASE.Column(DATABASE.String(255))
    #     answers = DATABASE.Column(DATABASE.String(255))
    #     correct_answer = DATABASE.Column(DATABASE.String(255))
    #     def __repr__(self):
    #         return self.id
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
    # request.files.get('image')
    # data
    # print()
    test = Test(
        subject = request.form.get('subject'),
        class_name = request.form.get('class_name'),
        questions = all_questions,
        name = request.form.get('name'),
        user = flask_login.current_user.id,
    )
    # image
    DATABASE.session.add(test)
    DATABASE.session.commit()

    return jsonify({'ok':True})

# @app1.route('/all_tests', methods=['GET'])
def get_all_tests():
        return jsonify( {'tests':Test.query.all()})
