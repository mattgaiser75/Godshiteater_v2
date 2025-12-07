FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY backend ./backend
COPY frontend ./frontend
COPY backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

EXPOSE 7860

CMD ["bash", "backend/start.sh"]
