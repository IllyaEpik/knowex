from flask_login import current_user
import flask
import os

def config_page(template_name: str):
    def render_template(function: object):
        def set_context(*args, **kwargs):
            context = function(*args, **kwargs)
            if current_user.is_authenticated:
                path_icon = os.path.abspath(os.path.join(__file__, '..', 'static', 'images', 'user_icons', f"{current_user.nickname}.png"))
            if not isinstance(context, dict):
                return context
            return flask.render_template(
                template_name_or_list= template_name, 
                nickname = current_user.nickname if current_user.is_authenticated else False, 
                email = current_user.email if current_user.is_authenticated else False, 
                password = current_user.password if current_user.is_authenticated else False, 
                profile_name = f"{current_user.nickname}.png" if current_user.is_authenticated and os.path.exists(path_icon) else 'profile.png',
                is_authenticated = current_user.is_authenticated if current_user.is_authenticated else False,
                **context
            )
        return set_context
    return render_template