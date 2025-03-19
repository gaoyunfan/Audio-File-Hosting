from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models import User
from app import db

user_bp = Blueprint("user", __name__, url_prefix="/users")


@user_bp.route("/", methods=["GET"])
@jwt_required()
def list_users():
    per_page = request.args.get("per_page", 10, type=int)
    last_id = request.args.get("last_id", None, type=int)

    query = db.select(User).order_by(User.id)
    if last_id:
        query = query.filter(User.id > last_id)

    users = db.session.execute(query.limit(per_page)).scalars().all()

    next_last_id = (
        db.session.execute(
            db.select(User.id).where(User.id > users[-1].id).order_by(User.id)
        ).scalar()
        if users
        else None
    )

    return (
        jsonify(
            {
                "users": [{"id": user.id, "username": user.username} for user in users],
                "next_last_id": next_last_id,
            }
        ),
        200,
    )


@user_bp.route("/<int:id>", methods=["PATCH"])
@jwt_required()
def update_user(id):
    data = request.get_json()
    username = data.get("username")
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    user = User.query.get(id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    is_modified = False
    if username and user.username != username:
        user.username = username
        is_modified = True

    if old_password and new_password:
        if not user.check_password(old_password):
            return jsonify({"msg": "Invalid old password"}), 401
        user.set_password(new_password)
        is_modified = True

    if not is_modified:
        return jsonify({"msg": "Nothing to update"}), 400

    db.session.commit()
    return jsonify({"msg": "User updated"}), 200


@user_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_user(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "User deleted"}), 200
