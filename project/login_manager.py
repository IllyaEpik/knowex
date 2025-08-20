import flask_login
from .settings import project
from user_app.models import User

project.secret_key = "KEY"
login_manager = flask_login.LoginManager(app = project)

@login_manager.user_loader
def load_user(id):
    return User.query.get(id)