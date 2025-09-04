from project.settings import DATABASE
import flask_login
import json
from datetime import datetime


class User(DATABASE.Model, flask_login.UserMixin):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    nickname = DATABASE.Column(DATABASE.String(255), unique=True)
    email = DATABASE.Column(DATABASE.String(255), unique=True)
    password = DATABASE.Column(DATABASE.String(255))
    is_mentor = DATABASE.Column(DATABASE.Boolean)
    create_tests = DATABASE.Column(DATABASE.Text)
    complete_tests = DATABASE.Column(DATABASE.Text, default="[]")  

    def __repr__(self):
        return self.nickname

    def get_complete_tests(self):
        try:
            return json.loads(self.complete_tests)
        except Exception:
            return []

 
    def add_test_result(self, test_id, total, correct, answers=None):
        results = self.get_complete_tests()
        incorrect = total - correct
        entry = {
            "test_id": int(test_id),
            "total": int(total),
            "correct": int(correct),
            "incorrect": int(incorrect),
            "date": datetime.utcnow().isoformat()
        }
        if answers is not None:
            entry["answers"] = answers
        results.append(entry)
        self.complete_tests = json.dumps(results)
        DATABASE.session.commit()