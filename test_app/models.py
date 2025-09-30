from project.settings import DATABASE
from datetime import datetime


class TestCode(DATABASE.Model):
    test_id = DATABASE.Column(DATABASE.Integer)
    session_id = DATABASE.Column(DATABASE.String(100), primary_key=True)
    created_at = DATABASE.Column(DATABASE.DateTime, default=datetime.utcnow)

