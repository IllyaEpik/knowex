import flask, flask_login
from project.config_page import config_page
from create_app.models import Test
import random


@config_page("report.html")
def render_report():
    all_ids = [t.id for t in Test.query.with_entities(Test.id).all()]
    random_ids = random.sample(all_ids, len(all_ids))
    tests = Test.query.filter(Test.id.in_(random_ids)).all()
    return {
        "tests": tests
    }
