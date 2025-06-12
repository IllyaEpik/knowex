import flask
from project.config_page import config_page
from create_app.models import Test


def render_test():
    return flask.render_template('test.html')

@config_page("test_question.html")
def test_question():
    return {}