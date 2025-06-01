from project.settings import DATABASE
import flask_login

class User(DATABASE.Model,flask_login.UserMixin):
    id= DATABASE.Column(DATABASE.Integer, primary_key=True)
    nickname = DATABASE.Column(DATABASE.String(255),unique=True)
    email = DATABASE.Column(DATABASE.String(255),unique=True)
    password = DATABASE.Column(DATABASE.String(255))
    is_mentor = DATABASE.Column(DATABASE.Boolean)
    create_tests = DATABASE.Column(DATABASE.Text)
    complete_tests = DATABASE.Column(DATABASE.Text)
    # theme = DATABASE.Column(DATABASE.Boolean)
    def __repr__(self):
        return self.nickname