import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import time

class ImageDetector:
    def __init__(self, model_path='resnet50_cifake.h5'):
        """Rebuild model architecture and load weights"""
        print(f"Loading model weights from {model_path}...")
        
        # Rebuild the exact architecture from training
        base_model = ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3)
        )
        base_model.trainable = False
        
        self.model = models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(1, activation='sigmoid')
        ])
        
        # Load only the weights
        self.model.load_weights(model_path)
        
        self.img_size = (224, 224)
        self.model_version = "ResNet50-v1"
        print("✅ Model loaded successfully")
    
    def preprocess_image(self, img_file):
        """Preprocess uploaded image for model"""
        img = Image.open(io.BytesIO(img_file.read()))
        
        # Store original dimensions
        original_dims = f"{img.width}x{img.height}"
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img = img.resize(self.img_size)
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = img_array / 255.0
        
        return img_array, original_dims
    
    def predict(self, img_file):
        """
        Predict if image is real or AI-generated
        Returns: dict with prediction results and metadata
        """
        # Start timing
        start_time = time.time()
        
        # Preprocess
        img_array, original_dims = self.preprocess_image(img_file)
        
        # Predict
        prediction = self.model.predict(img_array, verbose=0)[0][0]
        
        # Calculate processing time
        processing_time = int((time.time() - start_time) * 1000)  # milliseconds
        
        # Interpret results
        is_real = prediction > 0.5
        confidence = prediction if is_real else (1 - prediction)
        label = "Real" if is_real else "AI-Generated"
        
        return {
            'classification': label,
            'confidence': float(confidence),
            'raw_score': float(prediction),
            'metadata': {
                'model_version': self.model_version,
                'processing_time_ms': processing_time,
                'image_dimensions': original_dims
            }
        }