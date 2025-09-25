import main_app
import create_app
import report_app
import user_app
import test_app

# <-- добавляем импорт profile_api (подправь путь, если файл лежит в другом модуле) -->
import user_app as profile_api

from .settings import project
from .settings import project
from create_app.app import create as create_bp
from test_app.views import save_result

create_bp.add_url_rule(
    "/save_result",
    view_func=save_result,
    methods=["POST"]
)



# test_app.test_page.add_url_rule(rule="/test/<int:test_id>/user/<int:question_id>", view_func=test_app.views.render_test_user_question, methods=['get', 'post'], endpoint="render_test_user_question")
main_app.main.add_url_rule(rule="/", view_func=main_app.views.render_main, methods = ['get', 'post'])
main_app.main.add_url_rule(rule="/logout", view_func=main_app.views.logout)
create_app.create.add_url_rule(rule="/create", view_func=create_app.views.render_create, methods = ['get', 'post'])
report_app.report.add_url_rule(rule="/report/<int:user_id>", view_func=report_app.views.render_report, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/user", view_func=user_app.views.render_user, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/render_icon", view_func=user_app.views.render_icon, methods = ['post'])
user_app.user.add_url_rule(rule="/send_email_code", view_func=user_app.views.send_email_code, methods = ['post', 'get'])
user_app.user.add_url_rule(rule="/render_code", view_func=user_app.views.render_code, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/profile/<int:user_id>", view_func=user_app.views.render_profile_page, methods = ['get', 'post'])
test_app.test_page.add_url_rule(rule='/test/<int:test_id>', view_func=test_app.views.render_test, methods = ['get', 'post'], endpoint='render_test')
test_app.test_page.add_url_rule(rule="/create_test", view_func=create_app.views.create_test, methods = ['post'])
test_app.test_page.add_url_rule(rule="/test/<int:test_id>/question/<int:question_id>", view_func=test_app.views.test_question, methods = ['get', 'post'], endpoint="test_question")
test_app.test_page.add_url_rule(rule="/test/<int:test_id>/host", view_func=test_app.views.render_test_host, methods=['get', 'post'], endpoint="render_test_host")
test_app.test_page.add_url_rule(rule="/test/<int:test_id>/user", view_func=test_app.views.render_test_user, methods=['get', 'post'], endpoint="render_test_user")
test_app.test_page.add_url_rule(rule='/test/<int:test_id>', view_func=test_app.views.render_test, methods = ['get', 'post'], endpoint='render_test')
test_app.test_page.add_url_rule(rule="/test/<int:test_id>/result", view_func=test_app.views.test_result, methods=['get'], endpoint="test_result")
report_app.report.add_url_rule(rule="/report/<int:user_id>", view_func=report_app.views.render_report, methods = ['get', 'post'])
report_app.report.add_url_rule(rule="/find_test", view_func=report_app.views.find_test, methods=['post', 'get'])
user_app.user.add_url_rule(rule="/send_email_code", view_func=user_app.views.send_email_code, methods = ['post', 'get'])
user_app.user.add_url_rule(rule="/profile", view_func=user_app.views.render_profile_page, methods = ['get', 'post'])
create_app.create.add_url_rule(rule="/create", view_func=create_app.views.render_create, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/render_code", view_func=user_app.views.render_code, methods = ['get', 'post'])
test_app.test_page.add_url_rule(rule="/create_test", view_func=create_app.views.create_test, methods = ['post'])
user_app.user.add_url_rule(rule="/user", view_func=user_app.views.render_user, methods = ['get', 'post'])
user_app.user.add_url_rule(rule="/render_icon", view_func=user_app.views.render_icon, methods = ['post'])
main_app.main.add_url_rule(rule="/", view_func=main_app.views.render_main, methods = ['get', 'post'])
main_app.main.add_url_rule(rule="/logout", view_func=main_app.views.logout)


project.register_blueprint(blueprint=main_app.app.main)
project.register_blueprint(blueprint=create_app.app.create)
project.register_blueprint(blueprint=report_app.app.report)
project.register_blueprint(blueprint=user_app.app.user)
project.register_blueprint(blueprint=user_app.app.profile)
project.register_blueprint(blueprint=test_app.app.test_page)

# <-- регистрация profile_api блюпринта -->
project.register_blueprint(blueprint=profile_api.profile_api)
