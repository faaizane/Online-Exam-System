FROM python:3.10-slim
WORKDIR /app

# FFmpeg install (for video encoding)
RUN apt-get update \
 && apt-get install -y ffmpeg \
 && rm -rf /var/lib/apt/lists/*

# Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY . .

# Railway pe 3000 expose karo
EXPOSE 3000

# Use Railway ka $PORT, fallback 3000 pe
CMD ["gunicorn", "--bind", "0.0.0.0:${PORT:-3000}", "camera_server:app", "--workers", "1"]
