# from flask import Flask, Response, request, stream_with_context
# from flask_cors import CORS
# from dotenv import load_dotenv
# import os, cv2, torch, atexit, jwt, time, threading, collections
# import numpy as np, mediapipe as mp, requests, io, imageio, math, warnings

# # ── Load .env ───────────────────────────────
# load_dotenv()
# SECRET       = os.getenv('JWT_SECRET')
# NODE_BACKEND = os.getenv('NODE_BACKEND').rstrip('/')  # ensure no trailing slash
# FFMPEG_PATH  = os.getenv('FFMPEG_PATH')

# # suppress torch.cuda.amp FutureWarning flood
# warnings.filterwarnings(
#     "ignore",
#     message=".*torch\\.cuda\\.amp\\.autocast.*",
#     category=FutureWarning
# )

# if not SECRET or not NODE_BACKEND:
#     raise RuntimeError("JWT_SECRET or NODE_BACKEND not set in .env")

# # ── Ensure FFmpeg for imageio ───────────────
# if FFMPEG_PATH and os.path.isfile(FFMPEG_PATH):
#     os.environ['PATH'] += os.pathsep + os.path.dirname(FFMPEG_PATH)
#     os.environ['IMAGEIO_FFMPEG_EXE'] = FFMPEG_PATH
# else:
#     try:
#         import imageio.plugins.ffmpeg as ffmpeg_plugin
#         ffmpeg_plugin.download()
#     except Exception:
#         print("⚠️ Warning: FFmpeg not found or auto-download failed; ensure it's on PATH.")

# app = Flask(__name__)
# CORS(app)

# # ── Load YOLO ───────────────────────────────
# model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
# model.conf, model.iou = 0.5, 0.45
# _ = model(np.zeros((640, 640, 3), dtype=np.uint8), size=640)

# # ── MediaPipe face mesh ─────────────────────
# mp_face   = mp.solutions.face_mesh
# face_mesh = mp_face.FaceMesh(
#     static_image_mode=False,
#     max_num_faces=2,
#     refine_landmarks=True,
#     min_detection_confidence=0.5
# )

# # ── Globals ─────────────────────────────────
# FRAME_BUFFER      = collections.deque(maxlen=150)
# CHEAT_LOCK        = threading.Lock()
# cheated_recently  = False
# NO_FACE_COUNTER   = 0
# HEAD_TURN_COUNTER = 0
# cap               = None

# atexit.register(lambda: cap.release() if cap and cap.isOpened() else None)

# # ── EAR Helper ──────────────────────────────
# def eye_aspect_ratio(landmarks, indices):
#     pts = [(landmarks[i].x, landmarks[i].y) for i in indices]
#     A   = math.dist(pts[0], pts[3])
#     B   = (math.dist(pts[1], pts[5]) + math.dist(pts[2], pts[4])) / 2
#     return B / A if A else 0

# # ── Head Pose Helper ────────────────────────
# def head_pose(landmarks):
#     l, r = landmarks[33], landmarks[263]
#     return math.degrees(math.atan2(r.y - l.y, r.x - l.x))

# # ── Cheat Handler ───────────────────────────
# def handle_cheat(student_id, exam_id, token_header, reason):
#     global cheated_recently
#     frames = list(FRAME_BUFFER)
#     if not frames:
#         time.sleep(10)
#         with CHEAT_LOCK:
#             cheated_recently = False
#         return

#     # write MP4 into memory buffer
#     buf    = io.BytesIO()
#     writer = imageio.get_writer(buf, format='mp4', mode='I', fps=20)
#     for frame in frames:
#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         writer.append_data(rgb)
#     writer.close()
#     buf.seek(0)
#     clip_data = buf.read()
#     buf.close()

#     try:
#         # 1) upload clip
#         resp1 = requests.post(
#             f'{NODE_BACKEND}/api/cheats',
#             files={'clip': ('cheat.mp4', clip_data, 'video/mp4')},
#             data={'studentId': student_id, 'examId': exam_id, 'reason': reason},
#             headers={'Authorization': token_header},
#             timeout=10
#         )
#         print(f"[handle_cheat] POST /api/cheats → {resp1.status_code}", resp1.text)

#         # 2) force‐submit exam
#         resp2 = requests.post(
#             f'{NODE_BACKEND}/api/exams/{exam_id}/submit-cheat',
#             json={'studentId': student_id},
#             headers={'Authorization': token_header},
#             timeout=10
#         )
#         print(f"[handle_cheat] POST /api/exams/{exam_id}/submit-cheat → {resp2.status_code}", resp2.text)

#     except Exception as e:
#         print("❌ Cheat upload/submit error:", e)

#     finally:
#         time.sleep(10)
#         with CHEAT_LOCK:
#             cheated_recently = False

# # ── Frame Stream Generator ──────────────────
# def gen_frames(student_id, exam_id, token_header):
#     global cap, cheated_recently, NO_FACE_COUNTER, HEAD_TURN_COUNTER
#     try:
#         if not cap or not cap.isOpened():
#             cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
#         while True:
#             ret, frame = cap.read()
#             if not ret:
#                 cap.release()
#                 break
#             FRAME_BUFFER.append(frame.copy())
#             rgb    = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             mp_res = face_mesh.process(rgb)

#             # face checks
#             if mp_res.multi_face_landmarks:
#                 NO_FACE_COUNTER = 0
#                 # multiple faces
#                 if len(mp_res.multi_face_landmarks) > 1 and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "Multiple faces detected"),
#                         daemon=True).start()
#                 lm = mp_res.multi_face_landmarks[0].landmark
#                 # eyes closed
#                 if (eye_aspect_ratio(lm, [33,160,158,133,153,144]) < 0.2 or
#                     eye_aspect_ratio(lm, [263,387,385,362,380,373]) < 0.2) and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "Eyes closed"),
#                         daemon=True).start()
#                 # head turned
#                 angle = head_pose(lm)
#                 if abs(angle) > 35:
#                     HEAD_TURN_COUNTER += 1
#                     if HEAD_TURN_COUNTER >= 30 and not cheated_recently:
#                         cheated_recently = True
#                         threading.Thread(target=handle_cheat,
#                             args=(student_id, exam_id, token_header, "Head turned away"),
#                             daemon=True).start()
#                         HEAD_TURN_COUNTER = 0
#                 else:
#                     HEAD_TURN_COUNTER = 0

#             else:
#                 NO_FACE_COUNTER += 1
#                 if NO_FACE_COUNTER >= 60 and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "No face detected"),
#                         daemon=True).start()
#                     NO_FACE_COUNTER = 0

#             # object detection only triggers cheat, no boxes
#             results = model(rgb, size=640)
#             for *_, cls in results.xyxy[0]:
#                 lbl = results.names[int(cls)]
#                 if lbl in ['cell phone','book','laptop','tv','remote'] and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(target=handle_cheat,
#                         args=(student_id, exam_id, token_header, f"Object detected: {lbl}"),
#                         daemon=True).start()

#             # stream frame
#             _, jpg = cv2.imencode('.jpg', frame)
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + jpg.tobytes() + b'\r\n')
#     except GeneratorExit:
#         print("Client disconnected — releasing camera")
#     except Exception as e:
#         print("Stream error:", e)
#     finally:
#         if cap and cap.isOpened():
#             cap.release()

# # ── Video Feed ──────────────────────────────
# @app.route('/video_feed')
# def video_feed():
#     raw = request.args.get('token')
#     exam_id = request.args.get('exam')
#     if not raw or not exam_id:
#         return "Missing params", 400
#     token = raw.split()[-1]
#     try:
#         payload    = jwt.decode(token, SECRET, algorithms=['HS256'])
#         student_id = payload['userId']
#     except jwt.ExpiredSignatureError:
#         return "Token expired", 401
#     except:
#         return "Invalid token", 401
#     bearer = raw if raw.startswith('Bearer ') else f"Bearer {token}"
#     return Response(
#         stream_with_context(gen_frames(student_id, exam_id, bearer)),
#         mimetype='multipart/x-mixed-replace; boundary=frame'
#     )

# # ── Release Camera ─────────────────────────
# @app.route('/release_camera', methods=['POST'])
# def release_camera():
#     global cap
#     if cap and cap.isOpened():
#         cap.release()
#         print("✅ Camera released via API")
#     return 'OK', 200

# # ── Run ─────────────────────────────────────
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5001, threaded=True)











# from flask import Flask, Response, request, stream_with_context
# from flask_cors import CORS
# from dotenv import load_dotenv
# import os, cv2, torch, atexit, jwt, time, threading, collections
# import numpy as np, mediapipe as mp, requests, io, imageio, math, warnings

# # ── Load .env ───────────────────────────────
# load_dotenv()
# SECRET       = os.getenv('JWT_SECRET')
# NODE_BACKEND = os.getenv('NODE_BACKEND', '').rstrip('/')  # ensure no trailing slash
# FFMPEG_PATH  = os.getenv('FFMPEG_PATH')

# if not SECRET or not NODE_BACKEND:
#     raise RuntimeError("JWT_SECRET or NODE_BACKEND not set in .env")

# warnings.filterwarnings(
#     "ignore",
#     message=".*torch\\.cuda\\.amp\\.autocast.*",
#     category=FutureWarning
# )

# # ── Ensure FFmpeg for imageio ───────────────
# if FFMPEG_PATH and os.path.isfile(FFMPEG_PATH):
#     os.environ['PATH'] += os.pathsep + os.path.dirname(FFMPEG_PATH)
#     os.environ['IMAGEIO_FFMPEG_EXE'] = FFMPEG_PATH
# else:
#     try:
#         import imageio.plugins.ffmpeg as ffmpeg_plugin
#         ffmpeg_plugin.download()
#     except Exception:
#         print("⚠️ Warning: FFmpeg not found or auto-download failed; ensure it's on PATH.")

# app = Flask(__name__)
# CORS(app)

# # ── Load YOLOv5 ─────────────────────────────
# model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
# model.conf, model.iou = 0.5, 0.45
# _ = model(np.zeros((640, 640, 3), dtype=np.uint8), size=640)

# # ── MediaPipe Face Mesh ─────────────────────
# mp_face   = mp.solutions.face_mesh
# face_mesh = mp_face.FaceMesh(
#     static_image_mode=False,
#     max_num_faces=2,
#     refine_landmarks=True,
#     min_detection_confidence=0.5
# )

# # ── Globals & thresholds ────────────────────
# FRAME_BUFFER       = collections.deque(maxlen=150)
# CHEAT_LOCK         = threading.Lock()
# cheated_recently   = False
# NO_FACE_COUNTER    = 0
# HEAD_TURN_COUNTER  = 0
# OBJECT_COUNTER     = 0
# GAZE_COUNTER       = 0
# cap                = None

# NO_FACE_FRAMES    = 60
# HEAD_TURN_FRAMES  = 60
# HEAD_TURN_ANGLE   = 45
# OBJ_DET_FRAMES    = 20
# GAZE_FRAMES       = 30
# GAZE_RATIO_MIN    = 0.3
# GAZE_RATIO_MAX    = 0.7
# OBJECT_CLASSES    = ['cell phone', 'laptop', 'book', 'tablet', 'remote']

# atexit.register(lambda: cap.release() if cap and cap.isOpened() else None)

# def head_pose(landmarks):
#     l, r = landmarks[33], landmarks[263]
#     return math.degrees(math.atan2(r.y - l.y, r.x - l.x))

# def handle_cheat(student_id, exam_id, token_header, reason):
#     global cheated_recently
#     frames = list(FRAME_BUFFER)
#     if not frames:
#         time.sleep(10)
#         with CHEAT_LOCK:
#             cheated_recently = False
#         return

#     buf    = io.BytesIO()
#     writer = imageio.get_writer(buf, format='mp4', mode='I', fps=20)
#     for frame in frames:
#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         writer.append_data(rgb)
#     writer.close()
#     buf.seek(0)
#     clip_data = buf.read()
#     buf.close()

#     try:
#         # 1) upload clip only
#         resp = requests.post(
#             f'{NODE_BACKEND}/api/cheats',
#             files={'clip': ('cheat.mp4', clip_data, 'video/mp4')},
#             data={'studentId': student_id, 'examId': exam_id, 'reason': reason},
#             headers={'Authorization': token_header},
#             timeout=10
#         )
#         print(f"[handle_cheat] POST /api/cheats → {resp.status_code}", resp.text)

#     except Exception as e:
#         print("❌ Cheat upload error:", e)

#     finally:
#         time.sleep(10)
#         with CHEAT_LOCK:
#             cheated_recently = False

# def gen_frames(student_id, exam_id, token_header):
#     global cap, cheated_recently
#     global NO_FACE_COUNTER, HEAD_TURN_COUNTER, OBJECT_COUNTER, GAZE_COUNTER

#     if not cap or not cap.isOpened():
#         cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

#     try:
#         while True:
#             ret, frame = cap.read()
#             if not ret:
#                 cap.release()
#                 break

#             FRAME_BUFFER.append(frame.copy())
#             rgb    = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             mp_res = face_mesh.process(rgb)

#             # Face checks
#             if mp_res.multi_face_landmarks:
#                 NO_FACE_COUNTER = 0

#                 if len(mp_res.multi_face_landmarks) > 1 and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(
#                         target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "Multiple faces detected"),
#                         daemon=True
#                     ).start()

#                 lm = mp_res.multi_face_landmarks[0].landmark

#                 # Head-turn
#                 angle = head_pose(lm)
#                 if abs(angle) > HEAD_TURN_ANGLE:
#                     HEAD_TURN_COUNTER += 1
#                 else:
#                     HEAD_TURN_COUNTER = 0

#                 if HEAD_TURN_COUNTER >= HEAD_TURN_FRAMES and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(
#                         target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "Head turned away"),
#                         daemon=True
#                     ).start()
#                     HEAD_TURN_COUNTER = 0

#                 # Gaze-aversion
#                 iris_pts    = [lm[i] for i in (468, 469, 470, 471)]
#                 left_x      = min(p.x for p in iris_pts)
#                 right_x     = max(p.x for p in iris_pts)
#                 corner_left = lm[33].x
#                 corner_right= lm[133].x
#                 center      = (left_x + right_x) / 2
#                 gaze_ratio  = (center - corner_left) / (corner_right - corner_left) if corner_right>corner_left else 0.5

#                 if gaze_ratio < GAZE_RATIO_MIN or gaze_ratio > GAZE_RATIO_MAX:
#                     GAZE_COUNTER += 1
#                 else:
#                     GAZE_COUNTER = 0

#                 if GAZE_COUNTER >= GAZE_FRAMES and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(
#                         target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "Gaze averted"),
#                         daemon=True
#                     ).start()
#                     GAZE_COUNTER = 0

#             else:
#                 NO_FACE_COUNTER += 1
#                 if NO_FACE_COUNTER >= NO_FACE_FRAMES and not cheated_recently:
#                     cheated_recently = True
#                     threading.Thread(
#                         target=handle_cheat,
#                         args=(student_id, exam_id, token_header, "No face detected"),
#                         daemon=True
#                     ).start()
#                     NO_FACE_COUNTER = 0

#             # Object detection
#             results = model(rgb, size=640)
#             found   = False
#             for *_, cls in results.xyxy[0]:
#                 lbl = results.names[int(cls)]
#                 if lbl in OBJECT_CLASSES:
#                     found   = True
#                     last_lbl= lbl
#                     break

#             if found:
#                 OBJECT_COUNTER += 1
#             else:
#                 OBJECT_COUNTER = 0

#             if OBJECT_COUNTER >= OBJ_DET_FRAMES and not cheated_recently:
#                 cheated_recently = True
#                 threading.Thread(
#                     target=handle_cheat,
#                     args=(student_id, exam_id, token_header, f"Object detected: {last_lbl}"),
#                     daemon=True
#                 ).start()
#                 OBJECT_COUNTER = 0

#             # Stream frame
#             _, jpg = cv2.imencode('.jpg', frame)
#             yield (b'--frame\r\n'
#                    b'Content-Type: image/jpeg\r\n\r\n' + jpg.tobytes() + b'\r\n')

#     except GeneratorExit:
#         print("Client disconnected — releasing camera")
#     except Exception as e:
#         print("Stream error:", e)
#     finally:
#         if cap and cap.isOpened():
#             cap.release()

# @app.route('/video_feed')
# def video_feed():
#     raw     = request.args.get('token')
#     exam_id = request.args.get('exam')
#     if not raw or not exam_id:
#         return "Missing params", 400

#     token = raw.split()[-1]
#     try:
#         payload    = jwt.decode(token, SECRET, algorithms=['HS256'])
#         student_id = payload['userId']
#     except jwt.ExpiredSignatureError:
#         return "Token expired", 401
#     except:
#         return "Invalid token", 401

#     bearer = raw if raw.startswith('Bearer ') else f"Bearer {token}"
#     return Response(
#         stream_with_context(gen_frames(student_id, exam_id, bearer)),
#         mimetype='multipart/x-mixed-replace; boundary=frame'
#     )

# @app.route('/release_camera', methods=['POST'])
# def release_camera():
#     global cap
#     if cap and cap.isOpened():
#         cap.release()
#         print("✅ Camera released via API")
#     return 'OK', 200

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5001, threaded=True)








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

# ── Globals & thresholds ────────────────────
FRAME_BUFFER       = collections.deque(maxlen=150)
CHEAT_LOCK         = threading.Lock()
cheated_recently   = False
NO_FACE_COUNTER    = 0
HEAD_TURN_COUNTER  = 0
OBJECT_COUNTER     = 0
GAZE_COUNTER       = 0
cap                = None

# thresholds
NO_FACE_FRAMES    = 60      # no face for ≥60 frames
HEAD_TURN_FRAMES  = 60      # head-turn for ≥60 frames
HEAD_TURN_ANGLE   = 45      # flag if |angle| >45°
OBJ_DET_FRAMES    = 20      # generic objects for ≥20 frames
GAZE_FRAMES       = 30      # gaze-aversion for ≥30 frames
GAZE_RATIO_MIN    = 0.3
GAZE_RATIO_MAX    = 0.7
OBJECT_CLASSES    = ['laptop', 'book', 'tablet', 'remote']  # phone handled specially

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
    global NO_FACE_COUNTER, HEAD_TURN_COUNTER, OBJECT_COUNTER, GAZE_COUNTER

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

            # ── Face checks ────────────────────────────
            if mp_res.multi_face_landmarks:
                NO_FACE_COUNTER = 0

                # multiple faces
                if len(mp_res.multi_face_landmarks) > 1 and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "Multiple faces detected"),
                        daemon=True
                    ).start()

                lm = mp_res.multi_face_landmarks[0].landmark

                # head-turn
                angle = head_pose(lm)
                if abs(angle) > HEAD_TURN_ANGLE:
                    HEAD_TURN_COUNTER += 1
                else:
                    HEAD_TURN_COUNTER = 0

                if HEAD_TURN_COUNTER >= HEAD_TURN_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "Head turned away"),
                        daemon=True
                    ).start()
                    HEAD_TURN_COUNTER = 0

                # gaze-aversion
                iris_pts    = [lm[i] for i in (468, 469, 470, 471)]
                left_x      = min(p.x for p in iris_pts)
                right_x     = max(p.x for p in iris_pts)
                corner_left = lm[33].x
                corner_right= lm[133].x
                center      = (left_x + right_x) / 2
                gaze_ratio  = (center - corner_left) / (corner_right - corner_left) if corner_right>corner_left else 0.5

                if gaze_ratio < GAZE_RATIO_MIN or gaze_ratio > GAZE_RATIO_MAX:
                    GAZE_COUNTER += 1
                else:
                    GAZE_COUNTER = 0

                if GAZE_COUNTER >= GAZE_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "Gaze averted"),
                        daemon=True
                    ).start()
                    GAZE_COUNTER = 0

            else:
                NO_FACE_COUNTER += 1
                if NO_FACE_COUNTER >= NO_FACE_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, "No face detected"),
                        daemon=True
                    ).start()
                    NO_FACE_COUNTER = 0

            # ── Object detection with immediate phone flag ─────────
            results = model(rgb, size=640)
            immediate_phone = False
            found_generic   = False
            last_lbl        = None

            for *_, cls in results.xyxy[0]:
                lbl = results.names[int(cls)]
                if lbl == 'cell phone' and not cheated_recently:
                    # immediate flag on phone
                    cheated_recently = True
                    immediate_phone = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, f"Object detected: {lbl}"),
                        daemon=True
                    ).start()
                    break
                if lbl in OBJECT_CLASSES:
                    found_generic = True
                    last_lbl = lbl

            if not immediate_phone:
                if found_generic:
                    OBJECT_COUNTER += 1
                else:
                    OBJECT_COUNTER = 0

                if OBJECT_COUNTER >= OBJ_DET_FRAMES and not cheated_recently:
                    cheated_recently = True
                    threading.Thread(
                        target=handle_cheat,
                        args=(student_id, exam_id, token_header, f"Object detected: {last_lbl}"),
                        daemon=True
                    ).start()
                    OBJECT_COUNTER = 0

            # ── Stream frame ───────────────────────────
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
