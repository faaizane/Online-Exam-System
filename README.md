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
├── DocumentExample/
│   ├── cloud.docx
│   └── example.docx
└── README.md
```


Document examples are also provided in the project, located in the `DocumentExample` folder.

## User Object Structure (Teacher & Student)

This section describes the structure (fields) for Teacher and Student as user objects in the system.

### Teacher User Fields

Each teacher user object contains the following fields:

- **name**: Full name of the teacher  
  _Example_: `Teacher Name`
- **email**: Email address  
  _Example_: `jhon@uetpeshawar.edu.pk`
- **password**: Password (will be hashed)  
  _Example_: `jhon123`
- **role**: User role  
  _Example_: `teacher`
- **department**: Department name  
  _Example_: `Computer Science`
- **designation**: Designation/position  
  _Example_: `Lecturer`

### Student User Fields

Each student user object contains the following fields:

- **name**: Full name of the student  
  _Example_: `Student Name`
- **email**: Email address  
  _Example_: `21pwbcs0001@uetpeshawar.edu.pk`
- **password**: Password (will be hashed)  
  _Example_: `5555`
- **role**: User role  
  _Example_: `student`
- **department**: Department name  
  _Example_: `Computer Science`
- **semester**: Semester number  
  _Example_: `3`
- **section**: Section (A/B/C/D)  
  _Example_: `A`
- **registrationNumber**: Registration number  
  _Example_: `21PWBCS0001`

## Environment Variables

### Backend (`backend/.env`)

These variables are required in the backend `.env` file:

- `PORT`: Port number for backend server (e.g., `5000`)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `JWT_EXPIRES_IN`: JWT token expiry duration (e.g., `7d`)
- `NODE_BACKEND`: Backend base URL (e.g., `http://localhost:5000`)
- `FFMPEG_PATH`: Path to ffmpeg executable (e.g., `F:/ffmpeg/bin/ffmpeg.exe`)

### Frontend (`frontend/.env`)

These variables are required in the frontend `.env` file:

- `VITE_API_BASE_URL`: Backend API base URL (e.g., `http://localhost:5000`)
- `VITE_YOLO_BACKEND_URL`: Camera detection backend URL (e.g., `http://127.0.0.1:5001`)

### Camera Detection (`camera-detection/.env`)

These variables are required in the camera-detection `.env` file:

- `JWT_SECRET`: Secret key for JWT authentication (should match backend)
- `NODE_BACKEND`: Backend base URL (e.g., `http://localhost:5000`)
- `FFMPEG_PATH`: Path to ffmpeg executable

## Installation

### Prerequisites

- Node.js and npm installed
- Python 3.9+ installed
- MongoDB installed and running
- Nodemon installed

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

This project is not open source. Permission is required to use or modify this project. Please contact Faizan Elahi or [faaizane@gmail.com](mailto:faaizane@gmail.com) for inquiries.

---

## Project Members

- Faizan Elahi
- Abdullah

## For further details or questions

Please contact Faizan Elahi at [faaizane@gmail.com](mailto:faaizane@gmail.com).
