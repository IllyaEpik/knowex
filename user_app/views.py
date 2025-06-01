import flask, flask_login
from os.path import join, abspath 
from .models import User
from project.settings import DATABASE
from project.config_page import config_page

@config_page("user.html")
def render_user():
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    error = ''    
    if flask.request.method == "POST":
        if flask.request.form.get('auth'):
            if not User.query.filter_by(nickname=flask.request.form['nickname']).all():
                if 'Неправильный логін' not in flask.session['messages']:
                    flask.session['messages'].append('Неправильный логін')
            else:
                for user in User.query.filter_by(nickname=flask.request.form['nickname']):
                    if user.password == flask.request.form['password']:
                        flask.session['messages'].append('Ви успішно увійшли в аккаунт')
                        flask_login.login_user(user)
                        return flask.redirect('/')
                    if user.password != flask.request.form['password']:
                        if 'Неправильний пароль' not in flask.session['messages']:
                            flask.session['messages'].append('Неправильний пароль')

        else:
            if flask.request.form['password'] == flask.request.form['confirm_password']:
                try:
                    nickname = flask.request.form['nickname']

                    user = User(
                        email = flask.request.form['email'],
                        password = flask.request.form['password'],
                        nickname = nickname,
                        complete_tests = 0,
                        create_tests  = 0,
                        is_mentor = False
                    )
                    DATABASE.session.add(user)
                    DATABASE.session.commit()
                    flask.session['messages'].append('Користувач успішно доданий!')
    
                except Exception as error:
                    print(error)
    return {}

def render_icon():
        print("render_iconrthhwreeeeeeeeeerrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
        if flask.request.method == 'POST':
            image = flask.request.files.get('image')
            if image:
                print("kkkkkkkkkkkkkkkkkkkkkkkk")
            if image and image.filename:
                print(f"{image.filename} uploaded for user {flask_login.current_user.nickname}")
                image.save(abspath(join(__file__, '..', '..', "project", 'static', 'images', 'user_icons', f'{flask_login.current_user.nickname}.png'))) 
            else:
                print("No image provided, using default profile image.")
        return flask.redirect(flask.request.referrer or '/')