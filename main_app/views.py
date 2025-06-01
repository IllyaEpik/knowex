import flask, flask_login
from project.config_page import config_page

@config_page("main.html")
def render_main():
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    return {}

def logout():
    flask.session.clear()
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    if 'Ви вийшли з аккаунта' not in flask.session['messages']:
        flask.session['messages'].append('Ви вийшли з аккаунта')
    return flask.redirect('/')