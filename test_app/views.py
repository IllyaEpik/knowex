import flask
from project.config_page import config_page
from create_app.models import Test, Questions


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
        import json
        try:
            answers = json.loads(question.answers)
        except Exception:
            answers = [question.answers]
    selected = None
    if flask.request.method == "POST":
        selected = flask.request.form.get("answer")
        flask.session.setdefault("test_answers", {})[f"{test_id}_{question_id}"] = selected
        if current_index + 1 < total_questions:
            next_question_id = question_ids[current_index + 1]
            return flask.redirect(flask.url_for("test.test_question", test_id=test_id, question_id=next_question_id))
        else:
            return flask.redirect(flask.url_for("test.test_result", test_id=test_id))
    return {
        "test": test,
        "question": question,
        "answers": answers,
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
    answers = flask.session.get("test_answers", {})
    correct = 0
    for qid in question_ids:
        question = Questions.query.filter_by(id=qid).first()
        if not question:
            continue
        user_answer = answers.get(f"{test_id}_{qid}")
        if user_answer and hasattr(question, "correct_answer") and user_answer == question.correct_answer:
            correct += 1
    return {
        "test": test,
        "total_questions": total_questions,
        "correct": correct,
        "answers": answers
    }