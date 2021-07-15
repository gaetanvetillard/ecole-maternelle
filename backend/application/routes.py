from re import A
from flask import *
from flask import current_app as app
from flask_login import current_user, logout_user, login_user
from werkzeug.utils import secure_filename

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
  "USER_NOT_FOUND": {'Error': "User Not Found"},
  "USER_NOT_IN_A_CLASSROOM": {"Error": "User Isn't In A Classroom"},
  "UNAUTHORIZED": {"Error": "You're not allowed to access to this content"}, 
}

SUCCESS = {
  "LOGIN": {"Success": "Successfully connected"},
  "LOGOUT": {"Sucess": "Successfully logged out"},
  "EDIT": {"Success": "Successfully edited"},
  "DELETE": {"Success": "Successfully deleted"},
  "ADD": {"Success": "Successfully added"}
}



def get_validated_skills(student, school):
  all_skills = [skill_connection.skill for skill_connection in school.skills]
  all_subskills = [subskill_connection.subskill for subskill_connection in school.subskills]
  all_items = [item_connection.item for item_connection in school.items]

  res = []
  total_items_count = 0
  total_validated_items_count = 0


  for skill in all_skills:
    subskills = []
    validated_items_count = 0
    items_count = 0
    for subskill in skill.subskills:
      if subskill in all_subskills:
        items = []
        for item in subskill.items:
          if item in all_items:
            items_count += 1
            total_items_count += 1
            # Check if item validated
            validation = Validation.query.filter_by(user=student, item=item).first()
            if validation and validation.status >= 0 and validation.validated_subitems:
              validated_subitems = [int(a) for a in validation.validated_subitems[1:-1].split(',')]

            if validation and validation.status == 1:
              validated_items_count += 1
              total_validated_items_count += 1

            item_object = {
              "id": item.id,
              "label": item.label,
              "type": "simple" if item.image_url else "complex",
              "image_url": item.image_url if item.image_url else None,
              "validation": {
                "status": validation.status,
                "date": validation.date if validation.date else None,
              } if validation else None,
              "subitems": [
                {
                  "id": subitem.id,
                  "content": subitem.content,
                  "validation": True if (validation and subitem.id in validated_subitems) else False
                } for subitem in item.subitems
              ] if item.subitems else None
            }

            items.append(item_object)
        
        subskill_object = {
          "id": subskill.id,
          "name": subskill.name,
          "items": items
        }
        
        subskills.append(subskill_object)

    skill_object = {
      "id": skill.id,
      "name": skill.name,
      "validated_items_count": validated_items_count,
      "items_count": items_count,
      "subskills": subskills
    }
    res.append(skill_object)


  return res, total_items_count, total_validated_items_count







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
    return jsonify({
      "username": user.username,
      "role": user.role}), 200
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
@app.route('/api/super_admin/get_infos')
@super_admin
def super_admin_get_infos():
  users_count = len(User.query.all())
  schools_count = len(School.query.all())
  res = {
    "users_count": users_count,
    "schools_count": schools_count
  }
  return jsonify(res), 200


@app.route('/api/super_admin/get_schools/<int:page>')
@super_admin
def super_admin_get_schools(page):
  all_schools = School.query.all()
  try:
    zipcode = request.args['zipcode']
    all_schools = [school for school in all_schools if f"{school.zipcode}".startswith(zipcode)]
  except:
    pass

  items_per_page = 25
  pages_count = int(round(len(all_schools) / items_per_page + .499, 0))
  start = int(page * items_per_page - items_per_page)
  end = int(page * items_per_page)


  res = {
    "pages_count": pages_count,
    "schools": [
      {
        "id": school.id,
        "name": school.name,
        "zipcode": school.zipcode,
        "city": school.city,
        "address": school.address,
        "users_count": len(school.users)
      } for school in all_schools[start:end]
    ]
  }

  return jsonify(res), 200


@app.route('/api/super_admin/get_users/<int:page>')
@super_admin
def super_admin_get_users(page):
  all_users = User.query.all()
  items_per_page = 25
  pages_count = int(round(len(all_users) / items_per_page + .499, 0))
  start = int(page * items_per_page - items_per_page)
  end = int(page * items_per_page)

  res = {
    "pages_count": pages_count,
    "users": [
      {
        "id": user.id,
        "name": user.name,
        "firstname": user.firstname,
        "username": user.username,
      } for user in all_users[start:end]
    ]
  }

  return jsonify(res), 200


@app.route('/api/super_admin/get_skills')
@super_admin
def super_admin_get_skills():
  all_skills = Skill.query.filter_by(scope=100).all()
  res = [
    {
      "id": skill.id,
      "name": skill.name,
      "subskills": [
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
                  "content": subitem.content,
                } for subitem in item.subitems
              ] if item.subitems else None
            } for item in subskill.items if item.scope == 100
          ]
        } for subskill in skill.subskills if subskill.scope == 100
      ]
    } for skill in all_skills
  ]

  return jsonify(res), 200


@app.route('/api/super_admin/add_school', methods=['POST'])
@super_admin
def super_admin_add_school():
  data = request.get_json()
  try:
    school_data = {
      "name": data["school"]["name"],
      "address": data["school"]["address"],
      "zipcode": data["school"]["zipcode"],
      "city": data["school"]["city"],
    }
    admin_data = {
      "name": data["admin"]["name"],
      "firstname": data["admin"]["firstname"],
      "email": data["admin"]["email"],
    }
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400
  
  with db.session.no_autoflush:
    # Create school
    new_school = School(
      name=school_data["name"],
      address=school_data["address"],
      zipcode=school_data["zipcode"],
      city=school_data["city"]
    )
    db.session.add(new_school)

    # Add default Skills, Subskills, Items to new school
    default_skills = Skill.query.filter_by(scope=100).all()
    for skill in default_skills:
      a = SkillConnection(skill=skill)
      new_school.skills.append(a)
    default_subskills = Subskill.query.filter_by(scope=100).all()
    for subskill in default_subskills:
      a = SubskillConnection(subskill=subskill)
      new_school.subskills.append(a)
    default_items = Item.query.filter_by(scope=100).all()
    for item in default_items:
      a = ItemConnection(item=item)
      new_school.items.append(a)
    
    # Create admin account
    admin = generate_user(admin_data, ROLES['admin'], None, new_school)
    db.session.add(admin)

    db.session.commit()
  
  return jsonify({
    "id": new_school.id,
    "name": new_school.name,
    "address": new_school.address,
    "zipcode": new_school.zipcode,
    "city": new_school.city
  }), 200


@app.route('/api/super_admin/delete_school', methods=['POST'])
@super_admin
def super_admin_delete_school():
  data = request.get_json()
  try:
    school_to_delete = School.query.filter_by(id=data['id']).first()
    if not school_to_delete:
      return jsonify(ERRORS["INVALID_ARGS"]), 400
  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400
  
  with db.session.no_autoflush:
    for user in school_to_delete.users:
      db.session.delete(user)
    
    for classroom in school_to_delete.classrooms:
      db.session.delete(classroom)

    for skill_c in SkillConnection.query.filter_by(school=school_to_delete).all():
      db.session.delete(skill_c)
    
    for subskill_c in SubskillConnection.query.filter_by(school=school_to_delete).all():
      db.session.delete(subskill_c)
    
    for item_c in ItemConnection.query.filter_by(school=school_to_delete).all():
      db.session.delete(item_c)

    db.session.delete(school_to_delete)
    db.session.commit()

    return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/super_admin/add_skill', methods=['POST'])
@super_admin
def super_admin_add_skill():
  data = request.get_json()
  try:
    name = data['name']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_skill = Skill(name=name, scope=100)
  db.session.add(new_skill)
  db.session.commit()

  res = {
    "id": new_skill.id,
    "name": new_skill.name,
    "subskills": []
    }

  return jsonify(res), 200


@app.route('/api/super_admin/add_subskill', methods=['POST'])
@super_admin
def super_admin_add_subskill():
  data = request.get_json()
  try:
    skill = Skill.query.filter_by(id=data['skill_id'], scope=100).first()
    name = data["name"]
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_subskill = Subskill(
    skill=skill,
    name=name,
    scope=100
  )
  db.session.add(new_subskill)
  db.session.commit()

  res = {
    "id": new_subskill.id,
    "name": new_subskill.name,
    "items": []
  }

  return jsonify(res), 200


@app.route('/api/super_admin/add_simple_item', methods=["POST"])
@super_admin
def super_admin_add_simple_item():
  data = request.args
  if len(data) != 2:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  try:
    image = request.files["image"]
    subskill = Subskill.query.filter_by(id=data['subskill_id'], scope=100).first()
    name = data['name']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_image = ItemImage(
    image=image.read(),
    mimetype=image.mimetype,
    filename=secure_filename(image.filename)
  )
  db.session.add(new_image)
  db.session.commit()

  new_item = Item(
    label=name,
    subskill=subskill,
    scope=100,
    image_url=f"/image/{new_image.id}"
  )
  db.session.add(new_item)
  db.session.commit()

  res = {
    "id": new_item.id,
    "label": new_item.label,
    "type": "simple",
    "image_url": new_item.image_url,
    "subitems": []
  }

  return jsonify(res), 200


@app.route('/api/super_admin/add_complex_item', methods=['POST'])
@super_admin
def super_admin_add_complex_item():
  data = request.get_json()

  try:
    subskill = Subskill.query.filter_by(id=data['subskill_id'], scope=100).first()
    name = data['name']
    subitems = data['subitems']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_item = Item(
    label=name,
    subskill=subskill,
    scope=100,
  )
  db.session.add(new_item)

  subitems_list = []

  for subitem in subitems:
    new_subitem = Subitem(
      item=new_item,
      content=subitem,
    )
    
    subitems_list.append({
      "id": new_subitem.id,
      "content": new_subitem.content,
    })

    db.session.add(new_subitem)
  
  db.session.commit()

  res = {
    "id": new_item.id,
    "label": new_item.label,
    "type": "complex",
    "image_url": None,
    "subitems": subitems_list
  }

  return jsonify(res), 200


@app.route('/api/super_admin/delete_item', methods=['POST'])
@super_admin
def super_admin_delete_item():
  data = request.get_json()

  try:
    item = Item.query.filter_by(id=data['id']).first()
    image = ItemImage.query.filter_by(id=item.image_url.split('/')[-1]).first()
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  db.session.delete(item)
  db.session.delete(image)
  db.session.commit()
  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/super_admin/delete_skill', methods=['POST'])
@super_admin
def super_admin_delete_skill():
  try:
    id = request.args['id']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  skill = Skill.query.filter_by(scope=100, id=id).first()

  for subskill in skill.subskills:
    for item in subskill.items:
      db.session.delete(item)
    db.session.delete(subskill)
  db.session.delete(skill)
  db.session.commit()

  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/super_admin/delete_subskill', methods=['POST'])
@super_admin
def super_admin_delete_subskill():
  try:
    id = request.args['id']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  subskill = Subskill.query.filter_by(scope=100, id=id).first()

  for item in subskill.items:
    db.session.delete(item)
  db.session.delete(subskill)
  db.session.commit()

  return jsonify(SUCCESS["DELETE"]), 200






# School admin routes
@app.route('/api/admin/get_school_infos')
@admin
def admin_get_school_infos():
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
def admin_edit_school_infos():
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
def admin_get_classrooms_list():
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
def admin_get_classroom_info(classroom_id):
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
def admin_add_classroom():
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
def admin_transfer_classroom():
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
def admin_delete_classroom():
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
def admin_get_users_list():
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
def admin_get_user_infos(user_id):
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
def admin_edit_user_info():
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
def admin_transfer_student():
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
def admin_remove_student():
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
  school = current_user.school
  all_skills = [skill_connection.skill for skill_connection in school.skills]
  all_subskills = [subskill_connection.subskill for subskill_connection in school.subskills]
  all_items = [item_connection.item for item_connection in school.items]


  res = [
    {
      "id": skill.id,
      "name": skill.name,
      "scope": skill.scope,
      "subskills": [
        {
          "id": subskill.id,
          "name": subskill.name,
          "scope": subskill.scope,
          "items": [
            {
              "id": item.id,
              "label": item.label,
              "type": "simple" if item.image_url else "complex",
              "image_url": item.image_url if item.image_url else None,
              "scope": item.scope,
              "subitems": [
                {
                  "id": subitem.id,
                  "content": subitem.content,
                } for subitem in item.subitems
              ] if item.subitems else None
            } for item in subskill.items if item in all_items
          ],
          "free_items": [item.label for item in subskill.items if item not in all_items and item.scope == 100]
        } for subskill in skill.subskills if subskill in all_subskills
      ],
      "free_subskills": [subskill.name for subskill in skill.subskills if subskill not in all_subskills and subskill.scope == 100]
    } for skill in all_skills
  ]

  

  return jsonify(res), 200


@app.route('/api/admin/delete_item', methods=['POST'])
@admin
def admin_delete_item():
  data = request.get_json()

  try:
    item = Item.query.filter_by(id=data['id']).first()
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  item_connection = ItemConnection.query.filter_by(school=current_user.school, item=item).first()

  if item.scope == 100:
    db.session.delete(item_connection)
  else:
    image = ItemImage.query.filter_by(id=item.image_url.split('/')[-1]).first()
    if image:
      db.session.delete(item)
    db.session.delete(image)
    db.session.delete(item_connection)
  db.session.commit()
  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/admin/delete_skill', methods=['POST'])
@admin
def admin_delete_skill():
  try:
    id = request.args['id']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  skill = Skill.query.filter_by(id=id).first()
  skill_connection = SkillConnection.query.filter_by(school=current_user.school, skill=skill).first()

  if skill.scope == 100:
    db.session.delete(skill_connection)
  
  else:
    for subskill in skill.subskills:
      for item in subskill.items:
        db.session.delete(item)
      db.session.delete(subskill)
    db.session.delete(skill)
    db.session.delete(skill_connection)
  
  db.session.commit()

  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/admin/delete_subskill', methods=['POST'])
@admin
def admin_delete_subskill():
  try:
    id = request.args['id']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  subskill = Subskill.query.filter_by(id=id).first()
  subkill_connection = SubskillConnection.query.filter_by(school=current_user.school, subskill=subskill).first()

  if subskill.scope == 100:
    db.session.delete(subkill_connection)
  
  else:
    for item in subskill.items:
      db.session.delete(item)
    db.session.delete(subskill)
    db.session.delete(subkill_connection)
  
  db.session.commit()

  return jsonify(SUCCESS["DELETE"]), 200


@app.route('/api/admin/add_subskill', methods=['POST'])
@admin
def admin_add_subskill():
  data = request.get_json()
  try:
    skill = Skill.query.filter_by(id=data['skill_id']).first()
    name = data["name"]
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  subskill = Subskill.query.filter_by(scope=100, name=name).first()
  if not subskill:
    subskill = Subskill(
      skill=skill,
      name=name,
    )
    db.session.add(subskill)
  
  new_subskill_connection = SubskillConnection(school=current_user.school, subskill=subskill)
  db.session.add(new_subskill_connection)

  db.session.commit()

  res = {
    "id": subskill.id,
    "name": subskill.name,
    "items": []
  }

  return jsonify(res), 200


@app.route('/api/admin/add_simple_item', methods=["POST"])
@admin
def admin_add_simple_item():
  data = request.args
  if len(data) != 2:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  try:
    image = request.files["image"]
    subskill = Subskill.query.filter_by(id=data['subskill_id'], scope=100).first()
    name = data['name']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_image = ItemImage(
    image=image.read(),
    mimetype=image.mimetype,
    filename=secure_filename(image.filename)
  )
  db.session.add(new_image)
  db.session.commit()

  new_item = Item(
    label=name,
    subskill=subskill,
    image_url=f"/image/{new_image.id}"
  )
  db.session.add(new_item)
  db.session.commit()

  new_connection = ItemConnection(item=new_item, school=current_user.school)
  db.session.add(new_connection)

  db.session.commit()

  res = {
    "id": new_item.id,
    "label": new_item.label,
    "type": "simple",
    "image_url": new_item.image_url,
    "subitems": []
  }

  return jsonify(res), 200


@app.route('/api/admin/add_complex_item', methods=['POST'])
@admin
def admin_add_complex_item():
  data = request.get_json()

  try:
    subskill = Subskill.query.filter_by(id=data['subskill_id'], scope=100).first()
    name = data['name']
    subitems = data['subitems']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_item = Item(
    label=name,
    subskill=subskill,
  )
  db.session.add(new_item)

  new_connection = ItemConnection(item=new_item, school=current_user.school)
  db.session.add(new_connection)

  subitems_list = []

  for subitem in subitems:
    new_subitem = Subitem(
      item=new_item,
      content=subitem,
    )
    
    subitems_list.append({
      "id": new_subitem.id,
      "content": new_subitem.content,
    })

    db.session.add(new_subitem)
  
  db.session.commit()

  res = {
    "id": new_item.id,
    "label": new_item.label,
    "type": "complex",
    "image_url": None,
    "subitems": subitems_list
  }

  return jsonify(res), 200


@app.route('/api/admin/add_existing_item', methods=['POST'])
@admin
def admin_add_existing_item():
  data = request.get_json()
  try:
    subskill = Subskill.query.filter_by(id=data['subskill_id'], scope=100).first()
    item = Item.query.filter_by(label=data['name'], scope=100, subskill=subskill).first()
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  new_connection = ItemConnection(item=item, school=current_user.school)
  db.session.add(new_connection)
  db.session.commit()

  res = {
    "id": item.id,
    "label": item.label,
    "type": "simple" if item.image_url else "complex",
    "image_url": item.image_url if item.image_url else None,
    "scope": item.scope,
    "subitems": [
      {
        "id": subitem.id,
        "content": subitem.content,
      } for subitem in item.subitems
    ] if item.subitems else None
  }

  return jsonify(res), 200






# Teacher Routes
@app.route('/api/teacher/get_classroom_infos')
@teacher
def teacher_get_classroom_infos():
  classroom = current_user.classroom
  if not classroom:
    return jsonify(ERRORS["USER_NOT_IN_A_CLASSROOM"]), 400

  teacher = User.query.filter_by(classroom=classroom, role=ROLES["teacher"]).first()
  students = User.query.filter_by(classroom=classroom, role=ROLES["student"]).all()

  res = {
    "id": classroom.id,
    "teacher": {
      "username": teacher.username,
      "name": teacher.name,
      "firstname": teacher.firstname,
      "id": teacher.id
    },
    "students": [{
      "id": student.id,
      "name": student.name,
      "firstname": student.firstname,
      "username": student.username
    } for student in students]
  }

  return jsonify(res), 200


@app.route('/api/teacher/add_student', methods=['POST'])
@teacher
def teacher_add_student():
  data = request.get_json()
  try:
    # Create new student account
    student = generate_user(data, ROLES['student'], current_user.classroom, current_user.school)
    db.session.add(student)

    db.session.commit()
    return jsonify({
      'id': student.id,
      'firstname': student.firstname,
      'name': student.name,
      'username': student.username
    }), 200

  except:
    return jsonify(ERRORS['INVALID_ARGS']), 400


@app.route('/api/teacher/get_student_infos/<int:classroom_id>/<string:student_username>')
@teacher
def teacher_get_student_infos(classroom_id, student_username):
  if current_user.classroom.id != classroom_id:
    return jsonify(ERRORS["UNAUTHORIZED"]), 403
  
  student = User.query.filter_by(classroom=current_user.classroom, username=student_username).first()
  if not student:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  skills_infos, total_items, total_validated_items = get_validated_skills(student, current_user.school)

  res = {
    "is_allowed": True,
    "id": student.id,
    "name": student.name,
    "firstname": student.firstname,
    "skills": skills_infos,
    "total_items": total_items,
    "total_validated_items": total_validated_items
  }

  return jsonify(res), 200


@app.route('/api/teacher/validate_complex_item', methods=['POST'])
@teacher
def teacher_validate_complex_item():
  data = request.get_json()
  try:
    student = User.query.filter_by(classroom=current_user.classroom, username=data['student_username']).first()
    new_value_item = data['item']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  validated_subitems = []
  for subitem in new_value_item['subitems']:
    if subitem['validation']:
      validated_subitems.append(subitem['id'])

  item = Item.query.filter_by(id=new_value_item['id']).first()
  validation = Validation.query.filter_by(item=item, user=student).first()

  if validation and not new_value_item['validation']:
    db.session.delete(validation)
  
  elif not validation and new_value_item['validation']:
    validation = Validation(user=student, item=item)
    if new_value_item['validation']['status'] == 0:
      validation.validated_subitems = str(validated_subitems)
      validation.status = 0
    elif new_value_item['validation']['status'] == 1:
      validation.validated_subitems = str(validated_subitems)
      validation.date = new_value_item['validation']['date']
      validation.status = 1

  elif validation and new_value_item['validation']:
    validation.status = new_value_item['validation']['status']
    validation.date = new_value_item['validation']['date']
    validation.validated_subitems = str(validated_subitems)

  db.session.commit()
  return jsonify(SUCCESS["EDIT"]), 200


@app.route('/api/teacher/validate_simple_item', methods=['POST'])
@teacher
def teacher_validate_simple_item():
  data = request.get_json()
  try:
    student = User.query.filter_by(classroom=current_user.classroom, username=data['student_username']).first()
    new_value_item = data['item']
  except:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  item = Item.query.filter_by(id=new_value_item['id']).first()
  validation = Validation.query.filter_by(item=item, user=student).first()

  if validation and not new_value_item['validation']:
    db.session.delete(validation)
  


  elif not validation and new_value_item['validation']:
    validation = Validation(user=student, item=item)
    if new_value_item['validation']['status'] == 0:
      validation.status = 0
    elif new_value_item['validation']['status'] == 1:
      validation.date = new_value_item['validation']['date']
      validation.status = 1

  elif validation and new_value_item['validation']:
    validation.status = new_value_item['validation']['status']
    validation.date = new_value_item['validation']['date']

  db.session.commit()
  return jsonify(SUCCESS["EDIT"]), 200





  









# Student Routes
@app.route('/api/student/get_infos')
@student
def student_get_infos():
  student = current_user
  if not student:
    return jsonify(ERRORS["INVALID_ARGS"]), 400
  
  skills_infos, total_items, total_validated_items = get_validated_skills(student, current_user.school)

  res = {
    "is_allowed": True,
    "id": student.id,
    "name": student.name,
    "firstname": student.firstname,
    "skills": skills_infos,
    "total_items": total_items,
    "total_validated_items": total_validated_items
  }

  return jsonify(res), 200





@app.route('/image/<int:id>')
def display_image(id):
  ''' Return a requested image '''
  img = ItemImage.query.filter_by(id=id).first()
  return Response(img.image, mimetype=img.mimetype), 200