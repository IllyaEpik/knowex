import flask, flask_login
from project.config_page import config_page
from create_app.models import Test
from user_app.models import User
import random


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
