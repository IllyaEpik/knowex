from project.settings import DATABASE



class Questions(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    text = DATABASE.Column(DATABASE.String(255))
    image = DATABASE.Column(DATABASE.String(255))
    answers = DATABASE.Column(DATABASE.String(255))
    def __repr__(self):
        return self.text

class Test(DATABASE.Model):
    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    user = DATABASE.Column(DATABASE.Integer)
    questions = DATABASE.Column(DATABASE.String(255))
    subject = DATABASE.Column(DATABASE.String(255))
    name = DATABASE.Column(DATABASE.String(255))
    count = DATABASE.Column(DATABASE.Integer)
    def __repr__(self):
        return self.name