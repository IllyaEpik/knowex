import flask, flask_login

def render_main():
    theme = ''
    # nickname = flask_login.current_user.nickname
    return flask.render_template("main.html",theme=theme)