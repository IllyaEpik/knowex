import flask, flask_login, random, json, time
from flask import request
from project.config_page import config_page
from create_app.models import Test, Questions
from user_app.models import User
from project.settings import DATABASE, socketio, active_tests, sid_to_username
from flask_socketio import join_room, leave_room, emit




@config_page("test.html")
def render_test(test_id: int):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    user = User.query.filter(User.create_tests.contains(str(test_id))).first()
    user = user.nickname if user else "Unknown"
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    date = time.localtime(test.date)
    time_of_creation = time.strftime('%H:%M', date)
    date = time.strftime('%d.%m.20%y', date)
    return {
        "test": test,
        "name": user,
        "total_questions": total_questions,
        "date": date,
        "time_of_creation": time_of_creation
    }

@config_page("test_host.html")
def render_test_host(test_id):
    test = Test.query.filter_by(id=test_id).first()
    test_id = test_id
    return{
        "test": test,
        "test_id": test_id,
        "host_name": flask_login.current_user.nickname,
        'countQuestions': len(test.questions.split(' '))-1
    }



@config_page("test_user.html")
def render_test_user(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    first_qid = int(test.questions.split()[0])
    return {
        "current_user": flask_login.current_user.nickname if flask_login.current_user.nickname else " ",
        "test": test,
        'count_questions':len(test.questions.split(' '))-1,
        "first_qid": first_qid,
    }
    
@config_page("test_user_quetion.html")
def render_test_user_question(test_id, question_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)

    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)

    if question_id not in question_ids:
        return flask.abort(404)

    current_index = question_ids.index(question_id)
    question = Questions.query.filter_by(id=question_id).first()
    if not question:
        return flask.abort(404)

    answers = []
    if question.answers:
        try:
            answers = json.loads(question.answers)
        except Exception:
            answers = [question.answers]
    answers.append(question.correct_answer)
    answers_list = random.sample(answers, len(answers))
    selected = None

    if flask.request.method == "POST":
        selected = flask.request.form.get("answer")
        is_correct = selected == question.correct_answer

        test_answers = flask.session.get("test_answers", [])
        test_answers = [item for item in test_answers if item["question_id"] != question_id]
        test_answers.append({
            "question_id": question_id,
            "answer": selected,
            "is_correct": is_correct
        })
        flask.session["test_answers"] = test_answers
        flask.session.modified = True

        if flask.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            response_data = {
                "correct_answer": question.correct_answer,
                "question_text": question.text
            }

            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                response_data["next_url"] = flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id)
            else:
                response_data["result_url"] = flask.url_for("test.test_result", test_id=test_id)

            return flask.jsonify(response_data)

        else:
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                return flask.redirect(flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id))
            else:
                return flask.redirect(flask.url_for("test.test_result", test_id=test_id))

    return {
        "test": test,
        "question": question,
        "answers": answers_list,
        "question_id": current_index + 1,
        "total_questions": total_questions,
        "selected": selected,
        "correct_answer": question.correct_answer,
    }

@config_page("test_question.html")
def test_question(test_id, question_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)

    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)

    if question_id not in question_ids:
        return flask.abort(404)

    current_index = question_ids.index(question_id)
    question = Questions.query.filter_by(id=question_id).first()
    if not question:
        return flask.abort(404)

    answers = []
    if question.answers:
        try:
            answers = json.loads(question.answers)
        except Exception:
            answers = [question.answers]
    answers.append(question.correct_answer)
    answers_list = random.sample(answers, len(answers))
    selected = None

    if flask.request.method == "POST":
        selected = flask.request.form.get("answer")
        is_correct = selected == question.correct_answer

        test_answers = flask.session.get("test_answers", [])
        test_answers = [item for item in test_answers if item["question_id"] != question_id]
        test_answers.append({
            "question_id": question_id,
            "answer": selected,
            "is_correct": is_correct
        })
        flask.session["test_answers"] = test_answers
        flask.session.modified = True

        if flask.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                return flask.jsonify({
                    "next_url": flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id)
                })
            else:
                return flask.jsonify({
                    "result_url": flask.url_for("test.test_result", test_id=test_id)
                })
        else:
            if current_index + 1 < total_questions:
                next_question_id = question_ids[current_index + 1]
                return flask.redirect(flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id))
            else:
                return flask.redirect(flask.url_for("test.test_result", test_id=test_id))

    return {
        "test": test,
        "question": question,
        "answers": answers_list,
        "question_id": current_index + 1,
        "total_questions": total_questions,
        "selected": selected,
        "correct_answer": question.correct_answer,
    }


@config_page("test_result.html")
def test_result(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    time_complete = time.localtime(time.time())
    time_date = time.strftime('%d.%m.20%y', time_complete)
    time_text = time.strftime('%H:%M', time_complete)
    # time_complete = time.strftime('%y,%m,d,%H:%M', time_complete)
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    test_answers = flask.session.get("test_answers", [])
    correct = 0
    questions = []
    for qid in question_ids:
        question = Questions.query.filter_by(id=qid).first()
        if not question:
            continue

        user_answer_info = next((item for item in test_answers if item["question_id"] == qid), None)
        user_answer = user_answer_info["answer"] if user_answer_info else None
        is_correct = user_answer_info["is_correct"] if user_answer_info else False

        if is_correct:
            correct += 1

        questions.append({
            "text": question.text,
            "correct_answer": question.correct_answer,
            "user_answer": user_answer,
            "is_correct": is_correct 
        })
    if flask_login.current_user.is_authenticated:
        user = flask_login.current_user
        print(f"User {user.id} completed test {user.complete_tests}")
        if not (str(test.id) in user.complete_tests):
            if user.complete_tests:
                ids = user.complete_tests.split()
                if str(test.id) not in ids:
                    user.complete_tests += f" {test.id}"
                    test.count += 1
            else:
                user.complete_tests = str(test.id)
                test.count += 1
        DATABASE.session.commit()
    flask.session.pop("test_answers", None)
    print({
        "test": test,
        "total_questions": total_questions,
        "time_date": time_date,
        'time_text':time_text,
        "answers": test_answers,
        "correct": correct,
        "questions": questions
    })
    return {
        "test": test,
        "total_questions": total_questions,
        "time_date": time_date,
        'time_text':time_text,
        # "answers": test_answers,
        "correct": correct,
        "questions": questions
    }
# end_test
# {'test': pixel, 
#  'total_questions': 1, 
#  'time_date': '09.07.2025', 
#  'time_text': '19:50', 

# 'correct': 0, 

# }
@socketio.on('end_test')
def end_test(data:dict):
    test_id = data.get('test_id')
    room = f'test_{test_id}'
    test = Test.query.get(int(test_id))
    # time_complete = time.localtime(test.date)
    # time_date = time.strftime('%d.%m.20%y', time_complete)
    # time_text = time.strftime('%H:%M', time_complete)
    user_answers = data.get('user_answers')
    questions = test.questions.split(' ')
    count = len(questions)-1
    print(user_answers)
    
    print(active_tests)
    time_complete = time.localtime(time.time())
    time_date = time.strftime('%d.%m.20%y', time_complete)
    time_text = time.strftime('%H:%M', time_complete)
    data = {
        "test": test.name,
        "time_date": time_date,
        'time_text':time_text,
        "total_questions": count,
        "users": {}
        # "answers": test_answers,
        # "correct": correct,
    }

    # 'questions': [{'text': '3321', 
#                 'correct_answer': '312213213', 
#                 'user_answer': '231213', 
#                 'is_correct': False 
# }]

    for user_answer in user_answers:
        data["users"][user_answer] = {}
        question_in = []
        corrects = 0
        count = 0
        for question_id in questions:
            if question_id:
                # for ans in user_answers[user_answer]:
                ans = user_answers[user_answer][count]
                print('45678908poikjghgf',ans,user_answers[user_answer],1111111111111111)
                question = Questions.query.get(int(question_id))
                correct = str(ans)==str(question.correct_answer)
                question_in.append({
                    'text':question.text,
                    'correct_answer':question.correct_answer,
                    'user_answer':ans,
                    'is_correct':correct
                })
                corrects += correct
                count+=1
                    #  'answers': [{'answer': '231213', 
            #               'is_correct': False, 
            #               'question_id': 34
            #               }], 
        data["users"][user_answer]['questions'] = question_in
        data["users"][user_answer]['correct'] = corrects
    print (data)
    emit('testEnd', data, room=room)
# {
    #    'test': 'pixel', 
    #    'total_questions': 2, 
    #    'users': {
        #       '123': {
            # 'questions': [
                # {
                    # 'text': '3321', 
                    # 'correct_answer': '312213213', 
                    # 'user_answer': '312213213', 
                    # 'is_correct': True}], 
                    # 'correct': 1
                    # }}}
@socketio.on('start_test_command')
def handle_start_cmd(data):
    test_id = data['test_id']
    room = f'test_{test_id}'
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return
    question_ids = [int(qid) for qid in test.questions.split()]
    first_question_id = question_ids[0] if question_ids else None
    emit('test_started', {
        'msg': 'Тест почався!',
        'test_id': test_id,
        'first_question_id': first_question_id
    }, room=room)

@socketio.on('join_test')
def handle_join(data):
    print(f"Користувач приєднався: {data}")
    test_id = data['test_id']
    username = data['username']
    role = data.get('role', 'participant')
    room_name = f'test_{test_id}'

    join_room(room_name)
    sid_to_username[request.sid] = username

    data_cell = active_tests.setdefault(test_id, {'participants': set(), 'results': {}})

    if role == 'host':
        data_cell['host_sid'] = request.sid
        emit('host_ack', {'msg': 'Хост підключено', 'test_id': test_id}, to=request.sid)
    else:
        data_cell['participants'].add(username)
        emit('participants_update', list(data_cell['participants']), room=room_name)
        emit('participant_ack', {'msg': 'Учасник підключився'}, to=request.sid)

@socketio.on('submit_answer') 
def handle_answer(data):
    test_id = data['test_id']
    username = data['username']
    is_ok = data.get('is_correct', False)

    cell = active_tests.get(test_id)
    if not cell:
        return

    cell['results'][username] = cell['results'].get(username, 0) + (1 if is_ok else 0)
    host_sid = cell.get('host_sid')
    if host_sid:
        emit('update_results', cell['results'], to=host_sid)



@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    username = sid_to_username.pop(sid, None)

    for test_id, cell in list(active_tests.items()):
        room_name = f'test_{test_id}'
        if cell.get('host_sid') == sid:
            emit('test_closed', room=room_name)
            del active_tests[test_id]
        else:
            if username and username in cell['participants']:
                cell['participants'].remove(username)
                emit('participants_update', list(cell['participants']), room=room_name)
@socketio.on('participant_answered_with_correct')
def handle_answer_with_correct(data):
    test_id = data.get('test_id')
    user = data.get('user')
    selected = data.get('selected')
    correct = data.get('correct')
    question_text = data.get('question_text')

    cell = active_tests.get(test_id)
    if not cell:
        return

    host_sid = cell.get('host_sid')
    if host_sid:
        emit('show_correct_answer', {
            'user': user,
            'selected': selected,
            'correct': correct,
            'question_text': question_text
        }, to=host_sid)


@socketio.on('next_question')
def next_question(data):
    test_id = data.get('test_id')
    question_number = data.get('question_number')
    room_name = f'test_{test_id}'
    test = Test.query.filter_by(id=int(test_id)).first()
    question_id = test.questions.split(' ')[int(question_number)-1]
    question =Questions.query.get(question_id)
    # random.sample(all_ids, min(5, len(all_ids)))
    answers = json.loads(question.answers) + [question.correct_answer]
    
    emit('nextQuestion', {
            'answers': random.sample(answers,len(answers)),
            'question_text': question.text,
            'question_number':question_number
        }, room=room_name)
    cell = active_tests.get(test_id)
    if not cell:
        return
    host_sid = cell.get('host_sid')
    if host_sid:
        emit('correct', {
            'answer': question.correct_answer
        }, to=host_sid)
# @socketio.on('next_question')
# def cqwwewqeweq(data):
#     room_name = f'test_{test_id}'
#     emit('url',{"data":'something'}, room=room)
#     pass







# end_test

@socketio.on('save_user_answer')
def handle_save_user_answer(data):
    test_id = data.get('test_id')
    username = data.get('username')
    question_id = data.get('question_id')
    answer = data.get('answer')
    correct_answer = data.get('correct_answer')
    question_text = data.get('question_text')

    cell = active_tests.setdefault(test_id, {'participants': set(), 'results': {}, 'answers': {}})
    user_answers = cell['answers'].setdefault(username, [])
    user_answers.append({
        'question_id': question_id,
        'question_text': question_text,
        'answer': answer,
        'correct_answer': correct_answer,
        'is_correct': answer == correct_answer
    })
    # Можно добавить сохранение в базу данных здесь

    emit('user_answer_saved', {'status': 'ok'}, to=request.sid)
@socketio.on('send_answer')
def save_user_answer(data):
    test_id = data.get('test_id')
    room_name = f'test_{test_id}'
    emit('send_answer', data, room=room_name)
# send_answer