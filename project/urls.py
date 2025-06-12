import main_app
import create_app
import report_app
import user_app
import test_app
from .settings import project

main_app.main.add_url_rule(rule="/", view_func=main_app.views.render_main, methods = ['get', 'post'])
main_app.main.add_url_rule(rule="/logout", view_func=main_app.views.logout)
create_app.create.add_url_rule(rule="/create", view_func=create_app.views.render_create, methods = ['get', 'post'])
report_app.report.add_url_rule(rule="/report", view_func=report_app.views.render_report, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/user", view_func=user_app.views.render_user, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/render_icon", view_func=user_app.views.render_icon, methods = ['post'])
user_app.user.add_url_rule(rule="/send_email_code", view_func=user_app.views.send_email_code, methods = ['post', 'get'])
user_app.user.add_url_rule(rule="/render_code", view_func=user_app.views.render_code, methods = ['get', 'post'])
test_app.test_page.add_url_rule(rule="/test", view_func=test_app.views.render_test)
test_app.test_page.add_url_rule(rule="/test_question", view_func=test_app.views.test_question, methods = ['get', 'post'])

# user_app.user.add_url_rule(rule="/profile", view_func=user_app.views.render_profile_page, methods = ['get', 'post'])

# flask_login.current_user.is_authenticated

project.register_blueprint(blueprint=main_app.app.main)
project.register_blueprint(blueprint=create_app.app.create)
project.register_blueprint(blueprint=report_app.app.report)
project.register_blueprint(blueprint=user_app.app.user)
project.register_blueprint(blueprint=test_app.app.test_page)
# project.register_blueprint(blueprint=user_app.app.profile)