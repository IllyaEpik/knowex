import flask 
create = flask.Blueprint(
    name = "create",
    import_name = "create_app",
    template_folder= "templates",
    static_folder= "static",
    static_url_path= "/create/"
)