from project.settings import DATABASE

class TestCode(DATABASE.Model):
    test_id = DATABASE.Column(DATABASE.Integer)
    session_id = DATABASE.Column(DATABASE.String(100), primary_key=True)

