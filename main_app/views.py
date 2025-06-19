import flask, flask_login
from project.config_page import config_page
from create_app.models import Test
import random

@config_page("main.html")
def render_main():
    all_ids = [t.id for t in Test.query.with_entities(Test.id).all()]
    random_ids = random.sample(all_ids, min(5, len(all_ids)))
    tests = Test.query.filter(Test.id.in_(random_ids)).all()
    id_image = str(Test.id)
    return {
        "tests": tests, 
        "id_image": id_image
    }

def logout():
    flask.session.clear()
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    if 'Ви вийшли з аккаунта' not in flask.session['messages']:
        flask.session['messages'].append('Ви вийшли з аккаунта')
    return flask.redirect('/')