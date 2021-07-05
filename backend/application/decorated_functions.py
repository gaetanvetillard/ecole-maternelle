from functools import wraps
from .routes import current_user, jsonify

ROLES = {
  "super_admin": 1000,
  "admin": 100,
  "teacher": 10,
  "student": 1
}


def admin(f):
  ''' Decorated function to allowed access to admin only '''
  @wraps(f)
  def decorated_func(*args, **kwargs):
    if current_user.is_authenticated and current_user.role == ROLES["admin"]:
      return f(*args, **kwargs)
    return jsonify({"Access Denied": "You don't have access to this page."}), 403
  return decorated_func


def teacher(f):
  ''' Decorated function to allowed access to admin only '''
  @wraps(f)
  def decorated_func(*args, **kwargs):
    if current_user.is_authenticated and current_user.role == ROLES["teacher"]:
      return f(*args, **kwargs)
    return jsonify({"Access Denied": "You don't have access to this page."}), 403
  return decorated_func


def student(f):
  ''' Decorated function to allowed access to admin only '''
  @wraps(f)
  def decorated_func(*args, **kwargs):
    if current_user.is_authenticated and current_user.role == ROLES["student"]:
      return f(*args, **kwargs)
    return jsonify({"Access Denied": "You don't have access to this page."}), 403
  return decorated_func


