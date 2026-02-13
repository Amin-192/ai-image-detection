from flask import Flask, jsonify, request
from flask_cors import CORS
from detector import ImageDetector
import os

app = Flask(__name__)
CORS(app)

# Initialize detector (loads model once at startup)
print("Initializing AI detector...")
detector = ImageDetector('resnet50_cifake.h5')
print("Backend ready!")

@app.route('/')
def home():
    return jsonify({'message': 'AI Detection Backend Running!'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': True})

@app.route('/detect', methods=['POST'])
def detect():
    """
    Endpoint to detect if uploaded image is AI-generated
    Expects: multipart/form-data with 'image' field
    Returns: JSON with classification and confidence
    """
    # Check if image was uploaded
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    img_file = request.files['image']
    
    # Check if filename is empty
    if img_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Validate file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'webp'}
    file_ext = img_file.filename.rsplit('.', 1)[1].lower() if '.' in img_file.filename else ''
    
    if file_ext not in allowed_extensions:
        return jsonify({'error': 'Invalid file type. Use PNG, JPG, or JPEG'}), 400
    
    try:
        # Run detection
        result = detector.predict(img_file)
        
        return jsonify({
            'success': True,
            'result': result
        })
    
    except Exception as e:
        print(f"Error during detection: {str(e)}")
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)