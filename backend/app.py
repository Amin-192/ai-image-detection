import os
import base64
import traceback
from io import BytesIO
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS

from detector import ImageDetector
from database import DatabaseManager

app = Flask(__name__)
CORS(app)

print("Initializing backend...")
# Updated to point to your new models folder
detector = ImageDetector('models/resnet50_cifake.h5')
db = DatabaseManager()
print("✅ Backend ready!")

# ==================== SUPABASE MIDDLEWARE ====================
def token_required(f):
    """Verify Supabase JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Token required'}), 401
            
        try:
            # Ask Supabase if token is valid
            user_res = db.client.auth.get_user(token[7:])
            if not user_res or not user_res.user:
                return jsonify({'error': 'Invalid token'}), 401
            
            request.user_id = user_res.user.id
        except Exception:
            return jsonify({'error': 'Unauthorized'}), 401
            
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def home():
    return jsonify({'message': 'AI Detection Backend Running!', 'model_version': 'ResNet50-CIFAKE-v1'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': True, 'model_version': 'ResNet50-CIFAKE-v1'})

# ==================== DETECTION ROUTES ====================
@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    img_file = request.files['image']
    if img_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    allowed = {'png', 'jpg', 'jpeg', 'webp', 'heic', 'heif'}
    ext = img_file.filename.rsplit('.', 1)[1].lower() if '.' in img_file.filename else ''
    if ext not in allowed:
        return jsonify({'error': 'Invalid file type'}), 400
    
    try:
        file_data = img_file.read()
        img_file_for_detection = BytesIO(file_data)
        
        result = detector.predict(img_file_for_detection)
        heatmap_base64_str = base64.b64encode(result['heatmap']).decode('utf-8')
        
        token = request.headers.get('Authorization')
        detection_id, image_url, heatmap_url = None, None, None
        
        if token and token.startswith('Bearer '):
            try:
                user_res = db.client.auth.get_user(token[7:])
                if user_res and user_res.user:
                    user_id = user_res.user.id
                    image_url = db.upload_image(file_data, img_file.filename)
                    if image_url:
                        heatmap_url = db.upload_image(result['heatmap'], f"heatmap_{img_file.filename}")
                        detection_id = db.save_detection(
                            user_id=user_id, image_url=image_url, 
                            classification=result['classification'], confidence=result['confidence'],
                            raw_score=result['raw_score'], heatmap_url=heatmap_url
                        )
            except Exception as e:
                print(f"Auth error during save: {e}")
        
        return jsonify({
            'success': True,
            'result': {
                'classification': result['classification'],
                'confidence': result['confidence'],
                'raw_score': result['raw_score']
            },
            'heatmap': heatmap_base64_str,
            'saved': detection_id is not None,
            'detection_id': detection_id,
            'image_url': image_url,
            'heatmap_url': heatmap_url
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500

@app.route('/history', methods=['GET'])
@token_required
def get_history():
    try:
        limit = request.args.get('limit', 10, type=int)
        history = db.get_user_history(request.user_id, limit)
        return jsonify({'success': True, 'history': history})
    except Exception as e:
        return jsonify({'error': 'Failed to fetch history'}), 500
    
@app.route('/history/<detection_id>', methods=['DELETE'])
@token_required
def delete_history_item(detection_id):
    """Delete a specific history item"""
    try:
        success = db.delete_detection(detection_id, request.user_id)
        if success:
            return jsonify({'success': True, 'message': 'Record deleted'})
        return jsonify({'error': 'Record not found or unauthorized'}), 404
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to delete'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)