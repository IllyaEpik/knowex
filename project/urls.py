import main_app
import create_app
import report_app
import user_app
from .settings import project

main_app.main.add_url_rule(rule="/", view_func=main_app.views.render_main)
create_app.create.add_url_rule(rule="/create", view_func=create_app.views.render_create)
report_app.report.add_url_rule(rule="/report", view_func=report_app.views.render_report)
user_app.user.add_url_rule(rule="/user", view_func=user_app.views.render_user, methods = ['get', 'post'])


project.register_blueprint(blueprint=main_app.app.main)
project.register_blueprint(blueprint=create_app.app.create)
project.register_blueprint(blueprint=report_app.app.report)
project.register_blueprint(blueprint=user_app.app.user)