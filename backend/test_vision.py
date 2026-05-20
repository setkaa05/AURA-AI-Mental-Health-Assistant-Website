import asyncio
import base64
from services.vision_service import vision_service
import cv2
import numpy as np

def run_test():
    # Create a dummy image (black square)
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    # encode to base64
    _, buffer = cv2.imencode('.jpg', img)
    b64 = base64.b64encode(buffer).decode('utf-8')
    
    print("Sending frame to vision service...")
    try:
        res = vision_service.analyze_frame("data:image/jpeg;base64," + b64)
        print("Result:", res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    run_test()
