import os
import cv2
import time
import numpy as np
from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
from paddleocr import PaddleOCR
import io
from PIL import Image

app = FastAPI()

# Load YOLOv8 model - ensure path is correct regardless of CWD
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, "models", "best.pt")
model = YOLO(MODEL_PATH)

# Initialize PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')

@app.get("/")
async def root():
    return {"message": "SmartShelf ML Service is running. Use POST /detect-books to detect books."}

@app.post("/detect-books")
async def detect_books(file: UploadFile = File(...)):
    start_time = time.time()
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return {"error": "Invalid image format"}

        # Run YOLO detection
        results = model(image, conf=0.25)
        
        books = []
        book_count: int = 0
        
        # Process detections
        for r in results:
            boxes = r.boxes
            for i, box in enumerate(boxes, start=1):
                book_count = i
                book_start = time.time()
                
                # Get coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                
                # Crop the book - ensure coordinates are within image bounds
                h, w = image.shape[:2]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                crop = image[y1:y2, x1:x2]
                
                if crop.size == 0:
                    continue
                
                # Debug: save cropped images
                os.makedirs("debug_crops", exist_ok=True)
                cv2.imwrite(f"debug_crops/book_{book_count}.jpg", crop)
                    
                # OCR on the crop
                ocr_result = ocr.ocr(crop)
                
                extracted_text = ""
                if ocr_result and len(ocr_result) > 0:
                    res_obj = ocr_result[0]
                    if isinstance(res_obj, dict) and 'rec_texts' in res_obj:
                        # PaddleX / newer PaddleOCR format
                        texts = [str(t) for t in res_obj['rec_texts'] if t]
                        extracted_text = " ".join(texts)
                    else:
                        # Older format [[[box], [text, conf]], ...]
                        try:
                            lines = [line[1][0] for line in ocr_result[0]]
                            extracted_text = " ".join(lines)
                        except Exception:
                            pass
                
                book_end = time.time()
                processing_time = f"{book_end - book_start:.2f}s"
                
                books.append({
                    "book_number": book_count,
                    "extracted_text": extracted_text.strip() or "Unknown Title",
                    "confidence": float(box.conf[0]),
                    "processing_time": processing_time
                })
                
        total_processing_time = f"{time.time() - start_time:.2f}s"
        
        return {
            "total_books_detected": book_count,
            "books": books,
            "total_processing_time": total_processing_time
        }
    except Exception as e:
        import traceback
        with open("error_log.txt", "a") as f:
            f.write(f"Error at {time.ctime()}:\n{traceback.format_exc()}\n")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
