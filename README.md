# Online Exam System

A comprehensive web-based application designed to simplify and enhance the online examination experience for both teachers and students. This project integrates a robust backend, an intuitive frontend, and a camera-based cheating detection system.

## Features

### Teacher Dashboard

- **Exam Management:** Create, edit, and manage exams.
- **Student Management:** Add, view, and manage student information.
- **Results Analysis:** Review results, track student performance.
- **Cheating Detection:** Automated detection and review of potential cheating incidents using camera-based monitoring.

### Student Dashboard

- **Exam Participation:** Intuitive and user-friendly exam-taking interface.
- **Real-Time Feedback:** Instant results and performance summaries.
- **Profile Management:** Manage profile and view history of taken exams.

### Camera-Based Cheating Detection

- **Real-Time Monitoring:** Uses YOLOv5 for object detection to monitor students during exams.
- **Face and Eye Detection:** MediaPipe is utilized for detecting faces and eyes to enhance cheating detection accuracy.
- **Cheating Alerts:** Automatically flags suspicious activities for review.

## Technologies Used

### Frontend

- React.js
- Tailwind CSS
- Vite.js

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose ODM)

### Camera Detection Module

- Python
- Flask
- YOLOv5
- OpenCV
- MediaPipe (used for face and eye detection, including gaze tracking)

## Project Structure

```
FYP-Online-Exam/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── vite.config.js
│   └── index.html
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── seeder.js
├── camera-detection/
│   ├── camera_server.py
│   ├── requirements.txt
│   ├── yolov5s.pt
│   └── Dockerfile
└── README.md
```

## Installation

### Prerequisites

- Node.js and npm installed
- Python 3.9+ installed
- MongoDB installed and running

### Steps

1. Clone the repository:

   ```bash
   git clone <repository-link>
   ```

2. Install dependencies for the frontend:

   ```bash
   cd frontend
   npm install
   ```

3. Install dependencies for the backend:

   ```bash
   cd ../backend
   npm install
   ```

4. Set up the camera detection module:

   ```bash
   cd ../camera-detection
   python -m venv env
   source env/Scripts/activate  # For Windows
   pip install -r requirements.txt
   ```

## Running the Application

### Frontend and Backend

Start both the frontend and backend servers simultaneously by running the following command in the root project directory:

```bash
npm run dev
```

### Camera Detection Module

Run the Flask server for camera-based cheating detection. Ensure `ffmpeg` is installed as it is required for video processing:

```bash
cd camera-detection
npm run server
```

## Features in Detail

### Cheating Detection

The camera detection module uses YOLOv5 for real-time object detection. It monitors students during exams and flags suspicious activities, such as looking away from the screen or the presence of unauthorized objects.

### Exam Management

Teachers can create exams with customizable settings, including time limits, question types, and grading criteria. Students can participate in exams with a user-friendly interface.

### Results Analysis

Teachers can view detailed performance reports for each student, including scores, time taken, and flagged cheating incidents.

## Contributing

This project is not open source. Contributions are not accepted without prior permission. Please contact Faizan Elahi at [faaizane@gmail.com](mailto:faaizane@gmail.com) for inquiries.

## License

This project is not open source. Permission is required to use or modify this project. Please contact Faizan Elahi at [faaizane@gmail.com](mailto:faaizane@gmail.com) for inquiries.

---

For further details or questions, please contact Faizan Elahi at [faaizane@gmail.com](mailto:faaizane@gmail.com).
