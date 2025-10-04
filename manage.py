import project
from project.settings import socketio

if __name__ == "__main__":
    project.load_env()
    # project.project.run(debug = True, port = 3000)
    socketio.run(project.project, debug=True, port = 5000)