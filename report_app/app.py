import flask 

report = flask.Blueprint(
    name = "report",
    import_name = "report_app",
    template_folder= "templates",
    static_folder= "static",
    static_url_path= "/report/"
)