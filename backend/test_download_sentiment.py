from transformers import pipeline
import torch

print("Starting manual model download (sentiment)...")
try:
    p = pipeline(
        "text-classification",
        model="cardiffnlp/twitter-xlm-roberta-base-sentiment",
        device=-1
    )
    print("Successfully downloaded/loaded sentiment model")
except Exception as e:
    print(f"Error: {e}")
