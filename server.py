# from flask import Flask, request, jsonify
# import sqlite3
# import json

# app1 = Flask(__name__)
# DB_NAME = 'test.db'


# def init_db():
#     with sqlite3.connect(DB_NAME) as conn:
#         cursor = conn.cursor()

#         cursor.execute('''
#             CREATE TABLE IF NOT EXISTS test (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 test_name TEXT NOT NULL,
#                 subject TEXT NOT NULL,
#                 class_name TEXT NOT NULL
#             );
#         ''')

#         cursor.execute('''
#             CREATE TABLE IF NOT EXISTS question (
#                 id INTEGER PRIMARY KEY AUTOINCREMENT,
#                 test_id INTEGER NOT NULL,
#                 question_text TEXT NOT NULL,
#                 correct_answer TEXT NOT NULL,
#                 options TEXT NOT NULL,
#                 FOREIGN KEY(test_id) REFERENCES test(id) ON DELETE CASCADE
#             );
#         ''')
#         conn.commit()

# init_db()


# @app1.route('/create', methods=['POST'])
# def create_test():
#     try:

#         questions = json.loads(request.form.get('data') or '[]')
#         subject = request.form.get('subject', '').strip()
#         class_name = request.form.get('class_name', '').strip()
#         test_name = request.form.get('name', '').strip()

#         if not subject or not class_name or not test_name:
#             return jsonify({'status': 'error', 'message': 'Не заполнены поля test_name, subject или class_name'}), 400

#         with sqlite3.connect(DB_NAME) as conn:
#             cursor = conn.cursor()

#             cursor.execute('''
#                 INSERT INTO test (test_name, subject, class_name)
#                 VALUES (?, ?, ?)
#             ''', (test_name, subject, class_name))
#             test_id = cursor.lastrowid

#             for q in questions:
#                 question_text = q.get('question', '').strip()
#                 correct_answer = q.get('correct', '').strip()
#                 options_list = q.get('options', [])

#                 if not question_text or not correct_answer or not isinstance(options_list, list) or len(options_list) == 0:
#                     continue

                
#                 options_str = '|'.join([opt.strip() for opt in options_list])

#                 cursor.execute('''
#                     INSERT INTO question (test_id, question_text, correct_answer, options)
#                     VALUES (?, ?, ?, ?)
#                 ''', (test_id, question_text, correct_answer, options_str))

#             conn.commit()

#         return jsonify({'status': 'success', 'test_id': test_id})

#     except Exception as e:
        
#         return jsonify({'status': 'error', 'message': str(e)}), 400



# @app1.route('/all_tests', methods=['GET'])
# def get_all_tests():
#     try:
#         with sqlite3.connect(DB_NAME) as conn:
#             cursor = conn.cursor()
            
#             cursor.execute('SELECT id, test_name, subject, class_name FROM test')
#             tests_rows = cursor.fetchall()

#             all_data = []
#             for t in tests_rows:
#                 t_id, t_name, t_subject, t_class = t
                
#                 cursor.execute('''
#                     SELECT id, question_text, correct_answer, options
#                     FROM question
#                     WHERE test_id = ?
#                 ''', (t_id,))
#                 question_rows = cursor.fetchall()

#                 questions_list = []
#                 for qr in question_rows:
#                     q_id, q_text, q_correct, q_opts_str = qr
#                     opts = q_opts_str.split('|') if q_opts_str else []
#                     questions_list.append({
#                         'question_id': q_id,
#                         'question_text': q_text,
#                         'correct_answer': q_correct,
#                         'options': opts
#                     })

#                 all_data.append({
#                     'test_id': t_id,
#                     'test_name': t_name,
#                     'subject': t_subject,
#                     'class_name': t_class,
#                     'questions': questions_list
#                 })

#         return jsonify(all_data)

#     except Exception as ex:
#         return jsonify({'status': 'error', 'message': str(ex)}), 500



