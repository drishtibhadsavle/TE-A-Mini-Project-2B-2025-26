import cv2
import json
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en')

# Test from file path
res_path = ocr.ocr('debug_crops/book_1.jpg')

# Test from numpy array (cv2 BGR, which is what the server does)
img_bgr = cv2.imread('debug_crops/book_1.jpg')
res_bgr = ocr.ocr(img_bgr)

# Test from numpy array RGB
img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
res_rgb = ocr.ocr(img_rgb)

def simplify(res):
    output = []
    if res and res[0]:
        for line in res[0]:
            try:
                coords, (text, conf) = line
                output.append(text)
            except Exception as e:
                output.append("ERROR_PARSING: " + str(line))
    return output

out = {
    'path_ocr': simplify(res_path),
    'bgr_ocr': simplify(res_bgr),
    'rgb_ocr': simplify(res_rgb),
    'raw_bgr': str(res_bgr)
}

with open('ocr_debug_out.json', 'w') as f:
    json.dump(out, f, indent=2)
