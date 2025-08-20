import flask, flask_sqlalchemy, flask_migrate, flask_login, flask_socketio
import os
from flask_socketio import SocketIO



project = flask.Flask(
    import_name="project",
    template_folder="templates"
)

socketio = SocketIO(project)
active_tests = {}
sid_to_username = {}

project.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
DATABASE  = flask_sqlalchemy.SQLAlchemy(app=project)
MIGRATE = flask_migrate.Migrate(app=project, db= DATABASE)
project.jinja_env.add_extension('jinja2.ext.do')