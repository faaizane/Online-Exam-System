# # backend/yolo_server.py
# from flask import Flask, Response, request
# from flask_cors import CORS, cross_origin
# import cv2, torch, atexit


# app = Flask(__name__)
# CORS(app)

# # 1) YOLOv5 model load (small variant)
# model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
# model.conf = 0.5   # confidence threshold
# model.iou  = 0.45  # NMS IoU threshold

# # 2) Webcam stream khai do
# cap = cv2.VideoCapture(0)

# def gen_frames():
#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         # 3) BGR → RGB aur inference
#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = model(rgb, size=640)

#         # 4) Bounding boxes draw karo
#         for *box, conf, cls in results.xyxy[0]:
#             x1,y1,x2,y2 = map(int, box)
#             label = results.names[int(cls)]
#             cv2.rectangle(frame, (x1,y1), (x2,y2), (0,255,0), 2)
#             cv2.putText(frame, f"{label} {conf:.2f}",
#                         (x1, y1-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)

#         # 5) Encode to JPEG & MJPEG stream
#         ret, buf = cv2.imencode('.jpg', frame)
#         frame_bytes = buf.tobytes()
#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     return Response(gen_frames(),
#                     mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/shutdown', methods=['POST'])
# def shutdown():
#     # Release the camera
#     cap.release()

#     # Shut down Flask server
#     func = request.environ.get('werkzeug.server.shutdown')
#     if func:
#         func()
#     return 'Server shutting down...', 200

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, threaded=True)





# # backend/yolo_server.py
# from flask import Flask, Response, request
# from flask_cors import CORS, cross_origin
# import cv2, torch, atexit

# app = Flask(__name__)
# CORS(app)

# # 1) YOLOv5 model load (small variant)
# model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
# model.conf = 0.5   # confidence threshold
# model.iou  = 0.45  # NMS IoU threshold

# # 2) Open webcam
# cap = cv2.VideoCapture(0)

# # Ensure camera is released on process exit
# atexit.register(lambda: cap.release())

# def gen_frames():
#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         # 3) BGR → RGB for inference
#         rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = model(rgb, size=640)

#         # 4) Draw bounding boxes
#         for *box, conf, cls in results.xyxy[0]:
#             x1, y1, x2, y2 = map(int, box)
#             label = results.names[int(cls)]
#             cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
#             cv2.putText(
#                 frame,
#                 f"{label} {conf:.2f}",
#                 (x1, y1 - 10),
#                 cv2.FONT_HERSHEY_SIMPLEX,
#                 0.5,
#                 (0,255,0),
#                 1
#             )

#         # 5) Encode to JPEG & stream as MJPEG
#         ret, buf = cv2.imencode('.jpg', frame)
#         frame_bytes = buf.tobytes()
#         yield (
#             b'--frame\r\n'
#             b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
#         )

# @app.route('/video_feed')
# def video_feed():
#     return Response(
#         gen_frames(),
#         mimetype='multipart/x-mixed-replace; boundary=frame'
#     )

# # NEW: lightweight HTML wrapper so the stream auto-fits your square container
# @app.route('/camera')
# @cross_origin()
# def camera_page():
#     return """
#     <!doctype html>
#     <html>
#       <head>
#         <style>
#           html, body {
#             margin: 0; padding: 0;
#             height: 100%; overflow: hidden;
#             background: black;
#           }
#           img {
#             width: 100%;
#             height: 100%;
#             object-fit: cover;       /* fill the square, cropping as needed */
#             object-position: center; /* center the video */
#           }
#         </style>
#       </head>
#       <body>
#         <img src="/video_feed" alt="camera stream" />
#       </body>
#     </html>
#     """, 200, {'Content-Type': 'text/html'}

# # Shutdown endpoint to release camera and stop server
# @app.route('/shutdown', methods=['POST'])
# def shutdown():
#     cap.release()
#     func = request.environ.get('werkzeug.server.shutdown')
#     if func:
#         func()
#     return 'Server shutting down...', 200

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, threaded=True)




# backend/yolo_server.py
from flask import Flask, Response, request
from flask_cors import CORS, cross_origin
import cv2, torch, atexit
import numpy as np

app = Flask(__name__)
CORS(app)

# Load YOLOv5s
model = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
model.conf = 0.5
model.iou  = 0.45

# === WARMUP: run one dummy inference to JIT‐compile, load weights, etc. ===
dummy = np.zeros((640, 640, 3), dtype=np.uint8)  # single black frame
_ = model(dummy, size=640)                       # throw away the result

# Open webcam once
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

# Ensure camera is released on process exit
atexit.register(lambda: cap.release())

def gen_frames():
    # If cap was released, reopen it
    if not cap.isOpened():
        cap.open(0, cv2.CAP_DSHOW)

    while True:
        success, frame = cap.read()
        if not success:
            # read failed (maybe cap closed mid-stream) → reopen and retry
            cap.open(0, cv2.CAP_DSHOW)
            continue

        # Inference
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = model(rgb, size=640)

        # Draw boxes
        for *box, conf, cls in results.xyxy[0]:
            x1, y1, x2, y2 = map(int, box)
            label = results.names[int(cls)]
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0,255,0), 2)
            cv2.putText(
                frame,
                f"{label} {conf:.2f}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0,255,0),
                1
            )

        # MJPEG stream
        ret, buf = cv2.imencode('.jpg', frame)
        frame_bytes = buf.tobytes()
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
        )

@app.route('/video_feed')
def video_feed():
    return Response(
        gen_frames(),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

# Lightweight HTML wrapper for square, cover-fit display
@app.route('/camera')
@cross_origin()
def camera_page():
    return """
    <!doctype html>
    <html>
      <head>
        <style>
          html, body { margin:0; padding:0; height:100%; overflow:hidden; background:black; }
          img { width:100%; height:100%; object-fit:cover; object-position:center; }
        </style>
      </head>
      <body>
        <img src="/video_feed" alt="camera stream" />
      </body>
    </html>
    """, 200, {'Content-Type': 'text/html'}

# Release camera without shutting down server
@app.route('/release_camera', methods=['POST'])
def release_camera():
    try:
        if cap.isOpened():
            cap.release()
    except Exception as e:
        print('Error releasing camera:', e)
    return 'Camera released', 200

# (Optional) full server shutdown
# @app.route('/shutdown', methods=['POST'])
# def shutdown():
#     try:
#         if cap.isOpened():
#             cap.release()
#     except:
#         pass
#     func = request.environ.get('werkzeug.server.shutdown')
#     if func:
#         func()
#     return 'Server shutting down...', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
