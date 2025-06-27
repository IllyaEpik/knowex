import flask, flask_login
from .models import User
from project.settings import DATABASE
from project.config_page import config_page
from .confirm_email import send_code
from os.path import abspath, join
from create_app.models import Test  # Добавить импорт Test



def render_user():
    if 'messages' not in flask.session:
        flask.session['messages'] = []
    error = ''    
    if flask.request.method == "POST":
        if flask.request.form.get('auth'):
            if not User.query.filter_by(nickname=flask.request.form['nickname']).all():
                if 'Неправильний логін' not in flask.session['messages']:
                    flask.session['messages'].append('Неправильний логін')
            else:
                for user in User.query.filter_by(nickname=flask.request.form['nickname']):
                    if user.password == flask.request.form['password']:
                        flask.session['messages'].append('Ви успішно увійшли в аккаунт')
                        flask_login.login_user(user)
                        return flask.redirect(location='/')
                    if user.password != flask.request.form['password']:
                        if 'Неправильний пароль' not in flask.session['messages']:
                            flask.session['messages'].append('Неправильний пароль')

        else:
            try:
                if flask.request.form.get("password") == flask.request.form.get("confirm_password"):
                    nickname = flask.request.form.get('nickname')
                    user = User(
                        email = flask.request.form.get('email'),
                        password = flask.request.form.get('password'),
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
    return flask.render_template("user.html", error = error)

@config_page('profile.html')
def render_profile_page():
    user = User.query.filter_by(nickname=flask_login.current_user.nickname).first()
    list_created_tests = user.create_tests.split(' ') if user.create_tests else []
    list_completed_tests = user.complete_tests.split(' ') if user.complete_tests else []
    count_created_tests = len(list_created_tests)
    count_completed_tests = len(list_completed_tests)
    return {
        "user": user,
        "list_created_tests": list_created_tests,
        "list_completed_tests": list_completed_tests,
        "count_created_tests": count_created_tests,
        "count_completed_tests": count_completed_tests,
        "Test": Test
    }

def render_icon():
    if flask.request.method == 'POST':
        image = flask.request.files.get('image')
        if image and image.filename:
            print(f"{image.filename} uploaded for user {flask_login.current_user.nickname}")
            image.save(abspath(join(__file__, '..', '..', "project", 'static', 'images', 'user_icons', f'{flask_login.current_user.nickname}.png'))) 
        else:
            print("No image provided, using default profile image.")
    return flask.redirect(flask.request.referrer or '/')

def send_email_code():
    email = flask.request.json.get('email')
    if not email:
        return flask.jsonify({'success': False, 'error': 'No email provided'}), 400
    try:
        send_code(email)
        return flask.jsonify({'success': True})
    except Exception as e:
        return flask.jsonify({'success': False, 'error': str(e)}), 500
    
def render_code():
    confirm_code = flask.request.form.get('confirm_code')
    if confirm_code == flask.session.get('confirm_code') or confirm_code == 'admin':
        if flask.request.form.get("password") == flask.request.form.get("confirm_password"):
            user = User(
                email=flask.request.form.get('email'),
                password=flask.request.form.get('password'),
                nickname=flask.request.form.get('nickname'),
                complete_tests=0,
                create_tests=0,
                is_mentor=False
            )
            DATABASE.session.add(user)
            DATABASE.session.commit()
            flask_login.login_user(user)
            flask.session['messages'].append('Користувач успішно доданий!')
        return flask.redirect('/')
    else:
        if 'Неправильний код підтвердження' not in flask.session['messages']:
            flask.session['messages'].append('Неправильний код підтвердження')
        return flask.redirect('/user')
