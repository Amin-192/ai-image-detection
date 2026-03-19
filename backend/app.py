from flask import Flask, jsonify, request
from flask_cors import CORS
from detector import ImageDetector
from database import DatabaseManager
from auth import hash_password, verify_password, generate_token, token_required

app = Flask(__name__)
CORS(app)

# Initialize
print("Initializing backend...")
detector = ImageDetector('resnet50_cifake.h5')
db = DatabaseManager()
print("✅ Backend ready!")

@app.route('/')
def home():
    return jsonify({'message': 'AI Detection Backend Running!', 'model_version': 'ResNet50-CIFAKE-v1'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': True, 'model_version': 'ResNet50-CIFAKE-v1'})

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/auth/register', methods=['POST'])
def register():
    """Register new user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    email = data['email']
    password = data['password']
    
    # Check if user exists
    existing_user = db.get_user_by_email(email)
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Hash password and create user
    password_hash = hash_password(password)
    user = db.register_user(email, password_hash)
    
    if not user:
        return jsonify({'error': 'Registration failed'}), 500
    
    # Generate token
    token = generate_token(user['user_id'], user['email'])
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'user_id': user['user_id'],
            'email': user['email']
        }
    })

@app.route('/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
    
    email = data['email']
    password = data['password']
    
    # Get user
    user = db.get_user_by_email(email)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Verify password
    if not verify_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate token
    token = generate_token(user['user_id'], user['email'])
    
    return jsonify({
        'success': True,
        'token': token,
        'user': {
            'user_id': user['user_id'],
            'email': user['email']
        }
    })

# ==================== DETECTION ROUTES ====================

@app.route('/detect', methods=['POST'])
def detect():
    """Detect if image is AI-generated with Grad-CAM heatmap"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    img_file = request.files['image']
    
    if img_file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Validate file type
    allowed = {'png', 'jpg', 'jpeg', 'webp'}
    ext = img_file.filename.rsplit('.', 1)[1].lower() if '.' in img_file.filename else ''
    
    if ext not in allowed:
        return jsonify({'error': 'Invalid file type. Use PNG, JPG, JPEG, or WEBP'}), 400
    
    try:
        # Save file data
        file_data = img_file.read()
        
        # Create BytesIO for detection
        from io import BytesIO
        img_file_for_detection = BytesIO(file_data)
        
        # Run detection with heatmap
        result = detector.predict(img_file_for_detection)
        
        # Convert heatmap to base64 string
        import base64
        heatmap_base64_str = base64.b64encode(result['heatmap']).decode('utf-8')
        
        # Check if user is authenticated
        token = request.headers.get('Authorization')
        detection_id = None
        image_url = None
        heatmap_url = None
        
        if token and token.startswith('Bearer '):
            from auth import decode_token
            payload = decode_token(token[7:])
            
            if payload:
                user_id = payload['user_id']
                
                # Upload original image
                image_url = db.upload_image(file_data, img_file.filename)
                
                # Upload heatmap
                if image_url:
                    heatmap_url = db.upload_image(result['heatmap'], f"heatmap_{img_file.filename}")
                
                # Save to database
                if image_url:
                    detection_id = db.save_detection(
                        user_id=user_id,
                        image_url=image_url,
                        classification=result['classification'],
                        confidence=result['confidence'],
                        raw_score=result['raw_score'],
                        heatmap_url=heatmap_url
                    )
        
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
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500

@app.route('/history', methods=['GET'])
@token_required
def get_history():
    """Get user's detection history (authenticated only)"""
    try:
        limit = request.args.get('limit', 10, type=int)
        history = db.get_user_history(request.user_id, limit)
        
        return jsonify({
            'success': True,
            'history': history
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Failed to fetch history'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)