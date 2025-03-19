from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
    set_refresh_cookies,
)
from datetime import timedelta, datetime, timezone
from app.models import User
from app import db, redis_db, jwt, print_message

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    print_message(f"register data: {data}")
    username = data.get("username", None)
    password = data.get("password", None)
    password2 = data.get("password2", None)
    if not username or not password or not password2:
        return (
            jsonify({"msg": "Username, password and confirmed password are required"}),
            400,
        )
    if password != password2:
        return jsonify({"msg": "Passwords do not match"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "User already exists"}), 400
    try:
        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=user.id)
        refresh_token = create_refresh_token(identity=user.id)
        response = jsonify(
            {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "msg": "User created",
                "User": {"id": user.id, "username": user.username},
            }
        )
        return response, 201
    except Exception as e:
        db.session.rollback()
        print_message(f"Error registering user: {e}")
        return jsonify({"msg": f"Error registering user"}), 500
    finally:
        db.session.close()


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    print_message(f"username: {username}, password: {password}")
    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid username or password"}), 401
    print_message(f"user: {username} is valid")
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return (
        jsonify(
            {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "msg": "Login successful",
                "user": {"id": user.id, "username": user.username},
            }
        ),
        200,
    )


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    try:
        print_message(f"headers: {request.headers.get('Authorization')}")
        token = get_jwt()
        jti = token["jti"]
        exp_timestamp = token.get("exp", 0)

        remaining_time = get_remaining_time(exp_timestamp)

        if remaining_time > 0:
            redis_db.set(jti, "", ex=int(remaining_time))

        return jsonify(message=f"Logout successfully"), 200
    except Exception as e:
        print_message(f"Error logging out: {e}")
        return jsonify(message=f"Error logging out, Please try again later"), 500


@jwt.token_in_blocklist_loader
def check_if_token_is_revoked(jwt_header, jwt_payload: dict):
    jti = jwt_payload["jti"]
    is_revoked = redis_db.get(jti) is not None
    print_message(f"token: {jti} is revoked: {is_revoked}")
    return is_revoked


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True, locations=["headers"])
def refresh():
    try:
        user_id = get_jwt_identity()
        print_message(f"refresh user_id: {user_id}")
        user = User.query.get(user_id)
        if not user or user.is_deleted:
            return jsonify(message="User no longer exists or is deactivated"), 403

        new_access_token = create_access_token(identity=user_id)
        refresh_token = get_jwt()
        jti = refresh_token["jti"]
        remaining_time = get_remaining_time(refresh_token["exp"])
        refresh_token_threshold = 6 * 60 * 60
        new_refresh_token = None
        if remaining_time < refresh_token_threshold:
            redis_db.set(jti, "", ex=int(remaining_time))
            new_refresh_token = create_refresh_token(
                identity=user_id, expires_delta=timedelta(seconds=remaining_time)
            )

        return (
            jsonify(access_token=new_access_token, refresh_token=new_refresh_token),
            200,
        )

    except Exception as e:
        print_message(f" Token refresh error: {e}")
        return jsonify(message="Token refresh failed"), 500


def get_remaining_time(exp_timestamp):
    now = datetime.now(timezone.utc).timestamp()
    remaining_time = max(0, exp_timestamp - now)
    return remaining_time
