import flask, flask_sqlalchemy, flask_migrate, flask_login
import os


project = flask.Flask(
    import_name="project",
    template_folder="templates"
)

project.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
DATABASE  = flask_sqlalchemy.SQLAlchemy(app=project)
MIGRATE = flask_migrate.Migrate(app=project , db= DATABASE)
project.jinja_env.add_extension('jinja2.ext.do')