import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

code = random.randint(100000, 999999)

def send_code(email: str):
    user = "knowex933@gmail.com"
    password = "nwyo utbj fowl eyit"
    user_email = email

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