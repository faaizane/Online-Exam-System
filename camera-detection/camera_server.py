from flask import Flask, Response, request, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
import os, cv2, torch, atexit, jwt, time, threading, collections
import numpy as np, mediapipe as mp, requests, io, imageio, math, warnings

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
face_mesh = mp_face.FaceMesh(
    static_image_mode=False,
    max_num_faces=2,
    refine_landmarks=True,
    min_detection_confidence=0.5
)

# ── Globals & counters ──────────────────────
FRAME_BUFFER         = collections.deque(maxlen=150)
CHEAT_LOCK           = threading.Lock()
cheated_recently     = False

NO_FACE_COUNTER      = 0
MULTI_FACE_COUNTER   = 0
HEAD_TURN_COUNTER    = 0
GAZE_COUNTER         = 0
OBJECT_COUNTER       = 0
PHONE_COUNTER        = 0

cap                  = None

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

atexit.register(lambda: cap.release() if cap and cap.isOpened() else None)

def head_pose(landmarks):
    l, r = landmarks[33], landmarks[263]
    return math.degrees(math.atan2(r.y - l.y, r.x - l.x))

def handle_cheat(student_id, exam_id, token_header, reason):
    global cheated_recently
    frames = list(FRAME_BUFFER)
    if not frames:
        time.sleep(10)
        with CHEAT_LOCK:
            cheated_recently = False
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
        resp = requests.post(
            f'{NODE_BACKEND}/api/cheats',
            files={'clip': ('cheat.mp4', clip_data, 'video/mp4')},
            data={'studentId': student_id, 'examId': exam_id, 'reason': reason},
            headers={'Authorization': token_header},
            timeout=10
        )
        print(f"[handle_cheat] POST /api/cheats → {resp.status_code}", resp.text)
    except Exception as e:
        print("❌ Cheat upload error:", e)
    finally:
        time.sleep(10)
        with CHEAT_LOCK:
            cheated_recently = False

def gen_frames(student_id, exam_id, token_header):
    global cap, cheated_recently
    global NO_FACE_COUNTER, MULTI_FACE_COUNTER, HEAD_TURN_COUNTER
    global GAZE_COUNTER, OBJECT_COUNTER, PHONE_COUNTER

    if not cap or not cap.isOpened():
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                cap.release()
                break

            FRAME_BUFFER.append(frame.copy())
            rgb    = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_res = face_mesh.process(rgb)

            # ── Face checks ────────────────────────
            if mp_res.multi_face_landmarks:
                NO_FACE_COUNTER = 0

                # multiple faces debounce
                if len(mp_res.multi_face_landmarks) > 1:
                    MULTI_FACE_COUNTER += 1
                else:
                    MULTI_FACE_COUNTER = 0

                if MULTI_FACE_COUNTER >= MULTI_FACE_FRAMES and not cheated_recently:
                    cheated_recently    = True
                    MULTI_FACE_COUNTER  = 0
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "Multiple faces detected"),
                        daemon=True
                    ).start()

                # single-face head-turn & gaze
                lm = mp_res.multi_face_landmarks[0].landmark
                angle = head_pose(lm)
                HEAD_TURN_COUNTER = HEAD_TURN_COUNTER + 1 if abs(angle) > HEAD_TURN_ANGLE else 0
                if HEAD_TURN_COUNTER >= HEAD_TURN_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "Head turned away"),
                        daemon=True
                    ).start()
                    HEAD_TURN_COUNTER = 0

                iris = [lm[i] for i in (468,469,470,471)]
                left_x, right_x = min(p.x for p in iris), max(p.x for p in iris)
                ratio = ((left_x+right_x)/2 - lm[33].x) / (lm[133].x - lm[33].x + 1e-6)
                GAZE_COUNTER = GAZE_COUNTER+1 if (ratio<GAZE_RATIO_MIN or ratio>GAZE_RATIO_MAX) else 0
                if GAZE_COUNTER >= GAZE_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "Gaze averted"),
                        daemon=True
                    ).start()
                    GAZE_COUNTER = 0

            else:
                MULTI_FACE_COUNTER = 0
                NO_FACE_COUNTER  += 1
                if NO_FACE_COUNTER >= NO_FACE_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "No face detected"),
                        daemon=True
                    ).start()
                    NO_FACE_COUNTER = 0

            # ── Object & phone detection ─────────────
            results = model(rgb, size=640)

            # phone debounce + confidence
            phone_seen = False
            for *_, conf, cls in results.xyxy[0]:
                if results.names[int(cls)] == 'cell phone' and conf >= PHONE_CONF_THRESH:
                    PHONE_COUNTER += 1
                    phone_seen    = True
                    break
            if not phone_seen:
                PHONE_COUNTER = 0

            if PHONE_COUNTER >= PHONE_FRAMES and not cheated_recently:
                cheated_recently = True
                PHONE_COUNTER     = 0
                threading.Thread(
                    target=handle_cheat,
                    args=(student_id, exam_id, token_header, "Cell phone"),
                    daemon=True
                ).start()
                continue  # skip generic this frame

            # generic objects
            found, lbl = False, None
            for *_, _, cls in results.xyxy[0]:
                if results.names[int(cls)] in OBJECT_CLASSES:
                    found, lbl = True, results.names[int(cls)]
                    break

            OBJECT_COUNTER = OBJECT_COUNTER+1 if found else 0
            if OBJECT_COUNTER >= OBJ_DET_FRAMES and not cheated_recently:
                cheated_recently = True
                OBJECT_COUNTER    = 0
                threading.Thread(
                    target=handle_cheat,
                    args=(student_id, exam_id, token_header, lbl.capitalize()),
                    daemon=True
                ).start()

            # ── Stream frame ─────────────────────────
            _, jpg = cv2.imencode('.jpg', frame)
            yield (
                b'--frame\r\n'
                b'Content-Type: image/jpeg\r\n\r\n' +
                jpg.tobytes() +
                b'\r\n'
            )

    except GeneratorExit:
        print("Client disconnected — releasing camera")
    except Exception as e:
        print("Stream error:", e)
    finally:
        if cap and cap.isOpened():
            cap.release()

@app.route('/video_feed')
def video_feed():
    raw     = request.args.get('token')
    exam_id = request.args.get('exam')
    if not raw or not exam_id:
        return "Missing params", 400

    token = raw.split()[-1]
    try:
        payload    = jwt.decode(token, SECRET, algorithms=['HS256'])
        student_id = payload['userId']
    except jwt.ExpiredSignatureError:
        return "Token expired", 401
    except:
        return "Invalid token", 401

    bearer = raw if raw.startswith('Bearer ') else f"Bearer {token}"
    return Response(
        stream_with_context(gen_frames(student_id, exam_id, bearer)),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/release_camera', methods=['POST'])
def release_camera():
    global cap
    if cap and cap.isOpened():
        cap.release()
        print("✅ Camera released via API")
    return 'OK', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)
