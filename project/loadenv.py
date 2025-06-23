import dotenv
import os

def load_env():
    commands = {
        "DB_INIT": "flask --app project db init",
        "DB_MIGRATE": "flask --app project db migrate",
        "DB_UPGRADE": "flask --app project db upgrade"
    }
    env_path = os.path.abspath(os.path.join(__file__, "..", "..", ".env"))
    if not os.path.exists(env_path):
        with open(env_path, "w") as env_file:
            for key, value in commands.items():
                env_file.write(f"{key} = {value}\n")
    dotenv.load_dotenv(env_path)
    if not os.path.exists(os.path.join(__file__, '..', '..', 'migrations')):
        os.system(os.environ['DB_INIT'])
    os.system(os.environ['DB_MIGRATE'])
    os.system(os.environ['DB_UPGRADE'])
    if not os.path.exists(os.path.join(__file__, '..', '..', 'test_app', 'static', 'images', 'test_icons')):
        os.makedirs(os.path.join(__file__, '..', '..', 'test_app', 'static', 'images', 'test_icons'))
