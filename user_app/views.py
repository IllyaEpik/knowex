import flask, flask_login
from .models import User
from project.settings import DATABASE
from project.config_page import config_page
from .confirm_email import send_code
from os.path import abspath, join



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

#     if flask_login.current_user.is_authenticated:
#         return flask.redirect('/')

# def render_profile_page():
#     return flask.render_template("user.html", nickname=flask_login.current_user.nickname)            
     

# def render_profile_page():
#     password = flask_login.current_user.password
#     email = flask_login.current_user.email
#     # nickname = flask_login.current_user.nickname
#     return flask.render_template("profile.html", password=password, email=email)
# # =======
#                     flask.session['messages'].append(f'Помилка при додавані користувача: {error}')
#             else:
#                 flask.session['messages'].append('Паролі не співпадають')
#     print(flask.session['messages'])
#     return flask.render_template("user.html")                 
  


# def render_profile_page():
#     return flask.render_template("profile.html", password=password, email=email, nickname=nickname, profile_icon=profile_icon, is_authenticated=flask_login.current_user.is_authenticated)

    #                 return flask.redirect('/')
    #         except Exception as error:
    #             print(error)
    # return {}

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
