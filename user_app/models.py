from project.settings import DATABASE


class User(DATABASE.Model):
    id= DATABASE.Column(DATABASE.Integer, primary_key=True)
    email = DATABASE.Column(DATABASE.String(255))
    nickname = DATABASE.Column(DATABASE.String(255))
    password = DATABASE.Column(DATABASE.String(255))
    # profile_icon = DATABASE.Column(DATABASE.String(255))
    is_mentor = DATABASE.Column(DATABASE.Boolean)
    create_test = DATABASE.Column(DATABASE.Text)
    complete_tests = DATABASE.Column(DATABASE.Text)
    theme = DATABASE.Column(DATABASE.Boolean)
    def __repr__(self):
        return self.nickname