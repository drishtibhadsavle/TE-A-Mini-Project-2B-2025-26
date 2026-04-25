from ultralytics import YOLO
import cv2
import os
import os
print(os.path.exists("runs/bookshelf-yolov8/weights/best.pt"))

# Load trained model
model = YOLO("runs/bookshelf-yolov8/weights/best.pt")


# Run inference
results = model("lib1.jpg", conf=0.15, save=True, save_txt=True, save_crop=True)


print("Detection complete. Check the runs folder.")
