import unicodedata
from flask import render_template, current_app
from flask.json import jsonify
from werkzeug.security import generate_password_hash
from .models import User
from . import db
import unicodedata
from string import ascii_letters, digits
from random import sample
from flask_mail import Mail, Message

SITE_URL = "http://127.0.0.1:5000"


def generate_username(firstname:str, name:str):
  ''' Return username like firstname.name '''
  firstname = firstname.replace(' ', '-') #Composed firstname
  name = name.replace(' ', '-') #Composed names

  #Remove accents :
  firstname = unicodedata.normalize('NFD', firstname.lower()).encode('ASCII', 'ignore').decode('utf-8')
  name = unicodedata.normalize('NFD', name.lower()).encode('ASCII', 'ignore').decode('utf-8')
  username = f'{firstname}.{name}'

  #Check if username already used, if yes: username = firstname.name{i}
  i = 1
  while True:
    if User.query.filter_by(username=username).first():
      i += 1
      if i > 2:
        username = username.replace(str(i-1), str(i))
      else:
        username = f'{username}{i}'
    else:
      break
  
  return username


def generate_password():
  ''' Return random password of 10 chars containing letters and numbers '''
  password = ''.join(sample(ascii_letters+digits, 10))
  return password


def generate_user(data, role: int, classroom, school):
  ''' Generate user and return user object '''
  name = data['name'].upper() # set name to uppercase
  firstname = data['firstname'].capitalize() # capitalize first letter of firstname
  email = data['email'].lower() # set email to lowercase
  
  # if a space is added by mistake at the end
  if name[-1] == " ":
    name = name[0:-1]
  if firstname[-1] == " ":
    firstname = firstname[0:-1]

  #generate username
  username = generate_username(firstname, name)

  #generate password
  password = generate_password()

  #create user object
  user = User(
    name=name,
    firstname=firstname,
    email=email,
    username=username,
    password=password,
    role=role,
    classroom=classroom,
    school=school
  )
  
  # sending mails
  send_mail(user)

  user.password = generate_password_hash(
    password,
    method='pbkdf2:sha256',
    salt_length=8
  )

  return user



def send_mail(user):
  ''' Send password email for students account '''
  mail = Mail(current_app)
  msg = Message("Vos identifiants", sender=(f"{user.school.name}", current_app.config['MAIL_USERNAME']), recipients=[user.email],
                  reply_to=user.email)
  if user.role == 1:
    msg.html = render_template('student_mail.html', user=user, site_url=SITE_URL)
  elif user.role == 10:
    msg.html = render_template('teacher_mail.html', user=user, site_url=SITE_URL)
  elif user.role == 100:
    msg.html = render_template("admin_mail.html", user=user, site_url=SITE_URL)
  mail.send(msg)