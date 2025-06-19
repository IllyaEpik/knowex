import flask
from project.config_page import config_page
from create_app.models import Test


def render_test(test_id: int):
    tests = Test.query.filter_by(id=test_id).all()
    if not tests:
        return flask.abort(404)

    return flask.render_template('test.html', tests=tests)

@config_page("test_question.html")
def test_question():
    return {}