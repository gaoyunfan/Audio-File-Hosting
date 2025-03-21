import jwt
from django.conf import settings
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError


def get_user_id_from_token(request):
    auth_header = request.headers.get("Authorization", "")
    print(f"auth_header: {auth_header}", flush=True)

    if not auth_header.startswith("Bearer "):
        return None  # or raise error
    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload.get("user_id")
    except ExpiredSignatureError:
        print("Token has expired")
        return None
    except InvalidTokenError:
        print("Invalid token")
        return None
