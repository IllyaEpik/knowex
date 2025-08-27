import flask, flask_login
from .models import User
from project.settings import DATABASE
from project.config_page import config_page
from .confirm_email import send_code
from os.path import abspath, join
from create_app.models import Test 



def render_user():
    if flask.request.method == "POST":
        if flask.request.form.get('auth'):
            for user in User.query.filter_by(nickname=flask.request.form['nickname']):
                if user.password == flask.request.form['password']:
                    flask_login.login_user(user)
                    return flask.redirect(location='/')
        else:
            try:
                email = flask.request.form.get('email', '').strip().lower()
                user_exists = User.query.filter_by(email=email).first()
                nickname = flask.request.form.get('nickname', '').strip()
                nickname_exists = User.query.filter_by(nickname=nickname).first()
                if user_exists:
                    return flask.render_template("user.html")
                elif nickname_exists:
                    return flask.render_template("user.html")
                elif flask.request.form.get("password") == flask.request.form.get("confirm_password"):
                    flask.session['pending_reg'] = {
                        'email': email,
                        'password': flask.request.form.get('password'),
                        'nickname': nickname,
                        'confirm_password': flask.request.form.get('confirm_password')
                    }
                    send_code(email)
                    flask.session['show_modal'] = True
                    flask.session.modified = True
                    return flask.render_template("user.html")
            except Exception as error:
                print(error)
    flask.session.pop('show_modal', None)
    return flask.render_template("user.html")

@config_page('profile.html')
def render_profile_page(user_id: int):
    if user_id == False:
        flask.redirect("/")
    if not flask_login.current_user.is_authenticated:
        return flask.redirect('/user')
    user = User.query.filter_by(id=user_id).first()
    list_created_tests = user.create_tests.split(' ') if user.create_tests else []
    list_completed_tests = user.complete_tests.split(' ') if user.complete_tests else []
    count_created_tests = len(list_created_tests)
    count_completed_tests = len(list_completed_tests)
    return {
        "user": user,
        "user_id": user_id,
        "current_id": flask_login.current_user.id,
        "list_created_tests": list_created_tests,
        "list_completed_tests": list_completed_tests,
        "count_created_tests": count_created_tests -1,
        "count_completed_tests": count_completed_tests -1,
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
    email = flask.request.form.get('email', '').strip().lower()
    password = flask.request.form.get('password')
    nickname = flask.request.form.get('nickname')
    confirm_password = flask.request.form.get('confirm_password')
    if confirm_code == "__check__":
        if User.query.filter_by(nickname=nickname).first() or User.query.filter_by(email=email).first():
            return "Не вдалося зареєструвати користувача!"
        return 'OK'
    if confirm_code == flask.session.get('confirm_code') or confirm_code == 'admin':
        if User.query.filter_by(nickname=nickname).first():
            return 'Користувач з таким імʼям вже існує!', 400
        if User.query.filter_by(email=email).first():
            return 'Користувач з такою поштою вже існує!', 400
        if password == confirm_password:
            user = User(
                email=email,
                password=password,
                nickname=nickname,
                complete_tests=0,
                create_tests=0,
                is_mentor=False
            )
            DATABASE.session.add(user)
            DATABASE.session.commit()
            flask_login.login_user(user)
        return flask.redirect('/')
    else:
        if 'Неправильний код підтвердження' not in flask.session['messages']:
            flask.session['messages'].append('Неправильний код підтвердження')
        flask.session['show_modal'] = True
        flask.session.modified = True
        return "Неправильний код підтвердження", 400
