import flask, flask_login

def render_report():
    if 'messages' not in flask.session:
        flask.session['messages'] = []
# <<<<<<< HEAD
# <<<<<<< HEAD
# =======
# <<<<<<< Max
#     return {}

# =======
# >>>>>>> 87a199501833f1fd35f730efd56f4864efef5f01

    if flask_login.current_user.is_authenticated:
        nickname = flask_login.current_user.nickname
        # profile_icon = flask_login.current_user.profile_icon
        email = flask_login.current_user.email
        password = flask_login.current_user.password
    else:
        nickname = ''
        email = ''
        password = ''
        profile_icon = 'profile.png'
    
    return flask.render_template("report.html", nickname=nickname, email=email, password=password, is_authenticated=flask_login.current_user.is_authenticated)
# <<<<<<< HEAD
# =======
    # return {}

# >>>>>>> origin/Max
# =======
# >>>>>>> master
# >>>>>>> 87a199501833f1fd35f730efd56f4864efef5f01
