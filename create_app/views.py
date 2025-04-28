import flask, flask_login

def render_create():
    # nickname = flask_login.current_user.nickname 
    return flask.render_template("create.html")