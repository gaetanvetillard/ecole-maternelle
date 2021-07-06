from flask import *
from flask import current_app as app
from flask_login import current_user, logout_user, login_user

from .models import *
from .decorated_functions import *
from .generate_user_functions import generate_user, generate_username

ERRORS = {
  "INVALID_ARGS": {"Error": "Invalid Arguments"},
  "INVALID_PASSWORD": {"Error": "Invalid Password"},
  "INVALID_USERNAME": {"Error": "Invalid Username"},
  "TRY_AGAIN": {"Error": "Try Again."},
  'TEACHER_NOT_FOUND': {"Error": "Teacher Not Found"},
  'ALREADY_IN_A_CLASSROOM': {"Error": "Teacher Is Already In A Classroom"},
  "USER_NOT_IN_A_SCHOOL": {"Error": "User Isn't In A School"},
  "USER_NOT_FOUND": {'Error': "User Not Found"}
}

SUCCESS = {
  "LOGIN": {"Success": "Successfully connected"},
  "LOGOUT": {"Sucess": "Successfully logged out"},
  "EDIT": {"Success": "Successfully edited"},
  "DELETE": {"Success": "Successfully deleted"}
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




# Super Admin routes
@app.route('/api/super_admin/get_skills')
# @super_admin
def super_admin_get_skills():
  all_skills = Skill.query.filter_by(scope=100).all()
  res = [
    {
      "id": skill.id,
      "name": skill.name,
      "subskill": [
        {
          "id": subskill.id,
          "name": subskill.name,
          "items": [
            {
              "id": item.id,
              "label": item.label,
              "type": "simple" if item.image_url else "complex",
              "image_url": item.image_url if item.image_url else None,
              "subitems": [
                {
                  "id": subitem.id,
                  "content": subitem.content
                } for subitem in item.subitems
              ] if item.subitems else None
            } for item in subskill.items if item.scope == 100
          ]
        } for subskill in skill.subskills if subskill.scope == 100
      ]
    } for skill in all_skills
  ]

  return jsonify(res), 200






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
      "users_count": len(school.users)
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


@app.route('/api/admin/get_classroom_info/<int:classroom_id>')
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


@app.route('/api/admin/delete_classroom', methods=["POST"])
@admin
def delete_classroom():
  data = request.get_json()
  if len(data) != 1:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  try:
    classroom = Classroom.query.filter_by(id=data["classroom_id"], school=current_user.school).first()
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400
  
  if not classroom:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  db.session.delete(classroom)
  db.session.commit()
  return jsonify(SUCCESS["DELETE"]), 200


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

  
@app.route('/api/admin/get_users_list')
@admin
def get_users_list():
  users = current_user.school.users
  if users:
    try:
      res = {
        "students": [{
          "id": student.id,
          "username": student.username,
          "name": student.name,
          "firstname": student.firstname,
          } for student in users if student.role == ROLES['student']],
        "teachers": [{
          "id": teacher.id,
          "username": teacher.username,
          "name": teacher.name,
          "firstname": teacher.firstname,
        } for teacher in users if teacher.role == ROLES['teacher']],
        "admin": {
          "id": current_user.id,
          "name": current_user.name,
          "firstname": current_user.firstname,
          "username": current_user.username
        }
      }
      return jsonify(res), 200

    except:
      return jsonify(ERRORS['TRY_AGAIN']), 400
  
  else:
    return jsonify(ERRORS['USER_NOT_IN_A_SCHOOL']), 400


@app.route('/api/admin/get_user_info/<int:user_id>')
@admin
def get_user_infos(user_id):
  user = User.query.filter_by(id=user_id).first()
  
  if user.school != current_user.school:
    return jsonify(ERRORS['INVALID_ARGS']), 400
  
  res = {
    "id": user.id,
    "name": user.name,
    "firstname": user.firstname,
    "username": user.username,
    "email": user.email,
    "role": user.role,
  }
  
  if user.classroom and user.role == ROLES['student']:
    teacher = User.query.filter_by(role=ROLES['teacher'], classroom=user.classroom).first()
    if not teacher:
      return jsonify(ERRORS['TRY_AGAIN']), 400
    res["classroom"] = {
      "id": user.classroom.id,
      "teacher": {
        "id": teacher.id,
        "name": teacher.name,
        "username": teacher.username,
        "firstname": teacher.firstname
      }
    }
  
  if user.role == ROLES['student']:
    res['other_classrooms'] = [
      {
        "id": classroom.id,
        "teacher": [
          {
            "id": teacher.id,
            "name": teacher.name,
            "firstname": teacher.firstname,
            "username": teacher.username
          } for teacher in classroom.users if teacher.role == ROLES["teacher"]
        ][0] 
      } for classroom in current_user.school.classrooms if classroom != user.classroom
    ]
  
  elif user.classroom and user.role == ROLES['teacher']:
    res['classroom'] = {
      "id": user.classroom.id,
    }

  return jsonify(res), 200


@app.route('/api/admin/edit_user_info', methods=['POST'])
@admin
def edit_user_info():
  data = request.get_json()
  if len(data) != 3:
    return jsonify(ERRORS['INVALID_ARGS']), 400
  
  try:
    to_edit = data['to_edit']
    new_value = data['new_value']
    user_id = data['user_id']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  user = User.query.filter_by(school=current_user.school, id=user_id).first()
  if not user:
    return jsonify(ERRORS["USER_NOT_FOUND"]), 404
  
  if to_edit == "name":
    user.name = new_value.upper()
  elif to_edit == "firstname":
    user.firstname = new_value.capitalize()
  elif to_edit == "email":
    user.email = new_value.lowercase()
  else:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  db.session.commit()
  return jsonify(SUCCESS["EDIT"]), 200


@app.route('/api/admin/transfer_student', methods=['POST'])
@admin
def transfer_student():
  data = request.get_json()
  if len(data) != 2:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  try:
    user = User.query.filter_by(id=data['user_id'], school=current_user.school).first()
    new_classroom = Classroom.query.filter_by(id=data['classroom_id'], school=current_user.school).first()
    
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400

  user.classroom = new_classroom
  db.session.commit()
  # return new classroom values
  new_teacher = User.query.filter_by(classroom=new_classroom, role=ROLES['teacher']).first()
  res = {
    "id": new_classroom.id,
    "teacher": {
      "id": new_teacher.id,
      "name": new_teacher.name,
      "firstname": new_teacher.firstname,
      "username": new_teacher.username
    }
  }
  
  return jsonify(res), 200


@app.route('/api/admin/remove_student', methods=["POST"])
@admin
def remove_student():
  data = request.get_json()
  if len(data) != 1:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  try:
    user = User.query.filter_by(school=current_user.school, id=data['user_id']).first()
  except:
    return jsonify(ERRORS["USER_NOT_FOUND"])
  
  user.classroom = None
  db.session.commit()
  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/admin/delete_user', methods=['POST'])
@admin
def admin_delete_user():
  data = request.get_json()
  if len(data) != 1:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  try:
    user_id = data['user_id']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  user = User.query.filter_by(id=user_id, school=current_user.school).first()
  if not user:
    return jsonify(ERRORS["USER_NOT_FOUND"]), 404
  
  if user.role == 10:
    db.session.delete(user.classroom)
  
  db.session.delete(user)
  db.session.commit()
  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/admin/get_skills')
@admin
def admin_get_skills():
  pass