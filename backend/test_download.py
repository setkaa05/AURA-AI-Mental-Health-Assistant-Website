from transformers import pipeline
import torch

print("Starting manual model download...")
try:
    p = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        device=-1
    )
    print("Successfully downloaded/loaded emotion model")
except Exception as e:
    print(f"Error: {e}")
