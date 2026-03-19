from supabase import create_client
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

class DatabaseManager:
    def __init__(self):
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        
        if not url or not key:
            raise Exception("Missing Supabase credentials in .env file")
        
        self.client = create_client(url, key)
        self.bucket_name = 'detection-images'
        print("✅ Database connected")
    
    def upload_image(self, file_data, filename):
        """Upload image to Supabase Storage and return public URL"""
        try:
            # Create unique filename
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            
            # Upload to storage
            self.client.storage.from_(self.bucket_name).upload(
                path=unique_filename,
                file=file_data,
                file_options={"content-type": f"image/{file_ext}"}
            )
            
            # Get public URL
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(unique_filename)
            
            return public_url
        
        except Exception as e:
            print(f"Image upload error: {e}")
            return None
    
    def save_detection(self, user_id, image_url, classification, confidence, raw_score, heatmap_url=None):
        """Save detection result to database"""
        try:
            # Insert into detections table
            detection_result = self.client.table('detections').insert({
                'user_id': user_id,
                'image_url': image_url,
                'classification': classification,
                'confidence_score': confidence
            }).execute()
            
            if not detection_result.data:
                return None
            
            detection_id = detection_result.data[0]['detection_id']
            
            # Insert into detection_analysis table
            self.client.table('detection_analysis').insert({
                'detection_id': detection_id,
                'raw_prediction_score': raw_score,
                'heatmap_data': heatmap_url  # Store heatmap URL
            }).execute()
            
            return detection_id
        
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    def get_user_history(self, user_id, limit=10):
        """Get user's detection history with images"""
        try:
            result = self.client.table('detections')\
                .select('*, detection_analysis(*)')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []
    
    def register_user(self, email, password_hash):
        """Register new user"""
        try:
            result = self.client.table('users').insert({
                'email': email,
                'password_hash': password_hash
            }).execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Registration error: {e}")
            return None
    
    def get_user_by_email(self, email):
        """Get user by email"""
        try:
            result = self.client.table('users')\
                .select('*')\
                .eq('email', email)\
                .execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None