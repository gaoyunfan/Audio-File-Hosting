FROM python:3.12-slim

WORKDIR /code/user 


RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app ./app
COPY run.py .

EXPOSE 8000

ENV FLASK_APP=run.py

CMD ["python", "run.py"]

