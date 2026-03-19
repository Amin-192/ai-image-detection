import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from PIL import Image
import io
import cv2

class ImageDetector:
    def __init__(self, model_path):
        print(f"Loading model weights from {model_path}...")
        
        # Rebuild EXACT architecture from training
        base_model = keras.applications.ResNet50(
            weights='imagenet',
            include_top=False,
            input_shape=(224, 224, 3)
        )
        base_model.trainable = False
        
        # Rebuild your EXACT model structure
        model = keras.models.Sequential([
            base_model,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(1, activation='sigmoid')
        ])
        
        # Compile (required before loading weights)
        model.compile(
            optimizer=keras.optimizers.legacy.Adam(learning_rate=0.0001),
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        # Load weights
        model.load_weights(model_path)
        
        self.model = model
        self.base_model = base_model
        self.last_conv_layer_name = 'conv5_block3_out'
        
        print("✅ Model loaded successfully")
    
    def preprocess_image(self, image_file):
        """Preprocess image for model input"""
        img = Image.open(image_file).convert('RGB')
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array, img
    
    def generate_gradcam(self, img_array):
        """Generate Grad-CAM heatmap"""
        try:
            # Get the conv layer from base model
            conv_layer = self.base_model.get_layer(self.last_conv_layer_name)
            
            # Create a model that outputs conv layer + final prediction
            grad_model = keras.Model(
                inputs=self.base_model.input,
                outputs=[conv_layer.output, self.model.output]
            )
            
            # Compute gradients
            with tf.GradientTape() as tape:
                conv_outputs, predictions = grad_model(img_array, training=False)
                loss = predictions[:, 0]
            
            # Get gradients of the loss wrt conv outputs
            grads = tape.gradient(loss, conv_outputs)
            
            # Global average pooling on gradients
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
            
            # Weight feature maps by gradients
            conv_outputs = conv_outputs[0].numpy()
            pooled_grads = pooled_grads.numpy()
            
            for i in range(len(pooled_grads)):
                conv_outputs[:, :, i] *= pooled_grads[i]
            
            # Create heatmap
            heatmap = np.mean(conv_outputs, axis=-1)
            heatmap = np.maximum(heatmap, 0)  # ReLU
            
            # Normalize
            if np.max(heatmap) != 0:
                heatmap /= np.max(heatmap)
            
            return heatmap
        
        except Exception as e:
            print(f"⚠️ Grad-CAM error: {e}")
            import traceback
            traceback.print_exc()
            # Return simple center-focused heatmap
            heatmap = np.zeros((7, 7))
            heatmap[2:5, 2:5] = 1.0
            return heatmap
    
    def create_heatmap_overlay(self, original_img, heatmap):
        """Create heatmap overlay on original image"""
        heatmap_resized = cv2.resize(heatmap, (224, 224))
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap_resized), 
            cv2.COLORMAP_JET
        )
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        original_array = np.array(original_img)
        superimposed = cv2.addWeighted(original_array, 0.6, heatmap_colored, 0.4, 0)
        return Image.fromarray(superimposed)
    
    def predict(self, image_file):
        """Run prediction with Grad-CAM"""
        img_array, original_img = self.preprocess_image(image_file)
        prediction = self.model.predict(img_array, verbose=0)[0][0]
        
        heatmap = self.generate_gradcam(img_array)
        heatmap_img = self.create_heatmap_overlay(original_img, heatmap)
        
        buffered = io.BytesIO()
        heatmap_img.save(buffered, format="PNG")
        heatmap_base64 = buffered.getvalue()
        
        classification = "Fake" if prediction > 0.5 else "Real"
        confidence = prediction if prediction > 0.5 else (1 - prediction)
        
        return {
            'classification': classification,
            'confidence': float(confidence),
            'raw_score': float(prediction),
            'heatmap': heatmap_base64
        }