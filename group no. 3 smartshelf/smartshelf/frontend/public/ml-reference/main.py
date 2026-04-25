# ML Reference — Python FastAPI service for book detection
# Save as ml-reference/main.py

import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import time
import os

app = FastAPI(title="SmartShelf ML Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Load YOLO model
model = None
ocr = None

def load_models():
    global model, ocr
    from ultralytics import YOLO
    from paddleocr import PaddleOCR
    
    model_path = os.path.join(os.path.dirname(__file__), "models", "best.pt")
    if os.path.exists(model_path):
        model = YOLO(model_path)
        print(f"YOLO model loaded from {model_path}")
    else:
        print(f"WARNING: Model not found at {model_path}. Place best.pt there.")
    
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    print("PaddleOCR loaded")

@app.on_event("startup")
async def startup():
    load_models()

@app.post("/detect")
async def detect_books(file: UploadFile = File(...)):
    if model is None:
        return {"error": "YOLO model not loaded. Place best.pt in models/ folder.", "total_detected": 0, "books": []}
    
    start_time = time.time()
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model(img)
    detections = []
    
    for i, box in enumerate(results[0].boxes.xyxy):
        book_start = time.time()
        x1, y1, x2, y2 = map(int, box)
        crop = img[y1:y2, x1:x2]
        
        # OCR
        text = ""
        if ocr is not None:
            ocr_result = ocr.ocr(crop, cls=True)
            if ocr_result and ocr_result[0]:
                text = " ".join([line[1][0] for line in ocr_result[0]])
        
        detections.append({
            "id": i + 1,
            "extracted_text": text,
            "time_taken": round(time.time() - book_start, 2),
            "bbox": [x1, y1, x2, y2]
        })
    
    return {
        "total_detected": len(detections),
        "books": detections,
        "total_time": round(time.time() - start_time, 2)
    }

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None}
