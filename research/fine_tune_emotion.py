import os
import numpy as np
import torch
from torch import nn
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    EarlyStoppingCallback
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix, classification_report
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any

# ==========================================
# 1. Configuration & Hyperparameters
# ==========================================
MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"
OUTPUT_DIR = "./results/fine_tuned_aura_emotion"
LOG_DIR = "./logs"
MAX_LENGTH = 128
BATCH_SIZE = 32
EPOCHS = 3
LEARNING_RATE = 2e-5

# AURA Core Emotions
AURA_EMOTIONS = ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"]

# GoEmotions mapping to AURA emotions
# GoEmotions has 28 classes. We map them to our 7 core categories.
GOEMOTIONS_MAPPING = {
    "anger": "anger", "annoyance": "anger", "disapproval": "anger",
    "disgust": "disgust",
    "fear": "fear", "nervousness": "fear",
    "joy": "joy", "amusement": "joy", "approval": "joy", "caring": "joy", 
    "desire": "joy", "excitement": "joy", "gratitude": "joy", "love": "joy", 
    "optimism": "joy", "pride": "joy", "relief": "joy",
    "neutral": "neutral", "realization": "neutral", "curiosity": "neutral", "confusion": "neutral",
    "sadness": "sadness", "disappointment": "sadness", "grief": "sadness", "remorse": "sadness",
    "surprise": "surprise"
}

# ==========================================
# 2. Data Preparation
# ==========================================
def load_and_prepare_data():
    """Loads GoEmotions, maps labels to AURA format, and splits the dataset."""
    print("Loading GoEmotions dataset...")
    dataset = load_dataset("go_emotions", "simplified")
    
    # Get original labels list
    labels_list = dataset["train"].features["labels"].feature.names
    
    # Create mapping from GoEmotions ID to AURA ID
    aura_label_to_id = {label: idx for idx, label in enumerate(AURA_EMOTIONS)}
    id_to_aura_label = {idx: label for label, idx in aura_label_to_id.items()}
    
    def map_labels(example):
        # GoEmotions can have multiple labels. We take the first one for simplicity in this pipeline,
        # or map all and take the most dominant AURA class.
        orig_label_ids = example['labels']
        if not orig_label_ids:
            return {"label": aura_label_to_id["neutral"]} # Default
        
        # Get the first original label string
        orig_label_str = labels_list[orig_label_ids[0]]
        
        # Map to AURA label, fallback to neutral if not in mapping
        aura_label_str = GOEMOTIONS_MAPPING.get(orig_label_str, "neutral")
        
        return {"label": aura_label_to_id[aura_label_str]}

    print("Mapping labels to AURA core emotions...")
    mapped_dataset = dataset.map(map_labels, remove_columns=["labels", "id"])
    
    # Filter out empty text
    mapped_dataset = mapped_dataset.filter(lambda x: len(x["text"].strip()) > 0)
    
    return mapped_dataset, aura_label_to_id, id_to_aura_label

def tokenize_dataset(dataset, tokenizer):
    """Tokenizes the text features."""
    print("Tokenizing dataset...")
    def tokenize_function(examples):
        return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=MAX_LENGTH)
    
    tokenized_datasets = dataset.map(tokenize_function, batched=True)
    return tokenized_datasets

# ==========================================
# 3. Custom Trainer for Class Weights
# ==========================================
class WeightedLossTrainer(Trainer):
    def __init__(self, *args, class_weights=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.class_weights = class_weights

    def compute_loss(self, model, inputs, return_outputs=False, num_items_in_batch=None):
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits
        
        # CrossEntropyLoss with weights to handle class imbalance
        loss_fct = nn.CrossEntropyLoss(weight=self.class_weights)
        loss = loss_fct(logits.view(-1, self.model.config.num_labels), labels.view(-1))
        
        return (loss, outputs) if return_outputs else loss

# ==========================================
# 4. Evaluation & Metrics
# ==========================================
def compute_metrics(eval_pred):
    """Calculates accuracy, precision, recall, and F1."""
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(labels, predictions, average='weighted')
    acc = accuracy_score(labels, predictions)
    
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def plot_confusion_matrix(y_true, y_pred, labels, output_path):
    """Generates and saves a confusion matrix plot."""
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=labels, yticklabels=labels)
    plt.title('Emotion Classification Confusion Matrix')
    plt.ylabel('Actual Emotion')
    plt.xlabel('Predicted Emotion')
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()
    print(f"Confusion matrix saved to {output_path}")

def plot_loss_curves(trainer, output_path):
    """Plots training and validation loss from trainer state."""
    log_history = trainer.state.log_history
    train_loss = [log['loss'] for log in log_history if 'loss' in log]
    eval_loss = [log['eval_loss'] for log in log_history if 'eval_loss' in log]
    
    plt.figure(figsize=(10, 6))
    if train_loss:
        plt.plot(train_loss, label='Training Loss')
    if eval_loss:
        # Align eval loss with training steps roughly
        steps = [log['step'] for log in log_history if 'eval_loss' in log]
        plt.plot(steps, eval_loss, label='Validation Loss', marker='o')
    
    plt.title('Training and Validation Loss Over Time')
    plt.xlabel('Steps')
    plt.ylabel('Loss')
    plt.legend()
    plt.grid(True)
    plt.savefig(output_path)
    plt.close()
    print(f"Loss curves saved to {output_path}")

# ==========================================
# 5. Main Execution Pipeline
# ==========================================
def main():
    print("="*50)
    print("AURA Deep Learning Research Enhancement")
    print("Fine-tuning Pipeline Initialized")
    print("="*50)

    # Load Data
    dataset, label2id, id2label = load_and_prepare_data()
    
    # Initialize Tokenizer and Model
    print(f"Loading base model: {MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, 
        num_labels=len(AURA_EMOTIONS),
        id2label=id2label,
        label2id=label2id,
        ignore_mismatched_sizes=True # Required because original model has 7 labels, but our mapping might re-init the classification head safely
    )

    # Tokenize
    tokenized_dataset = tokenize_dataset(dataset, tokenizer)
    
    # Calculate Class Weights to handle imbalance
    print("Calculating class weights...")
    train_labels = tokenized_dataset['train']['label']
    class_counts = np.bincount(train_labels)
    total_samples = len(train_labels)
    class_weights = total_samples / (len(AURA_EMOTIONS) * class_counts)
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float).to(model.device)
    print(f"Class Weights: {class_weights}")

    # Define Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        logging_dir=LOG_DIR,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=LEARNING_RATE,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        num_train_epochs=EPOCHS,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        fp16=torch.cuda.is_available(), # Mixed precision if GPU available
        report_to="none", # Set to "wandb" or "tensorboard" if desired
        logging_steps=100,
    )

    # Initialize Custom Trainer
    trainer = WeightedLossTrainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)],
        class_weights=class_weights_tensor
    )

    # Train
    print("Starting Training...")
    trainer.train()

    # Evaluate on Test Set
    print("Evaluating on Test Set...")
    test_results = trainer.predict(tokenized_dataset["test"])
    print("Test Metrics:", test_results.metrics)

    # Save Model & Tokenizer
    print(f"Saving fine-tuned model to {OUTPUT_DIR}")
    trainer.save_model(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # Generate Research Visualizations
    print("Generating Academic Visualizations...")
    os.makedirs("./results/plots", exist_ok=True)
    
    # Confusion Matrix
    predictions = np.argmax(test_results.predictions, axis=1)
    plot_confusion_matrix(
        y_true=test_results.label_ids, 
        y_pred=predictions, 
        labels=AURA_EMOTIONS, 
        output_path="./results/plots/confusion_matrix.png"
    )
    
    # Loss Curves
    plot_loss_curves(trainer, "./results/plots/loss_curves.png")

    # Classification Report
    print("\nClassification Report:")
    report = classification_report(test_results.label_ids, predictions, target_names=AURA_EMOTIONS)
    print(report)
    with open("./results/plots/classification_report.txt", "w") as f:
        f.write(report)

    print("="*50)
    print("Pipeline Complete! Model is ready for deployment.")
    print("Copy the contents of './results/fine_tuned_aura_emotion' to 'backend/models/fine_tuned_emotion/'")
    print("="*50)

if __name__ == "__main__":
    main()
