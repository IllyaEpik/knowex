from project.settings import DATABASE

class Questions(DATABASE.Model):
    __tablename__ = 'questions'

    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    text = DATABASE.Column(DATABASE.String(255))
    image = DATABASE.Column(DATABASE.String(255))
    answers = DATABASE.Column(DATABASE.String(255))
    correct_answer = DATABASE.Column(DATABASE.String(255))
    type = DATABASE.Column(DATABASE.String(255))

    def __repr__(self):
        return f"<Question {self.id}>"

class Test(DATABASE.Model):
    __tablename__ = 'tests'

    id = DATABASE.Column(DATABASE.Integer, primary_key=True)
    user = DATABASE.Column(DATABASE.Integer, DATABASE.ForeignKey('user.id'))
    questions = DATABASE.Column(DATABASE.String(255))
    subject = DATABASE.Column(DATABASE.String(255))
    class_name = DATABASE.Column(DATABASE.String(255))
    name = DATABASE.Column(DATABASE.String(255))
    description = DATABASE.Column(DATABASE.String(255))
    count = DATABASE.Column(DATABASE.Integer)
    date = DATABASE.Column(DATABASE.Integer)

    def __repr__(self):
        return f"<Test {self.id}: {self.name}>"
