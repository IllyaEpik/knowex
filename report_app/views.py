import flask, flask_login
from project.config_page import config_page
from create_app.models import Test
from user_app.models import User
import random
from flask import request, jsonify


@config_page("report.html")
def render_report(user_id):
    all_ids = [t.id for t in Test.query.with_entities(Test.id).all()]
    random_ids = random.sample(all_ids, len(all_ids))
    tests = Test.query.filter(Test.id.in_(random_ids)).all()
    user = User.query.filter_by(id=user_id).first()
    print()
    filters = None
    if user:
        filters = user.create_tests.split(' ')
        for count in range(len(filters)):
            filters[count] = int(filters[count])
    return {
        "tests": tests,
        'filters':filters
    }

def find_test():
    data = flask.request.get_json(silent=True)
    code = data.get("code")
    from test_app.models import TestCode
    code_obj = TestCode.query.filter_by(session_id=code).first()
    if code_obj:
        return flask.jsonify({"success": True, "test_id": code_obj.test_id})
    return flask.jsonify({"success": False})
