import flask, flask_login
from .models import User
from project.settings import DATABASE
def render_user():
    
    if flask.request.method == "POST":
        if flask.request.form.get('auth'):
            for user in User.query.filter_by(nickname=flask.request.form['nickname']):
                if user.password == flask.request.form['password']:
                    print(user)
                    flask_login.login_user(user)
                    print(flask_login.current_user.is_authenticated)
                    
        else:
            if flask.request.form['password'] == flask.request.form['confirm_password']:
                

                user = User(
                    email = flask.request.form['email'],
                    password = flask.request.form['password'],
                    nickname = flask.request.form['nickname'],
                    # theme = 1,
                    complete_tests = 0,
                    create_tests  = 0,
                    is_mentor = False
                )

                try:
                    DATABASE.session.add(user)
                    DATABASE.session.commit()
                except Exception as error:
                    print(error)
        
    return flask.render_template("user.html", nickname=flask_login.current_user.nickname)            
     

def render_profile_page():
    password = flask_login.current_user.password
    email = flask_login.current_user.email
    # nickname = flask_login.current_user.nickname
    return flask.render_template("profile.html", password=password, email=email)