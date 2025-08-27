import flask 

main = flask.Blueprint(
    name = "main",
    import_name = "main_app",
    template_folder= "templates",
    static_folder= "static",
    static_url_path= "/main/"
)