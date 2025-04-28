import flask, flask_login
def render_report():
    # nickname = flask_login.current_user.nickname 
    return flask.render_template("report.html")