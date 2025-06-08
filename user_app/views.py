import flask, flask_login
from .models import User
from project.settings import DATABASE


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
                        return flask.redirect(flask.url_for('main.render_main'))
                    if user.password != flask.request.form['password']:
                        if 'Неправильний пароль' not in flask.session['messages']:
                            flask.session['messages'].append('Неправильний пароль')

        else:
            if flask.request.form['password'] == flask.request.form['confirm_password']:
                try:
                    user = User(
                        email = flask.request.form['email'],
                        password = flask.request.form['password'],
                        nickname = flask.request.form['nickname'],
                        # profile_icon = 'profile.png',
                        complete_tests = 0,
                        create_tests  = 0,
                        is_mentor = False
                    )
                    DATABASE.session.add(user)
                    DATABASE.session.commit()
                    flask.session['messages'].append('Користувач успішно доданий!')
    
                except Exception as error:
                    print(error)
# <<<<<<< HEAD
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
#     if flask_login.current_user.is_authenticated:
#         nickname = flask_login.current_user.nickname
#         password = flask_login.current_user.password
#         email = flask_login.current_user.email
#         profile_icon = flask_login.current_user.profile_icon
#     else:
#         nickname = ''
#         password = ''
#         email = ''
#         profile_icon = 'profile.png'
#     return flask.render_template("profile.html", password=password, email=email, nickname=nickname, profile_icon=profile_icon, is_authenticated=flask_login.current_user.is_authenticated)

# >>>>>>> origin/Max
