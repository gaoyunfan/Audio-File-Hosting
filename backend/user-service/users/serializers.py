from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
        )


class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "password", "password2")
        extra_kwargs = {
            "password": {"write_only": True},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match"})
        return data

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User.objects.create_user(**validated_data)
        return user


class EditUserSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=False)
    password2 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "old_password",
            "password",
            "password2",
        )
        extra_kwargs = {
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def validate(self, data):
        old_password = data.get("old_password")
        password = data.get("password")
        password2 = data.pop("password2", None)
        if password:
            if not old_password:
                raise serializers.ValidationError(
                    {
                        "old_password": "Old password is required when changing the password."
                    }
                )

            if not self.instance.check_password(old_password):
                raise serializers.ValidationError(
                    {"old_password": "Incorrect password."}
                )
            if password != password2:
                raise serializers.ValidationError(
                    {"password2": "Passwords do not match."}
                )

        return data

    def update(self, instance, validated_data):
        validated_data.pop("username", None)
        print("validated_data", validated_data)
        password = validated_data.pop("password", None)
        if password:
            instance.set_password(password)

        return super().update(instance, validated_data)
