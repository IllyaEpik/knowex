from flask import Flask, request, jsonify, render_template, session
import sqlite3
import json
import uuid
import flask_login
from .models import Questions, Test
from project.settings import DATABASE

app1 = Flask(__name__)
DB_NAME = 'test.db'

def init_db():
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS test (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_name TEXT NOT NULL,
                subject TEXT NOT NULL,
                class_name TEXT NOT NULL,
                user_id TEXT NOT NULL DEFAULT 'anonymous'
            );
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS question (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                test_id INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                options TEXT NOT NULL,
                FOREIGN KEY(test_id) REFERENCES test(id) ON DELETE CASCADE
            );
        ''')
        conn.commit()

init_db()

# @app1.route('/create', methods=['GET'])
def render_create():
    # print('rtyuiopuiuytrewe')
    # if
    # if request.method == 'POST':
    #     return create_test()
    if 'messages' not in session:
        session['messages'] = []

    try:
        if flask_login.current_user.is_authenticated:
            nickname = flask_login.current_user.nickname
            email = flask_login.current_user.email
            password = flask_login.current_user.password
        else:
            nickname = ''
            password = ''
            email = ''
            profile_icon = 'profile.png'

        print(f"Rendering create page for user: {nickname}, authenticated: {flask_login.current_user.is_authenticated}")
        return render_template("create.html", nickname=nickname, email=email, password=password, 
                              is_authenticated=flask_login.current_user.is_authenticated, messages=session['messages'])
    except Exception as e:
        print(f"Error in render_create: {str(e)}")
        session['messages'].append(f'Помилка при відображенні сторінки: {e}')
        return render_template("create.html", nickname='', email='', password='', 
                              is_authenticated=False, messages=session['messages'])

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
    # data
    # print()
    test = Test(
        subject = request.form.get('subject'),
        class_name = request.form.get('class_name'),
        questions = all_questions,
        name = request.form.get('name'),
        user = flask_login.current_user.id,
    )
    DATABASE.session.add(test)
    DATABASE.session.commit()

    return jsonify({'ok':True})

@app1.route('/all_tests', methods=['GET'])
def get_all_tests():
    
    # try:
    #     with sqlite3.connect(DB_NAME) as conn:
    #         cursor = conn.cursor()
    #         cursor.execute('SELECT id, test_name, subject, class_name, user_id FROM test')
    #         tests_rows = cursor.fetchall()

    #         all_data = []
    #         for t in tests_rows:
    #             t_id, t_name, t_subject, t_class, t_user_id = t
    #             cursor.execute('''
    #                 SELECT id, question_text, correct_answer, options
    #                 FROM question
    #                 WHERE test_id = ?
    #             ''', (t_id,))
    #             question_rows = cursor.fetchall()

    #             questions_list = []
    #             for qr in question_rows:
    #                 q_id, q_text, q_correct, q_opts_str = qr
    #                 opts = q_opts_str.split('|') if q_opts_str else []
    #                 questions_list.append({
    #                     'question_id': q_id,
    #                     'question_text': q_text,
    #                     'correct_answer': q_correct,
    #                     'options': opts
    #                 })

    #             all_data.append({
    #                 'test_id': t_id,
    #                 'test_name': t_name,
    #                 'subject': t_subject,
    #                 'class_name': t_class,
    #                 'user_id': t_user_id,
    #                 'questions': questions_list
    #             })

        return jsonify( {'tests':Test.query.all()})
