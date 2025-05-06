import project

if __name__ == "__main__":
    project.load_env()
    project.project.run(debug = True, port = 3000)