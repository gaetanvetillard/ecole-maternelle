from flask import *
from flask import current_app as app
from flask_login import current_user, logout_user, login_user

from .models import *
from .decorated_functions import *
from .generate_user_functions import generate_user, generate_username

ERRORS = {
  "INVALID_ARGS": {"Error": "Invalid Arguments"},
  "INVALID_PASSWORD": {"Error": "Invalid Password"},
  "INVALID_USERNAME": {"Error": "User Not Found"},
  "TRY_AGAIN": {"Error": "Try Again."},
  'TEACHER_NOT_FOUND': {"Error": "Teacher Not Found"},
  'ALREADY_IN_A_CLASSROOM': {"Error": "Teacher Is Already In A Classroom"}
}

SUCCESS = {
  "LOGIN": {"Success": "Successfully connected"},
  "LOGOUT": {"Sucess": "Successfully logged out"},
  "EDIT": {"Success": "Successfully edited"}
}



@app.route('/api/login', methods=['POST'])
def login():
  data = request.get_json()
  try:
    username = data['username']
    password = data['password']
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400
  user = User.query.filter_by(username=username).first()
  if not user:
    return jsonify(ERRORS["INVALID_USERNAME"]), 404
  if password == user.password:
    login_user(user)
    return jsonify(SUCCESS['LOGIN']), 200
  else:
    return jsonify(ERRORS["INVALID_PASSWORD"]), 403


@app.route('/api/logout')
def logout():
  if current_user.is_authenticated:
    logout_user()
    return jsonify(SUCCESS['LOGOUT']), 200
  return jsonify(ERRORS['INVALID_ARGS']), 400


@app.route('/api/is_login')
def is_login():
  if current_user.is_authenticated:
    return jsonify({
      "is_login": True,
      "username": current_user.username,
      "role": current_user.role,
    })
  else:
    return jsonify({
      "is_login": False,
      "username": None,
      "role": None,
    })




# School admin routes
@app.route('/api/admin/get_school_infos')
@admin
def get_school_infos():
  school = current_user.school
  if school:
    res = {
      "name": school.name,
      "address": school.address,
      "zipcode": school.zipcode,
      "city": school.city,
      "classrooms_count": len(school.classrooms),
      "students_count": len([student for student in school.users if student.role == ROLES['student']])
    }
    return jsonify(res), 200
  return jsonify(ERRORS['TRY_AGAIN']), 400


@app.route('/api/admin/edit_school_infos', methods=["POST"])
@admin
def edit_school_infos():
  data = request.get_json()
  try:
    to_edit = data["to_edit"]
    new_value = data['new_value']
  except:
    return jsonify(ERRORS['INVALID_ARGS'])
  
  if to_edit == "name":
    current_user.school.name = new_value
    db.session.commit()
  elif to_edit == "address":
    current_user.school.address = new_value
    db.session.commit()
  elif to_edit == "zipcode":
    current_user.school.zipcode = new_value
    db.session.commit()
  elif to_edit == "city":
    current_user.school.city = new_value
    db.session.commit()
  
  else:
    return jsonify(ERRORS['INVALID_ARGS'])
  return jsonify(SUCCESS['EDIT'])


@app.route('/api/admin/get_classrooms_list')
@admin
def get_classrooms_list():
  classrooms = current_user.school.classrooms
  try:
    classrooms_list = [
      {
        "id": classroom.id,
        "teacher": {
          "username": classroom.teacher_username,
          "name": User.query.filter_by(username=classroom.teacher_username).first().name,
          "firstname": User.query.filter_by(username=classroom.teacher_username).first().firstname
        },
        "students_count": len([student for student in classroom.users if student.role == ROLES['student']]),
      }
      for classroom in classrooms
    ]
    free_teachers = [
      {
        "id": teacher.id,
        "name": teacher.name,
        "firstname": teacher.firstname,
        "username": teacher.username
      }
      for teacher in current_user.school.users if teacher.role == ROLES['teacher'] and teacher.classroom == None
    ]
    return jsonify({"classrooms": classrooms_list, "free_teachers": free_teachers})
  except:
    return jsonify(ERRORS['INVALID_ARGS'])


@app.route('/api/admin/get_classroom_info/<string:classroom_id>')
@admin
def get_classroom_info(classroom_id):
  res = {}
  try:
    classroom = Classroom.query.filter_by(id=classroom_id).first()
    if not current_user.school.id == classroom.school.id:
      res['is_allowed'] = False
      return jsonify(res), 200
    else:
      res['is_allowed'] = True

  except:
    res['is_allowed'] = False
    return jsonify(res), 200

  try:
    classroom_infos = {
      "id": classroom.id,
      "students": [
        {
          "id": student.id,
          "name": student.name,
          "firstname": student.firstname,
          "username": student.username
        } for student in classroom.users if student.role == ROLES['student']
      ],
      "teachers": [
        {
          "id": teacher.id,
          "name": teacher.name,
          "firstname": teacher.firstname,
          "username": teacher.username
        } for teacher in classroom.users if teacher.role == ROLES['teacher']
      ],
      "free_teachers": [
        {
          "id": teacher.id,
          "name": teacher.name,
          "firstname": teacher.firstname,
          "username": teacher.username
        } for teacher in classroom.school.users if teacher.role == ROLES['teacher'] and not teacher.classroom
      ],
      "free_students": [
        {
          "id": student.id,
          "name": student.name,
          "firstname": student.firstname,
          "username": student.username
        } for student in classroom.school.users if student.role == ROLES['student'] and not student.classroom
      ]
    }
  except:
    return jsonify(ERRORS['TRY_AGAIN']), 400

  res.update(classroom_infos)
  return jsonify(res), 200



@app.route('/api/admin/add_classroom', methods=['POST'])
@admin
def add_classroom():
  data = request.get_json()
  try:
    if data['action'] == "new_account":
      # Create classroom
      classroom = Classroom(
        school=current_user.school,
        teacher_username=generate_username(data['firstname'], data['name'])
      )
      db.session.add(classroom)
      # Create new teacher account
      teacher = generate_user(data, ROLES['teacher'], classroom, current_user.school)
      db.session.add(teacher)

    elif data['action'] == "existing_account":
      teacher = User.query.filter_by(username=data['username']).first()
      if teacher.classroom:
        return jsonify(ERRORS['ALREADY_IN_A_CLASSROOM']), 400

      if teacher and teacher.school == current_user.school:
        #create classroom
        classroom = Classroom(
          school=current_user.school,
          teacher_username=teacher.username
        )
        db.session.add(classroom)

        teacher.classroom = classroom

      else:
        return jsonify(ERRORS['TEACHER_NOT_FOUND']), 404
    
    else:
      return jsonify(ERRORS['INVALID_ARGS']), 400

    db.session.commit()
    return jsonify({
      'id': classroom.id,
      'students_count': 0,
      'teacher': {
        'firstname': teacher.firstname,
        'name': teacher.name,
        'username': teacher.username
      }
    }), 200
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400


@app.route('/api/admin/transfer_classroom', methods=['POST'])
@admin
def transfer_classroom():
  data = request.get_json()
  try:
    with db.session.no_autoflush:
      if data['action'] == "new_account":
        # Get classroom
        classroom = Classroom.query.filter_by(id=data['classroom_id']).first()
        # Create new teacher account
        teacher = generate_user(data, ROLES['teacher'], classroom, current_user.school)
        # Old teacher :
        old_teacher = User.query.filter_by(classroom=classroom, role=ROLES['teacher']).first()
        classroom.users.remove(old_teacher)

        classroom.teacher_username = teacher.username
        db.session.add(teacher)

      elif data['action'] == "existing_account":
        teacher = User.query.filter_by(username=data['username']).first()
        if teacher.classroom:
          return jsonify(ERRORS['ALREADY_IN_A_CLASSROOM']), 400

        if teacher and teacher.school == current_user.school:
          # Get classroom
          classroom = Classroom.query.filter_by(id=data['classroom_id']).first()
          # Old teacher :
          old_teacher = User.query.filter_by(classroom=classroom, role=ROLES['teacher']).first()
          classroom.users.remove(old_teacher)

          classroom.teacher_username = teacher.username
          teacher.classroom = classroom

        else:
          return jsonify(ERRORS['TEACHER_NOT_FOUND']), 404
      
      else:
        return jsonify(ERRORS['INVALID_ARGS']), 400


      db.session.commit()
      return jsonify({
        'id': teacher.id,
        'firstname': teacher.firstname,
        'name': teacher.name,
        'username': teacher.username
      }), 200
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400


@app.route('/api/admin/add_student', methods=['POST'])
@admin
def admin_add_student():
  data = request.get_json()
  try:
    if data['action'] == "new_account":
      # Get classroom
      classroom = Classroom.query.filter_by(id=data['classroom_id']).first()
      # Create new student account
      student = generate_user(data, ROLES['student'], classroom, current_user.school)
      db.session.add(student)

    elif data['action'] == "existing_account":
      student = User.query.filter_by(username=data['username']).first()
      if student.classroom:
        return jsonify(ERRORS['ALREADY_IN_A_CLASSROOM']), 400

      if student and student.school == current_user.school:
        classroom = Classroom.query.filter_by(id=data['classroom_id']).first()
        student.classroom = classroom
      else:
        return jsonify(ERRORS['TEACHER_NOT_FOUND']), 404
    
    else:
      return jsonify(ERRORS['INVALID_ARGS']), 400

    db.session.commit()
    return jsonify({
      'id': student.id,
      'firstname': student.firstname,
      'name': student.name,
      'username': student.username
    }), 200
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400