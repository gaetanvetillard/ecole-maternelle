from . import db
from flask_login import UserMixin

class School(db.Model):
    __tablename__ = "school"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False)
    address = db.Column(db.String(250), nullable=False)
    zipcode = db.Column(db.String(10), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    classrooms = db.relationship("Classroom", back_populates="school")
    skills = db.relationship("SkillConnection", back_populates="school")
    subskills = db.relationship("SubskillConnection", back_populates="school")
    items = db.relationship("ItemConnection", back_populates="school")
    users = db.relationship('User', back_populates="school")

    def __repr__(self) -> str:
        return f'<School {self.name} {self.address} {self.zipcode} {self.city}>'


class Classroom(db.Model):
    __tablename__ = "classroom"

    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey("school.id"))
    school = db.relationship("School", back_populates="classrooms")
    teacher_username = db.Column(db.String(200), unique=True, nullable=False)
    users = db.relationship("User", back_populates="classroom")

    def __repr__(self) -> str:
        return f'<Classroom of {self.teacher_username} in {self.school.name}>'


class User(UserMixin, db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    firstname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    username = db.Column(db.String(200), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.Integer, nullable=False)
    classroom_id = db.Column(db.Integer, db.ForeignKey("classroom.id"))
    classroom = db.relationship("Classroom", back_populates="users")
    school_id = db.Column(db.Integer, db.ForeignKey("school.id"))
    school = db.relationship('School', back_populates="users")
    validated_items = db.relationship('Validation', back_populates="user")

    def __repr__(self) -> str:
        return f"<User {self.id} {self.username}>"


class Skill(db.Model):
    __tablename__ = "skill"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False)
    schools = db.relationship('SkillConnection', back_populates="skill")
    subskills = db.relationship('Subskill', back_populates="skill")
    scope = db.Column(db.Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<Skill id={self.id} name={self.name}>"


class Subskill(db.Model):
    __tablename__ = "subskill"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False)
    schools = db.relationship('SubskillConnection', back_populates="subskill")
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'))
    skill = db.relationship('Skill', back_populates="subskills")
    items = db.relationship('Item', back_populates="subskill")
    scope = db.Column(db.Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<Subskill id={self.id} name={self.name}>"


class Item(db.Model):
    __tablename__ = "item"

    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(250), nullable=False)
    image_url = db.Column(db.String(250), nullable=True)
    subitems = db.relationship("Subitem", back_populates="item")
    schools = db.relationship('ItemConnection', back_populates="item")
    subskill_id = db.Column(db.Integer, db.ForeignKey("subskill.id"))
    subskill = db.relationship("Subskill", back_populates="items")
    validated_users = db.relationship("Validation", back_populates="item")
    scope = db.Column(db.Integer, default=0, nullable=False)

    def __repr__(self) -> str:
        return f"<Item id={self.id} label={self.label}>"


class Subitem(db.Model):
    __tablename__ = "subitem"

    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey("item.id"))
    item = db.relationship("Item", back_populates="subitems")
    content = db.Column(db.String(25))
    type = db.Column(db.String(50))


class ItemImage(db.Model):
    __tablename__ = "item_image"

    id = db.Column(db.Integer, primary_key=True)
    image = db.Column(db.LargeBinary, nullable=False)
    filename = db.Column(db.String(150), nullable=False)
    mimetype = db.Column(db.String(50), nullable=False)

    def __repr__(self) -> str:
        return f"<ItemImage id={self.id}>"


class Validation(db.Model):
    __tablename__ = "validation"

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), primary_key=True)
    user = db.relationship("User", back_populates="validated_items")
    item_id = db.Column(db.Integer, db.ForeignKey("item.id"), primary_key=True)
    item = db.relationship("Item", back_populates="validated_users")
    date = db.Column(db.String(50))

    def __repr__(self) -> str:
        return f"<Validation user={self.user.username} item={self.item.label}>"
    

class SkillConnection(db.Model):
    __tablename__ = "skill_connection"

    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), primary_key=True)
    school = db.relationship("School", back_populates="skills")

    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), primary_key=True)
    skill = db.relationship("Skill", back_populates="schools")


class SubskillConnection(db.Model):
    __tablename__ = "subskill_connection"

    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), primary_key=True)
    school = db.relationship("School", back_populates="subskills")
    
    subskill_id = db.Column(db.Integer, db.ForeignKey('subskill.id'), primary_key=True)
    subskill = db.relationship("Subskill", back_populates="schools")


class ItemConnection(db.Model):
    __tablename__ = "item_connection"

    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), primary_key=True)
    school = db.relationship("School", back_populates="items")

    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), primary_key=True)
    item = db.relationship("Item", back_populates="schools")