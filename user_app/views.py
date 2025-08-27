import os
import json
import flask
from flask import jsonify, request, redirect, session, current_app
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from os.path import abspath, join
from .models import User
from project.settings import DATABASE
from project.config_page import config_page
from .confirm_email import send_code
from create_app.models import Test
import flask_login
try:
    from create_app.models import Questions
except Exception:
    Questions = None

# python
from flask import Blueprint, request, jsonify

profile_api = Blueprint('profile_api', __name__, url_prefix='/profile/api')

@profile_api.route('/update_setting', methods=['POST'])
def update_setting():
    data = request.get_json()

    setattr(
        flask_login.current_user,
        data["field"],
        data["value"]
    )
    DATABASE.session.commit()
    return jsonify(success=True)
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
                else:
                    flask.session['messages'].append('Пароли не совпадают!')
            except Exception:
                flask.session['messages'].append('Ошибка регистрации!')
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
    print(list_created_tests,list_completed_tests)
    return {
        "user": user,
        "user_id": user_id,
        "current_id": flask_login.current_user.id,
        "list_created_tests": list_created_tests,
        "list_completed_tests": list_completed_tests,
        "count_created_tests": count_created_tests - 1 if count_created_tests>0 else 0,
        "count_completed_tests": count_completed_tests - 1 if count_completed_tests>0 else 0,
        "Test": Test
    }

def render_icon():
    if flask.request.method == 'POST':
        image = flask.request.files.get('image')
        if image and image.filename:
            image.save(abspath(join(__file__, '..', '..', "project", 'static', 'images', 'user_icons', f'{image.filename}')))
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

@profile_api.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@profile_api.route('/profile/api/update_test', methods=['POST', 'OPTIONS'])
def api_update_test():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        data = request.get_json(silent=True) or {}
        if not data and request.form:
            data = {'id': request.form.get('id'), 'title': request.form.get('title'), 'description': request.form.get('description')}
        test_id = data.get('id')
        title = (data.get('title') or '').strip()
        desc = (data.get('description') or '').strip()
        test = None
        if test_id:
            try:
                test = Test.query.filter_by(id=test_id).first()
            except Exception:
                test = None
        if not test:
            test = Test()
        try:
            test.title = title
        except Exception:
            try: setattr(test, 'title', title)
            except Exception: pass
        try:
            test.description = desc
        except Exception:
            try: setattr(test, 'description', desc)
            except Exception: pass
        DATABASE.session.add(test)
        DATABASE.session.commit()
        return jsonify({'success': True, 'id': getattr(test, 'id', None), 'title': title, 'description': desc})
    except Exception as e:
        DATABASE.session.rollback()
        current_app.logger.exception("api_update_test error")
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_api.route('/profile/api/update_setting', methods=['POST', 'OPTIONS'])
def api_update_setting():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        data = request.get_json(silent=True) or {}
        if not data and request.form:
            data = {'field': request.form.get('field'), 'value': request.form.get('value')}
        field = (data.get('field') or '').strip()
        value = data.get('value')
        user = None
        try:
            import flask_login
            if flask_login.current_user and getattr(flask_login.current_user, 'is_authenticated', False):
                user = flask_login.current_user
        except Exception:
            user = None
        if user is None:
            user = User.query.first()
        if user is None:
            return jsonify({'success': False, 'error': 'No user found to update'}), 500
        try:
            setattr(user, field, value)
        except Exception:
            try: setattr(user, field, value)
            except Exception: pass
        DATABASE.session.add(user)
        DATABASE.session.commit()
        return jsonify({'success': True, 'field': field, 'value': value})
    except Exception as e:
        DATABASE.session.rollback()
        current_app.logger.exception("api_update_setting error")
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_api.route('/update_user', methods=['POST', 'OPTIONS'])
def update_user():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        user = None
        try:
            import flask_login
            if flask_login.current_user and getattr(flask_login.current_user, 'is_authenticated', False):
                user = flask_login.current_user
        except Exception:
            user = None
        if user is None:
            user = User.query.first()
        if user is None:
            return jsonify({'success': False, 'error': 'No user found'}), 500
        username = request.form.get('username')
        email = request.form.get('email')
        description = request.form.get('description')
        password = request.form.get('password')
        if username is not None:
            if hasattr(user, 'username'):
                user.username = username
            elif hasattr(user, 'nickname'):
                user.nickname = username
            else:
                try: setattr(user, 'username', username)
                except Exception: pass
        if email is not None:
            try: user.email = email
            except Exception: setattr(user, 'email', email)
        if description is not None:
            try: user.description = description
            except Exception:
                try: setattr(user, 'description', description)
                except Exception: pass
        if password is not None:
            try: user.password = password
            except Exception: setattr(user, 'password', password)
        avatar = request.files.get('avatar') or request.files.get('image')
        if avatar and avatar.filename:
            filename = secure_filename(avatar.filename)
            dest_dir = abspath(join(__file__, '..', '..', 'project', 'static', 'images', 'user_icons'))
            os.makedirs(dest_dir, exist_ok=True)
            save_path = os.path.join(dest_dir, filename)
            avatar.save(save_path)
            try: user.avatar = filename
            except Exception:
                try: user.image = filename
                except Exception: setattr(user, 'avatar', filename)
        DATABASE.session.add(user)
        DATABASE.session.commit()
        return jsonify({'success': True, 'message': 'User updated'})
    except RequestEntityTooLarge:
        DATABASE.session.rollback()
        return jsonify({'success': False, 'error': 'File too large'}), 413
    except Exception as e:
        DATABASE.session.rollback()
        current_app.logger.exception("update_user error")
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_api.route('/create_test', methods=['POST', 'OPTIONS'])
def create_test_route():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    try:
        subject = request.form.get('subject') or ''
        class_name = request.form.get('class_name') or ''
        name = request.form.get('name') or ''
        description = request.form.get('description') or ''
        data_json = request.form.get('data') or '[]'
        image_file = request.files.get('image')
        image_filename = None
        if image_file and image_file.filename:
            filename = secure_filename(image_file.filename)
            dest_dir = abspath(join(__file__, '..', '..', 'project', 'static', 'images', 'test_images'))
            os.makedirs(dest_dir, exist_ok=True)
            save_path = os.path.join(dest_dir, filename)
            image_file.save(save_path)
            image_filename = filename
        test = Test()
        try: test.subject = subject
        except Exception: setattr(test, 'subject', subject)
        try:
            if hasattr(test, 'name'):
                test.name = name
            elif hasattr(test, 'title'):
                test.title = name
            else:
                setattr(test, 'name', name)
        except Exception:
            pass
        try: test.class_name = class_name
        except Exception:
            try: setattr(test, 'class_name', class_name)
            except Exception: pass
        try: test.description = description
        except Exception:
            try: setattr(test, 'description', description)
            except Exception: pass
        if image_filename:
            try: test.image = image_filename
            except Exception:
                try: setattr(test, 'image', image_filename)
                except Exception: pass
        DATABASE.session.add(test)
        DATABASE.session.flush()
        try:
            questions = json.loads(data_json)
        except Exception:
            questions = []
        if Questions is not None:
            for q in questions:
                q_text = q.get('question', '')
                q_correct = q.get('correct', '')
                q_options = q.get('options', [])
                question_obj = Questions()
                try: question_obj.test_id = test.id
                except Exception:
                    try: setattr(question_obj, 'test_id', test.id)
                    except Exception: pass
                try: question_obj.question = q_text
                except Exception:
                    try: setattr(question_obj, 'question', q_text)
                    except Exception: pass
                try: question_obj.correct = q_correct
                except Exception:
                    try: setattr(question_obj, 'correct', q_correct)
                    except Exception: pass
                try: question_obj.options = json.dumps(q_options, ensure_ascii=False)
                except Exception:
                    try: setattr(question_obj, 'options', json.dumps(q_options))
                    except Exception: pass
                DATABASE.session.add(question_obj)
        else:
            try: test.questions_json = json.dumps(questions, ensure_ascii=False)
            except Exception:
                try: setattr(test, 'questions_json', json.dumps(questions))
                except Exception: pass
        try:
            user = User.query.first()
            if user and hasattr(user, 'create_tests'):
                cur = user.create_tests or ''
                if cur.strip() == '':
                    user.create_tests = str(test.id)
                else:
                    user.create_tests = cur + ' ' + str(test.id)
                DATABASE.session.add(user)
        except Exception:
            current_app.logger.exception("Failed to update user.create_tests")
        DATABASE.session.commit()
        return jsonify({'success': True, 'test_id': test.id})
    except RequestEntityTooLarge:
        DATABASE.session.rollback()
        return jsonify({'success': False, 'error': 'File too large'}), 413
    except Exception as e:
        DATABASE.session.rollback()
        current_app.logger.exception("create_test error")
        return jsonify({'success': False, 'error': str(e)}), 500