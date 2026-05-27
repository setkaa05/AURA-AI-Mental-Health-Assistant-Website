# Fine-Tuned Models Directory

This directory is used by the AURA backend to load locally fine-tuned Deep Learning models instead of downloading pretrained versions from the Hugging Face hub.

## 🧠 Fine-Tuned Emotion Model
If you have run the Google Colab fine-tuning pipeline (`aura/research/fine_tune_emotion.py`), download the resulting model weights and place them in this folder:

```text
backend/models/fine_tuned_emotion/
├── config.json
├── pytorch_model.bin / model.safetensors
├── tokenizer.json
├── tokenizer_config.json
├── special_tokens_map.json
└── vocab.txt
```

When you start the FastAPI backend, the `EmotionService` will automatically detect this directory and load your custom fine-tuned weights! If this directory does not exist, it will gracefully fallback to the pretrained `j-hartmann/emotion-english-distilroberta-base` model.
