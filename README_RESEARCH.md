# AURA: Deep Learning Research Module

This directory contains the necessary components to transition AURA from using generalized pretrained models to custom fine-tuned transformer models.

## 📂 Project Structure
```text
aura/
├── backend/
│   ├── models/
│   │   └── fine_tuned_emotion/  <-- Place generated model weights here
│   └── services/
│       └── emotion_service.py   <-- Modified to load local weights
├── research/
│   ├── fine_tune_emotion.py     <-- Colab Training Pipeline
│   ├── requirements_research.txt<-- Colab Dependencies
│   ├── methodology.md           <-- Academic Architecture & Paper details
│   └── defense_viva.md          <-- Faculty Q&A preparation
└── README_RESEARCH.md           <-- This file
```

## 🚀 Step 1: Model Training (Google Colab)
Because fine-tuning a transformer model requires a GPU, you must run the training script in Google Colab (or a local GPU environment).

1. Open [Google Colab](https://colab.research.google.com/).
2. Create a new notebook and set the Runtime to **GPU** (T4 or V100).
3. Upload `research/fine_tune_emotion.py` and `research/requirements_research.txt` to the Colab environment.
4. Run the following cells in Colab:
   ```bash
   !pip install -r requirements_research.txt
   !python fine_tune_emotion.py
   ```
5. The script will download the GoEmotions dataset, process it, train the model, and generate evaluation plots.
6. Once completed, zip the output directory:
   ```bash
   !zip -r fine_tuned_aura_emotion.zip results/fine_tuned_aura_emotion
   ```
7. Download the zip file to your local machine.

## 📥 Step 2: Deployment (Local Backend)
1. Extract the downloaded zip file.
2. Place the contents of `results/fine_tuned_aura_emotion/` into `aura/backend/models/fine_tuned_emotion/`.
   - Ensure `config.json` and `model.safetensors` (or `pytorch_model.bin`) are directly inside `fine_tuned_emotion/`.
3. Start the FastAPI backend:
   ```bash
   cd aura/backend
   source venv/Scripts/activate
   uvicorn main:app --reload
   ```
4. The server logs will now state: `Loading local fine-tuned model from models/fine_tuned_emotion…`

## 📊 Academic Artifacts
The training script automatically generates:
- `results/plots/confusion_matrix.png`
- `results/plots/loss_curves.png`
- `results/plots/classification_report.txt`

Include these directly in your thesis/project report alongside the text provided in `research/methodology.md`.
