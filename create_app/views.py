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

@app1.route('/create', methods=['GET'])
def render_create():
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

@app1.route('/create', methods=['POST'])
def create_test():
    if request.method == 'GET':
        print("Warning: GET request received, redirecting to render_create")
        return render_create()  # Перенаправлення GET-запитів на render_create

    try:
        print("1. Start of create_test function")  # Перевірка 1: Початок функції
        print(f"Request form data: {dict(request.form)}")  # Логування всіх даних форми
        questions = json.loads(request.form.get('data') or '[]')
        print(f"2. Parsed questions data: {questions}")  # Перевірка 2: Розпакування JSON

        subject = request.form.get('subject', '').strip()
        class_name = request.form.get('class_name', '').strip()
        test_name = request.form.get('name', '').strip()
        print(f"3. Extracted form data - subject: {subject}, class_name: {class_name}, test_name: {test_name}")  # Перевірка 3: Отримані дані

        if not subject or not class_name or not test_name:
            print("4. Validation failed: Missing required fields")  # Перевірка 4: Перевірка полів
            return jsonify({'status': 'error', 'message': 'Не заполнены поля test_name, subject или class_name'}), 400

        user_id = str(uuid.uuid4())
        print(f"5. Generated user_id: {user_id}")  # Перевірка 5: Генерація user_id

        with sqlite3.connect(DB_NAME) as conn:
            print("6. Starting database connection")  # Перевірка 6: Початок з’єднання з БД
            cursor = conn.cursor()

            cursor.execute('''
                INSERT INTO test (test_name, subject, class_name, user_id)
                VALUES (?, ?, ?, ?)
            ''', (test_name, subject, class_name, user_id))
            test_id = cursor.lastrowid
            print(f"7. Inserted into test table, test_id: {test_id}")  # Перевірка 7: Вставка в test

            for q in questions:
                print(f"8. Processing question: {q}")  # Перевірка 8: Обробка кожного питання
                question_text = q.get('question', '').strip()
                correct_answer = q.get('correct', '').strip()
                options_list = q.get('options', [])

                if not question_text or not correct_answer or not isinstance(options_list, list) or len(options_list) == 0:
                    print(f"9. Skipping invalid question: {q}")  # Перевірка 9: Пропуск некоректних питань
                    continue

                options_str = '|'.join([opt.strip() for opt in options_list])
                print(f"10. Formatted options: {options_str}")  # Перевірка 10: Форматування опцій

                cursor.execute('''
                    INSERT INTO question (test_id, question_text, correct_answer, options)
                    VALUES (?, ?, ?, ?)
                ''', (test_id, question_text, correct_answer, options_str))
                print(f"11. Inserted question into question table")  # Перевірка 11: Вставка в question

            conn.commit()
            print("12. Database commit successful")  # Перевірка 12: Завершення транзакції

        return jsonify({'status': 'success', 'test_id': test_id, 'user_id': user_id})

    except Exception as e:
        print(f"13. Exception occurred: {str(e)}")  # Перевірка 13: Обробка винятку
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app1.route('/all_tests', methods=['GET'])
def get_all_tests():
    try:
        with sqlite3.connect(DB_NAME) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT id, test_name, subject, class_name, user_id FROM test')
            tests_rows = cursor.fetchall()

            all_data = []
            for t in tests_rows:
                t_id, t_name, t_subject, t_class, t_user_id = t
                cursor.execute('''
                    SELECT id, question_text, correct_answer, options
                    FROM question
                    WHERE test_id = ?
                ''', (t_id,))
                question_rows = cursor.fetchall()

                questions_list = []
                for qr in question_rows:
                    q_id, q_text, q_correct, q_opts_str = qr
                    opts = q_opts_str.split('|') if q_opts_str else []
                    questions_list.append({
                        'question_id': q_id,
                        'question_text': q_text,
                        'correct_answer': q_correct,
                        'options': opts
                    })

                all_data.append({
                    'test_id': t_id,
                    'test_name': t_name,
                    'subject': t_subject,
                    'class_name': t_class,
                    'user_id': t_user_id,
                    'questions': questions_list
                })

        return jsonify(all_data)

    except Exception as ex:
        return jsonify({'status': 'error', 'message': str(ex)}), 500