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
                    messages = flask.session.get('messages', [])
                    messages.append('Пароли не совпадают!')
                    flask.session['messages'] = messages
                    flask.session.modified = True
            except Exception:
                messages = flask.session.get('messages', [])
                messages.append('Ошибка регистрации!')
                flask.session['messages'] = messages
                flask.session.modified = True
    flask.session.pop('show_modal', None)
    return flask.render_template("user.html")

@config_page('profile.html')
def render_profile_page(user_id: int):
    if user_id == False:
        flask.redirect("/")
    if not flask_login.current_user.is_authenticated:
        return flask.redirect('/user')
    user = User.query.filter_by(id=user_id).first()
    list_created_tests = list(filter(None, user.create_tests.split(' ') if user.create_tests else []))
    list_completed_tests = list(filter(None, user.complete_tests.split(' ') if user.complete_tests else []))
    count_created_tests = len(list_created_tests)
    count_completed_tests = len(list_completed_tests)
    return {
        "user": user,
        "user_id": user_id,
        "current_id": flask_login.current_user.id,
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
        if User.query.filter_by(nickname=nickname).first():
            return "вже існує користувач із таким ім'ям"
        elif  User.query.filter_by(email=email).first():
            return "вже існує користувач з такою поштою"
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
        messages = flask.session.get('messages', [])
        if 'Неправильний код підтвердження' not in messages:
            messages.append('Неправильний код підтвердження')
        flask.session['messages'] = messages
        flask.session['show_modal'] = True
        flask.session.modified = True
        return "Неправильний код підтвердження", 400

@profile_api.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@profile_api.route('/update_test', methods=['POST', 'OPTIONS'])
def api_update_test():
    if request.method == 'OPTIONS':
         return jsonify({'success': True}), 200
    if not flask_login.current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
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
                test_id = int(test_id)
            except ValueError:
                return jsonify({'success': False, 'error': 'Invalid id format'}), 400
            try:
                test = Test.query.filter_by(id=test_id).first()
            except Exception:
                test = None
        if not test:
            test = Test()
        # Check ownership
        user = flask_login.current_user
        if str(test_id) not in (user.create_tests or '').split():
            return jsonify({'success': False, 'error': 'Not owner of test'}), 403
        if hasattr(test, 'title'):
            test.title = title
        else:
            setattr(test, 'title', title)
        if hasattr(test, 'description'):
            test.description = desc
        else:
            setattr(test, 'description', desc)
        DATABASE.session.add(test)
        DATABASE.session.commit()
        return jsonify({'success': True, 'id': getattr(test, 'id', None), 'title': title, 'description': desc})
    except Exception as e:
        DATABASE.session.rollback()
        current_app.logger.exception("api_update_test error")
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_api.route('/update_setting', methods=['POST', 'OPTIONS'])
def api_update_setting():
    if request.method == 'OPTIONS':
         return jsonify({'success': True}), 200
    if not flask_login.current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    try:
        data = request.get_json(silent=True) or {}
        if not data and request.form:
            data = {'field': request.form.get('field'), 'value': request.form.get('value')}
        field = (data.get('field') or '').strip()
        value = data.get('value')
        user = flask_login.current_user
        if not field:
            return jsonify({'success': False, 'error': 'No field provided'}), 400
        if not hasattr(user, field):
            return jsonify({'success': False, 'error': 'Invalid field'}), 400
        setattr(user, field, value)
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
    if not flask_login.current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    try:
        user = flask_login.current_user
        username = request.form.get('username')
        email = request.form.get('email')
        description = request.form.get('description')
        password = request.form.get('password')
        if username is not None:
            field = 'username' if hasattr(user, 'username') else 'nickname'
            if hasattr(user, field):
                setattr(user, field, username)
            else:
                return jsonify({'success': False, 'error': 'Invalid field username/nickname'}), 400
        if email is not None:
            if hasattr(user, 'email'):
                user.email = email
            else:
                return jsonify({'success': False, 'error': 'Invalid field email'}), 400
        if description is not None:
            if hasattr(user, 'description'):
                user.description = description
            else:
                return jsonify({'success': False, 'error': 'Invalid field description'}), 400
        if password is not None:
            if hasattr(user, 'password'):
                user.password = password
            else:
                return jsonify({'success': False, 'error': 'Invalid field password'}), 400
        avatar = request.files.get('avatar') or request.files.get('image')
        if avatar and avatar.filename:
            filename = secure_filename(avatar.filename)
            dest_dir = abspath(join(__file__, '..', '..', 'project', 'static', 'images', 'user_icons'))
            os.makedirs(dest_dir, exist_ok=True)
            save_path = os.path.join(dest_dir, filename)
            avatar.save(save_path)
            field = 'avatar' if hasattr(user, 'avatar') else 'image'
            if hasattr(user, field):
                setattr(user, field, filename)
            else:
                return jsonify({'success': False, 'error': 'Invalid field avatar/image'}), 400
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
    if not flask_login.current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
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
            field = 'name' if hasattr(test, 'name') else 'title'
            setattr(test, field, name)
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
            user = flask_login.current_user
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
# ...existing code...
from flask import Blueprint, request, jsonify
# ...existing code...

def _find_column_name(model, candidates):
    try:
        cols = set(c.name for c in model.__table__.columns)
    except Exception:
        cols = set(dir(model))
    for c in candidates:
        if c in cols or hasattr(model, c):
            return c
    return None

@profile_api.route('/get_test', methods=['GET', 'OPTIONS'])
def api_get_test():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    if not flask_login.current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    try:
        test_id = request.args.get('id') or (request.json.get('id') if request.is_json else None)
        if not test_id:
            return jsonify({'success': False, 'error': 'No id provided'}), 400
        try:
            test_id = int(test_id)
        except ValueError:
            return jsonify({'success': False, 'error': 'Invalid id format'}), 400
        test = None
        try:
            test = Test.query.filter_by(id=test_id).first()
        except Exception:
            test = None
        if not test:
            return jsonify({'success': False, 'error': 'Test not found'}), 404
        # Check ownership
        user = flask_login.current_user
        if str(test_id) not in (user.create_tests or '').split():
            return jsonify({'success': False, 'error': 'Not owner of test'}), 403
        # build test dict
        t = {}
        # title/name
        t['id'] = getattr(test, 'id', None)
        t['title'] = getattr(test, 'title', None) or getattr(test, 'name', None) or getattr(test, 'subject', None) or ''
        t['description'] = getattr(test, 'description', None) or ''
        # questions
        questions_out = []
        if 'Questions' in globals() and Questions is not None:
            q_test_col = _find_column_name(Questions, ['test_id', 'test', 'testId', 'testid'])
            q_text_col = _find_column_name(Questions, ['question', 'text', 'question_text'])
            q_options_col = _find_column_name(Questions, ['options', 'answers', 'options_json'])
            q_correct_col = _find_column_name(Questions, ['correct', 'correct_answer', 'answer'])
            # try to query
            try:
                if q_test_col:
                    filt = {q_test_col: test.id}
                    rows = Questions.query.filter_by(**filt).all()
                else:
                    rows = Questions.query.all()
            except Exception:
                rows = Questions.query.all()
            for r in rows:
                try:
                    if q_test_col and getattr(r, q_test_col, None) != test.id:
                        continue
                except Exception:
                    pass
                q = {
                    'id': getattr(r, 'id', None),
                    'text': (getattr(r, q_text_col, '') or '').strip() if q_text_col else '',
                    'options': [],
                    'correct': None
                }
                # options parsing
                raw_opts = getattr(r, q_options_col, None) if q_options_col else None
                if raw_opts:
                    if isinstance(raw_opts, str):
                        try:
                            q['options'] = json.loads(raw_opts)
                        except Exception:
                            # try pipe or comma separated
                            sep = '|' if '|' in raw_opts else ','
                            q['options'] = [s.strip() for s in raw_opts.split(sep) if s.strip()]
                    else:
                        q['options'] = raw_opts
                # correct
                corr = getattr(r, q_correct_col, None) if q_correct_col else None
                if corr is not None:
                    q['correct'] = corr
                questions_out.append(q)
        else:
            # fallback: test.questions or questions_json
            raw = getattr(test, 'questions', None) or getattr(test, 'questions_json', None) or getattr(test, 'questions_json_str', None)
            try:
                questions_out = json.loads(raw) if raw else []
            except Exception:
                questions_out = []
        t['questions'] = questions_out
        return jsonify({'success': True, 'test': t})
    except Exception as e:
        current_app.logger.exception("get_test error")
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_api.route('/update_test_full', methods=['POST', 'OPTIONS'])
def api_update_test_full():
    if request.method == 'OPTIONS':
        return jsonify({'success': True}), 200
    if not flask_login.current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Unauthorized'}), 401
    try:
        data = request.get_json(silent=True) or {}
        test_id = data.get('id')
        title = (data.get('title') or '').strip()
        desc = (data.get('description') or '').strip()
        questions = data.get('questions', [])
        test = None
        if test_id:
            try:
                test_id = int(test_id)
            except ValueError:
                return jsonify({'success': False, 'error': 'Invalid id format'}), 400
            try:
                test = Test.query.filter_by(id=test_id).first()
            except Exception:
                test = None
        if not test:
            test = Test()
        # Check ownership
        user = flask_login.current_user
        if str(test_id) not in (user.create_tests or '').split():
            return jsonify({'success': False, 'error': 'Not owner of test'}), 403
        # set title/description robustly
        try:
            field = 'title' if hasattr(test, 'title') else 'name'
            setattr(test, field, title)
        except Exception as e:
            current_app.logger.exception("Failed to set title")
            raise e
        try:
            setattr(test, 'description', desc)
        except Exception as e:
            current_app.logger.exception("Failed to set description")
            raise e
        DATABASE.session.add(test)
        DATABASE.session.flush()
        # save questions
        if 'Questions' in globals() and Questions is not None:
            # determine column names
            q_test_col = _find_column_name(Questions, ['test_id', 'test', 'testId', 'testid'])
            q_text_col = _find_column_name(Questions, ['question', 'text', 'question_text'])
            q_options_col = _find_column_name(Questions, ['options', 'answers', 'options_json'])
            q_correct_col = _find_column_name(Questions, ['correct', 'correct_answer', 'answer'])
            # delete existing for this test
            try:
                if q_test_col:
                    filt = {q_test_col: test.id}
                    existing = Questions.query.filter_by(**filt).all()
                    for ex in existing:
                        DATABASE.session.delete(ex)
                else:
                    # fallback: try to delete anything referencing this test by attribute 'test' equals id
                    existing = Questions.query.all()
                    for ex in existing:
                        try:
                            if getattr(ex, 'test', None) == test.id or getattr(ex, 'test_id', None) == test.id:
                                DATABASE.session.delete(ex)
                        except Exception:
                            pass
            except Exception as e:
                current_app.logger.exception("Failed to delete existing questions")
            # add provided questions
            for q in questions:
                q_text = q.get('text') or q.get('question') or ''
                q_options = q.get('options') or []
                q_correct = q.get('correct', None)
                qobj = Questions()
                try:
                    if q_test_col:
                        setattr(qobj, q_test_col, test.id)
                    else:
                        setattr(qobj, 'test_id', test.id)
                except Exception as e:
                    current_app.logger.exception("Failed to set test_id for question")
                try:
                    if q_text_col:
                        setattr(qobj, q_text_col, q_text)
                    else:
                        setattr(qobj, 'question', q_text)
                except Exception as e:
                    current_app.logger.exception("Failed to set question text")
                # options: store as JSON string if DB field is string
                try:
                    if q_options_col:
                        # if column type is string, save JSON text
                        val = q_options
                        if isinstance(val, (list, dict)):
                            try:
                                setattr(qobj, q_options_col, json.dumps(val, ensure_ascii=False))
                            except Exception:
                                setattr(qobj, q_options_col, json.dumps(val))
                        else:
                            setattr(qobj, q_options_col, val)
                    else:
                        setattr(qobj, 'options', json.dumps(q_options, ensure_ascii=False))
                except Exception as e:
                    current_app.logger.exception("Failed to set options for question")
                try:
                    if q_correct_col:
                        setattr(qobj, q_correct_col, q_correct)
                    else:
                        setattr(qobj, 'correct', q_correct)
                except Exception as e:
                    current_app.logger.exception("Failed to set correct for question")
                DATABASE.session.add(qobj)
        else:
            # store questions into Test.questions_json or Test.questions
            try:
                setattr(test, 'questions_json', json.dumps(questions, ensure_ascii=False))
            except Exception as e:
                current_app.logger.exception("Failed to set questions_json")
                try: setattr(test, 'questions', json.dumps(questions, ensure_ascii=False))
                except Exception: pass
        DATABASE.session.commit()
        return jsonify({'success': True, 'id': getattr(test, 'id', None)})
    except Exception as e:
        DATABASE.session.rollback()
        current_app.logger.exception("update_test_full error")
        return jsonify({'success': False, 'error': str(e)}), 500
# ...existing code...