from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os, torch, jwt, time, threading, collections, base64
import numpy as np, mediapipe as mp, requests, io, imageio, math, warnings, cv2

# ── Load .env ───────────────────────────────
load_dotenv()
SECRET       = os.getenv('JWT_SECRET')
NODE_BACKEND = os.getenv('NODE_BACKEND', '').rstrip('/')
FFMPEG_PATH  = os.getenv('FFMPEG_PATH')

if not SECRET or not NODE_BACKEND:
    raise RuntimeError("JWT_SECRET or NODE_BACKEND not set in .env")

# suppress torch.cuda.amp FutureWarning flood
warnings.filterwarnings(
    "ignore",
    message=".*torch\\.cuda\\.amp\\.autocast.*",
    category=FutureWarning
)

# ── Ensure FFmpeg for imageio ───────────────
if FFMPEG_PATH and os.path.isfile(FFMPEG_PATH):
    os.environ['PATH'] += os.pathsep + os.path.dirname(FFMPEG_PATH)
    os.environ['IMAGEIO_FFMPEG_EXE'] = FFMPEG_PATH
else:
    try:
        import imageio.plugins.ffmpeg as ffmpeg_plugin
        ffmpeg_plugin.download()
    except Exception:
        print("⚠️ Warning: FFmpeg not found or auto-download failed; ensure it's on PATH.")

app = Flask(__name__)
CORS(app)

# ── Load YOLOv5 ─────────────────────────────
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
model.conf, model.iou = 0.5, 0.45
_ = model(np.zeros((640, 640, 3), dtype=np.uint8), size=640)

# ── MediaPipe Face Mesh ─────────────────────
mp_face   = mp.solutions.face_mesh

# Create face mesh instances per student to avoid timestamp conflicts
def create_face_mesh():
    return mp_face.FaceMesh(
        static_image_mode=True,  # Changed to True to avoid timestamp issues
        max_num_faces=2,
        refine_landmarks=True,
        min_detection_confidence=0.5
    )

# Store face mesh instances per student
face_mesh_instances = {}

# ── Globals & counters ──────────────────────
FRAME_BUFFER         = collections.deque(maxlen=150)
CHEAT_LOCK           = threading.Lock()
cheated_recently     = {}  # Changed to dict to track per student

# Per-student counters (dict of student_id -> counter)
student_counters = {}

# ── Thresholds ─────────────────────────────
NO_FACE_FRAMES       = 8       # no face ≥8 frames
MULTI_FACE_FRAMES    = 5       # >1 face ≥5 frames
HEAD_TURN_FRAMES     = 8       # head-turn ≥8 frames
HEAD_TURN_ANGLE      = 45      # flag if |angle| >45°
OBJ_DET_FRAMES       = 2       # generic objects ≥2 frames
GAZE_FRAMES          = 8       # gaze-aversion ≥8 frames
PHONE_FRAMES         = 5       # phone ≥5 consecutive frames
PHONE_CONF_THRESH    = 0.6     # YOLO conf ≥60%
GAZE_RATIO_MIN       = 0.3
GAZE_RATIO_MAX       = 0.7
OBJECT_CLASSES       = ['laptop', 'book', 'tablet', 'remote']  # phone separate

def get_student_counters(student_id):
    """Get or create counters for a specific student"""
    if student_id not in student_counters:
        student_counters[student_id] = {
            'NO_FACE_COUNTER': 0,
            'MULTI_FACE_COUNTER': 0,
            'HEAD_TURN_COUNTER': 0,
            'GAZE_COUNTER': 0,
            'OBJECT_COUNTER': 0,
            'PHONE_COUNTER': 0,
            'FRAME_BUFFER': collections.deque(maxlen=150)
        }
    
    # Create face mesh instance for this student if not exists
    if student_id not in face_mesh_instances:
        face_mesh_instances[student_id] = create_face_mesh()
    
    return student_counters[student_id]

def head_pose(landmarks):
    l, r = landmarks[33], landmarks[263]
    return math.degrees(math.atan2(r.y - l.y, r.x - l.x))

def handle_cheat(student_id, exam_id, token_header, reason):
    """Handle cheat detection and upload video clip"""
    student_key = f"{student_id}_{exam_id}"
    
    # Check if already processing cheat for this student
    with CHEAT_LOCK:
        if cheated_recently.get(student_key, False):
            return
        cheated_recently[student_key] = True
    
    counters = get_student_counters(student_id)
    frames = list(counters['FRAME_BUFFER'])
    
    if not frames:
        # No delay here - immediate cleanup
        with CHEAT_LOCK:
            cheated_recently[student_key] = False
        return

    buf    = io.BytesIO()
    writer = imageio.get_writer(buf, format='mp4', mode='I', fps=20)
    for frame in frames:
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        writer.append_data(rgb)
    writer.close()
    buf.seek(0)
    clip_data = buf.read()
    buf.close()

    try:
        print(f"📤 Uploading cheat evidence for student {student_id}: {reason}")
        resp = requests.post(
            f'{NODE_BACKEND}/api/cheats',
            files={'clip': ('cheat.mp4', clip_data, 'video/mp4')},
            data={'studentId': student_id, 'examId': exam_id, 'reason': reason},
            headers={'Authorization': token_header},
            timeout=10
        )
        print(f"✅ [handle_cheat] POST /api/cheats → {resp.status_code}", resp.text)
    except Exception as e:
        print("❌ Cheat upload error:", e)
    finally:
        # Reduced delay from 10 seconds to 2 seconds for faster recovery
        time.sleep(2)
        with CHEAT_LOCK:
            cheated_recently[student_key] = False

def process_frame(student_id, exam_id, token_header, frame_data):
    """Process a single frame for AI detection"""
    student_key = f"{student_id}_{exam_id}"
    counters = get_student_counters(student_id)
    
    # Check if already processing cheat for this student
    with CHEAT_LOCK:
        if cheated_recently.get(student_key, False):
            return {"status": "processing"}
    
    try:
        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_data.split(',')[1])
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"status": "error", "message": "Invalid frame data"}
        
        counters['FRAME_BUFFER'].append(frame.copy())
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Get student-specific face mesh instance
        student_face_mesh = face_mesh_instances[student_id]
        
        # Process with MediaPipe face detection with error handling
        try:
            mp_res = student_face_mesh.process(rgb)
        except Exception as mp_error:
            print(f"MediaPipe processing error for student {student_id}: {mp_error}")
            # Create a new face mesh instance if there's an error
            face_mesh_instances[student_id] = create_face_mesh()
            student_face_mesh = face_mesh_instances[student_id]
            try:
                mp_res = student_face_mesh.process(rgb)
            except Exception as mp_error2:
                print(f"MediaPipe processing failed again for student {student_id}: {mp_error2}")
                return {"status": "error", "message": "MediaPipe processing failed"}

        # Debug output for detection status
        detection_status = {
            'faces_detected': len(mp_res.multi_face_landmarks) if mp_res.multi_face_landmarks else 0,
            'student_id': student_id,
            'frame_size': f"{frame.shape[1]}x{frame.shape[0]}"
        }

        # ── Face checks ────────────────────────
        if mp_res.multi_face_landmarks:
            counters['NO_FACE_COUNTER'] = 0

            # multiple faces debounce
            if len(mp_res.multi_face_landmarks) > 1:
                counters['MULTI_FACE_COUNTER'] += 1
            else:
                counters['MULTI_FACE_COUNTER'] = 0
                
            if counters['MULTI_FACE_COUNTER'] >= MULTI_FACE_FRAMES:
                counters['MULTI_FACE_COUNTER'] = 0
                print(f"🚨 CHEAT DETECTED: Multiple faces - Student {student_id}")
                threading.Thread(
                    target=handle_cheat,
                    args=(student_id, exam_id, token_header, "Multiple faces detected"),
                    daemon=True
                ).start()
                return {"status": "cheat_detected", "reason": "Multiple faces detected"}

            # single-face head-turn & gaze
            lm = mp_res.multi_face_landmarks[0].landmark
            angle = head_pose(lm)
            counters['HEAD_TURN_COUNTER'] = counters['HEAD_TURN_COUNTER'] + 1 if abs(angle) > HEAD_TURN_ANGLE else 0
            if counters['HEAD_TURN_COUNTER'] >= HEAD_TURN_FRAMES:
                print(f"🚨 CHEAT DETECTED: Head turned away - Student {student_id}, Angle: {angle:.1f}°")
                threading.Thread(
                    target=handle_cheat,
                    args=(student_id, exam_id, token_header, "Head turned away"),
                    daemon=True
                ).start()
                counters['HEAD_TURN_COUNTER'] = 0
                return {"status": "cheat_detected", "reason": "Head turned away"}

            iris = [lm[i] for i in (468,469,470,471)]
            left_x, right_x = min(p.x for p in iris), max(p.x for p in iris)
            ratio = ((left_x+right_x)/2 - lm[33].x) / (lm[133].x - lm[33].x + 1e-6)
            counters['GAZE_COUNTER'] = counters['GAZE_COUNTER']+1 if (ratio<GAZE_RATIO_MIN or ratio>GAZE_RATIO_MAX) else 0
            if counters['GAZE_COUNTER'] >= GAZE_FRAMES:
                print(f"🚨 CHEAT DETECTED: Gaze averted - Student {student_id}, Ratio: {ratio:.3f}")
                threading.Thread(
                    target=handle_cheat,
                    args=(student_id, exam_id, token_header, "Gaze averted"),
                    daemon=True
                ).start()
                counters['GAZE_COUNTER'] = 0
                return {"status": "cheat_detected", "reason": "Gaze averted"}

        else:
            counters['MULTI_FACE_COUNTER'] = 0
            counters['NO_FACE_COUNTER'] += 1
            if counters['NO_FACE_COUNTER'] >= NO_FACE_FRAMES:
                print(f"🚨 CHEAT DETECTED: No face detected - Student {student_id}")
                threading.Thread(
                    target=handle_cheat,
                    args=(student_id, exam_id, token_header, "No face detected"),
                    daemon=True
                ).start()
                counters['NO_FACE_COUNTER'] = 0
                return {"status": "cheat_detected", "reason": "No face detected"}

        # ── Object & phone detection ─────────────
        results = model(rgb, size=640)

        # phone debounce + confidence
        phone_seen = False
        for *_, conf, cls in results.xyxy[0]:
            if results.names[int(cls)] == 'cell phone' and conf >= PHONE_CONF_THRESH:
                counters['PHONE_COUNTER'] += 1
                phone_seen = True
                break
        if not phone_seen:
            counters['PHONE_COUNTER'] = 0

        if counters['PHONE_COUNTER'] >= PHONE_FRAMES:
            counters['PHONE_COUNTER'] = 0
            print(f"🚨 CHEAT DETECTED: Cell phone - Student {student_id}")
            threading.Thread(
                target=handle_cheat,
                args=(student_id, exam_id, token_header, "Cell phone"),
                daemon=True
            ).start()
            return {"status": "cheat_detected", "reason": "Cell phone"}

        # generic objects
        found, lbl = False, None
        for *_, _, cls in results.xyxy[0]:
            if results.names[int(cls)] in OBJECT_CLASSES:
                found, lbl = True, results.names[int(cls)]
                break

        counters['OBJECT_COUNTER'] = counters['OBJECT_COUNTER']+1 if found else 0
        if counters['OBJECT_COUNTER'] >= OBJ_DET_FRAMES:
            counters['OBJECT_COUNTER'] = 0
            print(f"🚨 CHEAT DETECTED: Object detected - Student {student_id}, Object: {lbl}")
            threading.Thread(
                target=handle_cheat,
                args=(student_id, exam_id, token_header, lbl.capitalize()),
                daemon=True
            ).start()
            return {"status": "cheat_detected", "reason": f"Object detected: {lbl}"}

        # Log detection status periodically
        if hasattr(process_frame, '_frame_count'):
            process_frame._frame_count += 1
        else:
            process_frame._frame_count = 1
            
        if process_frame._frame_count % 10 == 0:  # Log every 10th frame
            print(f"📊 Detection Status - Student {student_id}: Faces: {detection_status['faces_detected']}, "
                  f"Counters: NO_FACE:{counters['NO_FACE_COUNTER']}, MULTI:{counters['MULTI_FACE_COUNTER']}, "
                  f"HEAD:{counters['HEAD_TURN_COUNTER']}, GAZE:{counters['GAZE_COUNTER']}, "
                  f"PHONE:{counters['PHONE_COUNTER']}, OBJ:{counters['OBJECT_COUNTER']}")

        return {"status": "success"}
        
    except Exception as e:
        print(f"Frame processing error: {e}")
        return {"status": "error", "message": str(e)}

def process_frame_practice(student_id, exam_id, frame_data):
    """Process a single frame for practice sessions - detects cheating but doesn't upload clips"""
    student_key = f"{student_id}_{exam_id}"
    counters = get_student_counters(student_id)
    
    print(f"🎓 Processing practice frame for student {student_id}")
    
    try:
        # Decode base64 frame
        frame_bytes = base64.b64decode(frame_data.split(',')[1])
        nparr = np.frombuffer(frame_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return {"status": "error", "message": "Invalid frame data"}
        
        # Store frame for practice (but won't be used for clip generation)
        counters['FRAME_BUFFER'].append(frame.copy())
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Get student-specific face mesh instance
        student_face_mesh = face_mesh_instances[student_id]
        
        # Process with MediaPipe face detection with error handling
        try:
            mp_res = student_face_mesh.process(rgb)
        except Exception as mp_error:
            print(f"🎓 Practice MediaPipe processing error for student {student_id}: {mp_error}")
            # Create a new face mesh instance if there's an error
            face_mesh_instances[student_id] = create_face_mesh()
            student_face_mesh = face_mesh_instances[student_id]
            try:
                mp_res = student_face_mesh.process(rgb)
            except Exception as mp_error2:
                print(f"🎓 Practice MediaPipe processing failed again for student {student_id}: {mp_error2}")
                return {"status": "error", "message": "MediaPipe processing failed"}

        # Debug output for detection status
        detection_status = {
            'faces_detected': len(mp_res.multi_face_landmarks) if mp_res.multi_face_landmarks else 0,
            'student_id': student_id,
            'frame_size': f"{frame.shape[1]}x{frame.shape[0]}"
        }

        # ── Face checks (same as regular but just log, don't upload) ────────────────────────
        if mp_res.multi_face_landmarks:
            counters['NO_FACE_COUNTER'] = 0

            # multiple faces detection
            if len(mp_res.multi_face_landmarks) > 1:
                counters['MULTI_FACE_COUNTER'] += 1
            else:
                counters['MULTI_FACE_COUNTER'] = 0
                
            if counters['MULTI_FACE_COUNTER'] >= MULTI_FACE_FRAMES:
                counters['MULTI_FACE_COUNTER'] = 0
                print(f"🎓 PRACTICE CHEAT DETECTED: Multiple faces - Student {student_id} (not uploaded)")
                return {"status": "cheat_detected", "reason": "Multiple faces detected (practice)"}

            # single-face head-turn & gaze
            lm = mp_res.multi_face_landmarks[0].landmark
            angle = head_pose(lm)
            counters['HEAD_TURN_COUNTER'] = counters['HEAD_TURN_COUNTER'] + 1 if abs(angle) > HEAD_TURN_ANGLE else 0
            if counters['HEAD_TURN_COUNTER'] >= HEAD_TURN_FRAMES:
                print(f"🎓 PRACTICE CHEAT DETECTED: Head turned away - Student {student_id}, Angle: {angle:.1f}° (not uploaded)")
                counters['HEAD_TURN_COUNTER'] = 0
                return {"status": "cheat_detected", "reason": "Head turned away (practice)"}

            iris = [lm[i] for i in (468,469,470,471)]
            left_x, right_x = min(p.x for p in iris), max(p.x for p in iris)
            ratio = ((left_x+right_x)/2 - lm[33].x) / (lm[133].x - lm[33].x + 1e-6)
            counters['GAZE_COUNTER'] = counters['GAZE_COUNTER']+1 if (ratio<GAZE_RATIO_MIN or ratio>GAZE_RATIO_MAX) else 0
            if counters['GAZE_COUNTER'] >= GAZE_FRAMES:
                print(f"🎓 PRACTICE CHEAT DETECTED: Gaze averted - Student {student_id}, Ratio: {ratio:.3f} (not uploaded)")
                counters['GAZE_COUNTER'] = 0
                return {"status": "cheat_detected", "reason": "Gaze averted (practice)"}

        else:
            counters['MULTI_FACE_COUNTER'] = 0
            counters['NO_FACE_COUNTER'] += 1
            if counters['NO_FACE_COUNTER'] >= NO_FACE_FRAMES:
                print(f"🎓 PRACTICE CHEAT DETECTED: No face detected - Student {student_id} (not uploaded)")
                counters['NO_FACE_COUNTER'] = 0
                return {"status": "cheat_detected", "reason": "No face detected (practice)"}

        # ── Object & phone detection ─────────────
        results = model(rgb, size=640)

        # phone detection
        phone_seen = False
        for *_, conf, cls in results.xyxy[0]:
            if results.names[int(cls)] == 'cell phone' and conf >= PHONE_CONF_THRESH:
                counters['PHONE_COUNTER'] += 1
                phone_seen = True
                break
        if not phone_seen:
            counters['PHONE_COUNTER'] = 0

        if counters['PHONE_COUNTER'] >= PHONE_FRAMES:
            counters['PHONE_COUNTER'] = 0
            print(f"🎓 PRACTICE CHEAT DETECTED: Cell phone - Student {student_id} (not uploaded)")
            return {"status": "cheat_detected", "reason": "Cell phone (practice)"}

        # generic objects
        found, lbl = False, None
        for *_, _, cls in results.xyxy[0]:
            if results.names[int(cls)] in OBJECT_CLASSES:
                found, lbl = True, results.names[int(cls)]
                break

        counters['OBJECT_COUNTER'] = counters['OBJECT_COUNTER']+1 if found else 0
        if counters['OBJECT_COUNTER'] >= OBJ_DET_FRAMES:
            counters['OBJECT_COUNTER'] = 0
            print(f"🎓 PRACTICE CHEAT DETECTED: Object detected - Student {student_id}, Object: {lbl} (not uploaded)")
            return {"status": "cheat_detected", "reason": f"Object detected: {lbl} (practice)"}

        # Log detection status periodically for practice
        if hasattr(process_frame_practice, '_frame_count'):
            process_frame_practice._frame_count += 1
        else:
            process_frame_practice._frame_count = 1
            
        if process_frame_practice._frame_count % 10 == 0:  # Log every 10th frame
            print(f"🎓 Practice Detection Status - Student {student_id}: Faces: {detection_status['faces_detected']}, "
                  f"Counters: NO_FACE:{counters['NO_FACE_COUNTER']}, MULTI:{counters['MULTI_FACE_COUNTER']}, "
                  f"HEAD:{counters['HEAD_TURN_COUNTER']}, GAZE:{counters['GAZE_COUNTER']}, "
                  f"PHONE:{counters['PHONE_COUNTER']}, OBJ:{counters['OBJECT_COUNTER']}")

        return {"status": "success"}
        
    except Exception as e:
        print(f"🎓 Practice frame processing error: {e}")
        return {"status": "error", "message": str(e)}

@app.route('/process_frame_practice', methods=['POST'])
def process_frame_practice_endpoint():
    """API endpoint to process a single frame for practice sessions - logs but doesn't upload clips"""
    try:
        data = request.get_json()
        raw = data.get('token')
        exam_id = data.get('exam')
        frame_data = data.get('frame')
        
        print(f"🎓 Practice frame processing request: exam_id={exam_id}")
        
        if not raw or not exam_id or not frame_data:
            return jsonify({"error": "Missing required parameters"}), 400

        # Verify it's actually a practice session
        if exam_id != 'practice':
            return jsonify({"error": "This endpoint is only for practice sessions"}), 400

        token = raw.split()[-1] if raw.startswith('Bearer ') else raw
        try:
            payload = jwt.decode(token, SECRET, algorithms=['HS256'])
            student_id = payload['userId']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        print(f"🎓 Processing practice frame for student: {student_id}")
        
        # Process frame but don't upload any clips
        result = process_frame_practice(student_id, exam_id, frame_data)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Practice frame endpoint error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/process_frame', methods=['POST'])
def process_frame_endpoint():
    """API endpoint to process a single frame"""
    try:
        data = request.get_json()
        raw = data.get('token')
        exam_id = data.get('exam')
        frame_data = data.get('frame')
        
        if not raw or not exam_id or not frame_data:
            return jsonify({"error": "Missing required parameters"}), 400

        token = raw.split()[-1] if raw.startswith('Bearer ') else raw
        try:
            payload = jwt.decode(token, SECRET, algorithms=['HS256'])
            student_id = payload['userId']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        bearer = raw if raw.startswith('Bearer ') else f"Bearer {token}"
        result = process_frame(student_id, exam_id, bearer, frame_data)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Process frame endpoint error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/status', methods=['GET'])
def status():
    """Health check endpoint"""
    return jsonify({"status": "running", "message": "AI detection server is active"})

@app.route('/cleanup_student', methods=['POST'])
def cleanup_student():
    """Clean up student data when exam ends"""
    try:
        data = request.get_json()
        raw = data.get('token')
        
        if not raw:
            return jsonify({"error": "Missing token"}), 400

        token = raw.split()[-1] if raw.startswith('Bearer ') else raw
        try:
            payload = jwt.decode(token, SECRET, algorithms=['HS256'])
            student_id = payload['userId']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        # Clean up student data
        if student_id in student_counters:
            del student_counters[student_id]
        
        # Clean up face mesh instance
        if student_id in face_mesh_instances:
            del face_mesh_instances[student_id]
        
        # Clean up cheat flags for this student
        keys_to_remove = [key for key in cheated_recently.keys() if key.startswith(f"{student_id}_")]
        for key in keys_to_remove:
            del cheated_recently[key]
            
        print(f"✅ Cleaned up data for student {student_id}")
        return jsonify({"status": "success"})
        
    except Exception as e:
        print(f"Cleanup error: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)
