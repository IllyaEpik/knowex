import flask, random
from project.config_page import config_page
from create_app.models import Test, Questions
import json
import random
import flask_login 
from project.settings import DATABASE

def render_test(test_id: int):
    tests = Test.query.filter_by(id=test_id).all()
    if not tests:
        return flask.abort(404)

    return flask.render_template('test.html', tests=tests)

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
            print(answers)
        except Exception:
            answers = [question.answers]
    answers += [question.correct_answer]
    answers_list = random.sample(answers, len(answers))
    selected = None
    global list_selected
    list_selected = []
    if flask.request.method == "POST":
        selected = flask.request.form.get("answer")
        test_answers = flask.session.get("test_answers", [])
        print(test_answers)
        test_answers = [item for item in test_answers if item["question_id"] != question_id]
        test_answers.append({"question_id": question_id, "answer": selected})
        flask.session["test_answers"] = test_answers
        flask.session.modified = True
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
        "selected": selected
    }

@config_page("test_result.html")
def test_result(test_id):
    test = Test.query.filter_by(id=test_id).first()
    if not test:
        return flask.abort(404)
    question_ids = [int(qid) for qid in test.questions.split()]
    total_questions = len(question_ids)
    test_answers = flask.session.get("test_answers", [])
    correct = 0
    for qid in question_ids:
        question = Questions.query.filter_by(id=qid).first()
        if not question:
            continue
        user_answer = next((item["answer"] for item in test_answers if item["question_id"] == qid), None)
        if user_answer and user_answer == question.correct_answer:
            correct += 1
    if flask_login.current_user.is_authenticated:
        user = flask_login.current_user
        if user.complete_tests:
            ids = user.complete_tests.split()
            if str(test.id) not in ids:
                user.complete_tests += f" {test.id}"
        else:
            user.complete_tests = str(test.id)
        DATABASE.session.commit()
    flask.session.pop("test_answers", None)

    return {
        "test": test,
        "total_questions": total_questions,
        "answers": test_answers,
        "correct": correct
    }