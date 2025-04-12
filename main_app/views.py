import flask

def render_main():
    theme = ''
    # theme = ' dark'
    return flask.render_template("main.html",theme=theme)