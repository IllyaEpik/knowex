import flask

test = flask.Blueprint(
    name = "test",
    import_name = "test_app",
    template_folder= "templates",
    static_folder= "static",
    static_url_path= "/test/"
)