import os
import redis
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from app.config import Config
from flask_cors import CORS
import sys


db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()
redis_db = redis.Redis(host=os.getenv("REDIS_HOST"), port=os.getenv("REDIS_PORT"), db=0)


def print_message(message):
    print(message, file=sys.stderr)


def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object(Config)
    CORS(app, supports_credentials=True)
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    print_message(f'secret: {app.config["JWT_SECRET_KEY"]}')
    print_message(f'subject: {app.config["JWT_VERIFY_SUB"]}')
    from app.routes.user import user_bp
    from app.routes.auth import auth_bp

    app.register_blueprint(user_bp, url_prefix="/users")
    app.register_blueprint(auth_bp, url_prefix="/auth")

    return app
