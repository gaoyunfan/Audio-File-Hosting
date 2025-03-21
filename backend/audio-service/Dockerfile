FROM python:3.12-slim

WORKDIR /code/audio-service


RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001



CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py shell < setup.py && python manage.py runserver 0.0.0.0:8001"]

