
class Config(object):
    SECRET_KEY = '48d46zq4d68zq4vc84b8re564ve6z4a1ca648v5ae6'
    
    #MAIL:
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = "ga.vtl53@gmail.com"
    MAIL_PASSWORD = "jaabouiqrvzmyqln"
    
    #DATABASE
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    #FLASK ADMIN
    FLASK_ADMIN_SWATCH = "cerulean"