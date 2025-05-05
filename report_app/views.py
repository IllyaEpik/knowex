import flask, flask_login

def render_report():
    if 'messages' not in flask.session:
        flask.session['messages'] = []

    if flask_login.current_user.is_authenticated:
        nickname = flask_login.current_user.nickname
        profile_icon = flask_login.current_user.profile_icon
        email = flask_login.current_user.email
        password = flask_login.current_user.password
    else:
        nickname = ''
        email = ''
        password = ''
        profile_icon = 'profile.png'
    
    return flask.render_template("report.html", nickname=nickname, email=email, password=password, profile_icon=profile_icon, is_authenticated=flask_login.current_user.is_authenticated)