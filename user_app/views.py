import flask, flask_login
from .models import User
from project.settings import DATABASE
def render_user():
    # code  = False
    
    if flask.request.method == "POST":
        # print(flask.request.form)
    
        if flask.request.form['password'] == flask.request.form['Password_confirmation']:
            

            user = User(
                email = flask.request.form['email'],
                password = flask.request.form['password'],
                nickname = flask.request.form['nickname'],
                theme = 1,
                complete_tests = 0,
                create_tests  = 0,
                is_mentor = False
            )

            try:
                DATABASE.session.add(user)
                DATABASE.session.commit()
                # code = "--> authorization"
            except Exception as error:
                return error
        
    return flask.render_template("user.html")            