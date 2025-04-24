import flask, flask_login
from .models import User
from project.settings import DATABASE
def render_user():
    
    if flask.request.method == "POST":
        print(flask_login.current_user.is_authenticated)
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
        
    return flask.render_template("user.html")            
# def render_login_page():
    
#     if flask_login.current_user.is_authenticated:
#         return flask.redirect('/')
#     else:
        
#         if flask.request.method == "POST":
#             for user in User.query.filter_by(login=flask.request.form['login']):
#                 if user.nickname == flask.request.form['nickname']:
#                     flask_login.login_user(user)
#             if  code:
#                 for user in User.query.filter_by(email=flask.request.form['login']):
#                     if user.password == flask.request.form['password']:
#                         flask_login.login_user(user)
#                         code = False
                        
# <<<<<<< HEAD
#     return flask.render_template("user.html")           
# =======
    # return flask.render_template("user.html")           

def render_profile_page():
    return flask.render_template("profile.html")
# >>>>>>> origin/Max
