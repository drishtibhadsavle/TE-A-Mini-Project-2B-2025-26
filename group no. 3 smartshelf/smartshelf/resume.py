from ultralytics import YOLO
model=YOLO("runs/bookshelf-yolov8/weights/last.pt")
model.train(resume=True)