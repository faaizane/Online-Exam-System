# Stage 1: Builder
FROM python:3.9-slim-bullseye AS builder

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    wget \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /install

# Copy requirements
COPY requirements.txt .

# Install Python dependencies into a temp directory
RUN pip install --no-cache-dir --prefix=/install/deps -r requirements.txt

# Pre-download YOLOv5 model to cache it
RUN python3 -c "import torch; torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)"

# Stage 2: Final image
FROM python:3.9-slim-bullseye

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV TORCH_HOME=/app/.cache/torch
ENV HUB_CACHE_DIR=/app/.cache/torch/hub

# Install runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app

# Set working directory
WORKDIR /app

# Copy installed python packages from builder
COPY --from=builder /install/deps /usr/local

# Copy torch cache from builder
COPY --from=builder /root/.cache/torch /app/.cache/torch

# Copy app files
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Create necessary directories and set permissions
RUN mkdir -p /app/.cache/torch/hub && \
    mkdir -p /app/uploads && \
    chown -R app:app /app

# Switch to non-root user
USER app

# Expose app port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python3 -c "import requests; requests.get('http://localhost:5001/status', timeout=5)" || exit 1

# Use start script
CMD ["./start.sh"]
