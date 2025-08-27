import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import flask


def send_code(email: str):
    user = "knowex933@gmail.com"
    password = "nwyo utbj fowl eyit"
    user_email = email

    N = 5  # количество последних кодов для проверки
    code_history = flask.session.get('code_history', [])
    # Генерировать уникальный код
    while True:
        code = str(random.randint(100000, 999999))
        if code not in code_history:
            break

    flask.session['confirm_code'] = code
    # Обновить историю кодов
    code_history.append(code)
    if len(code_history) > N:
        code_history = code_history[-N:]
    flask.session['code_history'] = code_history
    flask.session.modified = True

    message = MIMEMultipart()
    message["From"] = user
    message["To"] = user_email
    message["Subject"] = "Code for Kmowex"

    body = f"Hello, this is a code for Knowex! \n Code: {code}"
    message.attach(MIMEText(body, "plain"))

    conect = smtplib.SMTP("smtp.gmail.com", 587)
    conect.starttls()
    conect.login(user= user, password= password)

    conect.sendmail(
        from_addr= user,
        to_addrs= user_email,
        msg= message.as_string()
    )

    conect.close()