# # Use a lightweight Python image
# FROM python:3.9-slim

# # Set environment variables for non-interactive installation
# ENV DEBIAN_FRONTEND=noninteractive

# # Install system dependencies for OpenCV and MediaPipe
# # Clean up apt cache to keep the image size down
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     libgl1 \
#     libglib2.0-0 \
#     ffmpeg \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Set working directory inside the container
# WORKDIR /app

# # Copy only the requirements file first to leverage Docker's build cache
# COPY requirements.txt .

# # Install Python dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the rest of the application files
# COPY . .

# # Expose the port your Flask app runs on
# EXPOSE 5001

# # Run the Flask server
# # Use a more robust command for production, e.g., gunicorn
# CMD ["python", "camera_server.py"]




# Stage 1: Builder
FROM python:3.9-slim-bullseye AS builder

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /install

# Copy requirements
COPY requirements.txt .

# Install Python dependencies into a temp directory
RUN pip install --no-cache-dir --prefix=/install/deps -r requirements.txt


# Stage 2: Final image
FROM python:3.9-slim-bullseye

# Install system dependencies again (needed for runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    ffmpeg \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed python packages from builder
COPY --from=builder /install/deps /usr/local

# Copy app files
COPY . .

# Expose app port
EXPOSE 5001

# Run the Flask server
CMD ["python", "camera_server.py"]
