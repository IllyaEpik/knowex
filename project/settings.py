import flask, flask_sqlalchemy, flask_migrate, flask_login
import os


project = flask.Flask(
    import_name="project",
    instance_path= os.path.abspath(__file__ + "/.."),
    template_folder="templates"
)

project.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///instance/data.db"
DATABASE  = flask_sqlalchemy.SQLAlchemy(app=project)
MIGRATE = flask_migrate.Migrate(app=project , db= DATABASE)