#!/bin/bash

# Production startup script for Railway deployment
echo "🚀 Starting AI Detection Server on Railway..."

# Set environment variables for optimization
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
export OMP_NUM_THREADS=2
export TORCH_NUM_THREADS=2
export MKL_NUM_THREADS=2

# Memory optimization for Railway
export MALLOC_TRIM_THRESHOLD_=100000
export MALLOC_MMAP_THRESHOLD_=100000

# Create necessary directories
mkdir -p /app/.cache/torch/hub
mkdir -p /app/uploads

# Check available memory
echo "📊 Available memory: $(free -h | awk '/^Mem:/ {print $7}') / $(free -h | awk '/^Mem:/ {print $2}')"

# Pre-download models to avoid runtime delays
echo "📥 Pre-loading AI models..."
python3 -c "
import torch
import warnings
warnings.filterwarnings('ignore')
print('🔄 Loading YOLOv5...')
try:
    model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True, verbose=False)
    print('✅ YOLOv5 loaded successfully')
except Exception as e:
    print(f'❌ YOLOv5 error: {e}')

import mediapipe as mp
print('🔄 Loading MediaPipe...')
try:
    mp_face = mp.solutions.face_mesh
    face_mesh = mp_face.FaceMesh(max_num_faces=1)
    print('✅ MediaPipe loaded successfully')
except Exception as e:
    print(f'❌ MediaPipe error: {e}')
"

echo "🌐 Starting server..."

# Check if we're in Railway environment
if [ ! -z "$RAILWAY_ENVIRONMENT" ]; then
    echo "🚂 Railway environment detected"
    # Use gunicorn for production on Railway
    exec gunicorn \
        --bind 0.0.0.0:${PORT:-5001} \
        --workers 1 \
        --threads 2 \
        --timeout 120 \
        --worker-class gthread \
        --max-requests 500 \
        --max-requests-jitter 50 \
        --preload \
        --log-level info \
        --access-logfile - \
        --error-logfile - \
        camera_server:app
else
    echo "💻 Local environment detected"
    # Use Flask development server for local testing
    python3 camera_server.py
fi