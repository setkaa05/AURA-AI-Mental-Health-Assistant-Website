import logging
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        self.model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
        self.pipeline = None
        self.is_ready = False

    def initialize(self):
        """Initialize the LLM pipeline."""
        if self.is_ready:
            return

        try:
            logger.info(f"Loading LLM {self.model_name}...")
            
            # Use GPU if available, else CPU
            device = 0 if torch.cuda.is_available() else -1
            
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            model = AutoModelForCausalLM.from_pretrained(
                self.model_name,
                dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            )
            
            # Create text generation pipeline
            self.pipeline = pipeline(
                "text-generation",
                model=model,
                tokenizer=tokenizer,
                device=device,
            )
            self.is_ready = True
            logger.info("LLM Service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to load LLM {self.model_name}: {e}")
            self.is_ready = False

    def generate_response(self, user_message: str, emotion: str, history: list = None) -> str:
        """
        Generate an empathetic response using the LLM.
        """
        if not self.is_ready:
            # Fallback if model failed to load
            return f"I'm here for you. (Emotion detected: {emotion})"

        try:
            # Build the conversation prompt
            messages = [
                {"role": "system", "content": "You are AURA, an empathetic, supportive, and non-judgmental AI mental health companion. Provide comforting, brief, and helpful responses to the user. Acknowledge their feelings without diagnosing them."}
            ]

            # Add context from history if available (limit to last 3 interactions to save context length)
            if history:
                for msg in history[-3:]:
                    messages.append({"role": msg["role"], "content": msg["content"]})
            
            # Add the current user message with an implicit context about their emotion
            messages.append({"role": "user", "content": user_message})
            
            # Format using the chat template
            prompt = self.pipeline.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            
            # Generate response
            outputs = self.pipeline(
                prompt,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1,
                return_full_text=False,
                pad_token_id=self.pipeline.tokenizer.eos_token_id,
            )
            response_text = outputs[0]["generated_text"].strip()
            
            return response_text
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return "I'm having a little trouble thinking clearly right now, but I'm still here with you."

# Global instance
llm_service = LLMService()
