from flask import *
from flask_login import LoginManager, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView


# class ModelView_(ModelView):
#     def is_accessible(self):
#         return current_user.is_authenticated and current_user.role == 100
    
# class AdminIndexView_(AdminIndexView):
#     def is_accessible(self):
#         return current_user.is_authenticated and current_user.role == 100

class ModelView_(ModelView):
    def is_accessible(self):
        return not current_user.is_authenticated
    
class AdminIndexView_(AdminIndexView):
    def is_accessible(self):
        return not current_user.is_authenticated

db = SQLAlchemy()

def init_app():
    """ Initialize the core app """
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object("config.Config")

    #Login manager
    login_manager = LoginManager()
    login_manager.init_app(app)

    #Database 
    db.init_app(app)

    
    with app.app_context():
        from . import routes, decorated_functions
        from .models import School, Classroom, User, Skill, Subskill, Item, ItemImage, Validation, SkillConnection, SubskillConnection, ItemConnection, Subitem
        db.create_all()

        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))

        admin = Admin(app, index_view=AdminIndexView_(url="/super-admin-02156"))
        admin.add_views(
            ModelView_(School, db.session),
            ModelView_(Classroom, db.session),
            ModelView_(User, db.session),
            ModelView_(Skill, db.session),
            ModelView_(Subskill, db.session),
            ModelView_(Item, db.session),
            ModelView_(Subitem, db.session),
            ModelView_(ItemImage, db.session),
            ModelView_(Validation, db.session),
            ModelView_(SkillConnection, db.session),
            ModelView_(SubskillConnection, db.session),
            ModelView_(ItemConnection, db.session),
        )

        return app

