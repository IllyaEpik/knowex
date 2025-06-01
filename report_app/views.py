import flask, flask_login
from project.config_page import config_page

@config_page("report.html")
def render_report():
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    
    return {}