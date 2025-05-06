import flask, flask_login

def render_main():
    if 'messages' not in flask.session:
        flask.session['messages'] = []
        
    if flask_login.current_user.is_authenticated:
        nickname = flask_login.current_user.nickname
        # profile_icon = flask_login.current_user.profile_icon
        email = flask_login.current_user.email
        password = flask_login.current_user.password
    else:
        nickname = ''
        password = ''
        email = ''
        profile_icon = 'profile.png'
    return flask.render_template("main.html", nickname=nickname, email=email, password=password, is_authenticated=flask_login.current_user.is_authenticated)

def logout():
    flask.session.clear()
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    if 'Ви вийшли з аккаунта' not in flask.session['messages']:
        flask.session['messages'].append('Ви вийшли з аккаунта')
    return flask.redirect('/')