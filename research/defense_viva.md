# AURA: Faculty Defense & Viva Q&A

This document prepares you for a strict academic evaluation of the AURA Deep Learning module.

## Core Defense Questions

### 1. "Why use a pretrained model instead of building one from scratch?"
**Answer:** "Building a transformer model from scratch requires massive computational resources (thousands of GPU hours) and enormous corpora of text (terabytes of data) just to learn basic language syntax and semantics. By using a pretrained model like DistilRoBERTa, we leverage Transfer Learning. The model already 'understands' language. Our contribution is the domain adaptation—fine-tuning the final layers specifically on mental health and emotional datasets to map those complex linguistic representations into our specific 7-class emotion vector space."

### 2. "What exact technical contribution did you make if you used a pretrained model?"
**Answer:** "Using a pretrained model out-of-the-box yields suboptimal results for niche domains. My technical contributions include:
1. **Data Engineering:** Extracting, cleaning, and mapping the 28-class GoEmotions dataset into our 7-class ontology.
2. **Custom Optimization Pipeline:** Implementing a custom loss function (`Weighted CrossEntropy`) within the PyTorch training loop to handle severe class imbalances inherent in psychological data.
3. **End-to-End MLOps Integration:** I didn't just train a model in a notebook; I extracted the weights, built a local inference pipeline using FastAPI, optimized the prediction to return full probability distributions, and mapped those softmax outputs directly to the UI state."

### 3. "Why does this qualify as a 'Deep Learning' project?"
**Answer:** "The core engine of this platform is a Deep Neural Network architecture—specifically, a Transformer. The fine-tuning process involves backpropagating gradients through millions of parameters using AdamW optimization. We are actively modifying the neural weights of the network based on a loss function over multiple epochs, evaluating against validation sets to prevent overfitting, and utilizing mixed-precision GPU tensors. This is textbook Deep Learning applied to a complex NLP task."

---

## Technical Viva Questions

### Q: What is the difference between BERT and RoBERTa/DistilRoBERTa?
**A:** BERT was trained on next-sentence prediction and masked language modeling. RoBERTa removed the next-sentence prediction, trained on a much larger dataset, and used dynamic masking. DistilRoBERTa applies Knowledge Distillation to compress RoBERTa, making it 40% smaller and 60% faster while keeping 95% of its language understanding capabilities.

### Q: Explain the `WeightedLossTrainer` you implemented. Why was it necessary?
**A:** Emotional data is rarely balanced. 'Neutral' or 'Joy' might have thousands of examples, while 'Fear' might have very few. If trained normally, the network achieves high accuracy by simply predicting the majority class. I calculated class weights (inverse to their frequency) and passed them to PyTorch's `CrossEntropyLoss`. This heavily penalizes the network for getting a minority class wrong, forcing it to learn features for rare emotions.

### Q: What is Early Stopping and how does it work in your pipeline?
**A:** Early stopping is a regularization technique. During training, we monitor the validation loss at the end of each epoch. If the validation loss starts increasing while training loss decreases (the definition of overfitting), the callback halts training after a set 'patience' threshold (e.g., 2 epochs) and restores the best model weights.

### Q: How did you calculate 'Confidence' and 'Arousal'?
**A:** Confidence is derived directly from the Softmax function applied to the output logits of the classification head, returning a probability between 0 and 1. Arousal is an engineered feature in the backend calculated via a weighted sum of the probability distribution (e.g., high weights for Anger/Fear, negative weights for Sadness) to proxy psychological intensity.
