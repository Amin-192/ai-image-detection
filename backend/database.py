from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseManager:
    def __init__(self):
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_KEY')
        
        if not url or not key:
            raise Exception("Missing Supabase credentials in .env file")
        
        self.client = create_client(url, key)
        print(" Database connected")
    
    def save_detection(self, user_id, image_url, classification, confidence, raw_score):
        """Save detection result to database (authenticated users only)"""
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
                'heatmap_data': None  # We'll add heatmap generation later
            }).execute()
            
            return detection_id
        
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    def get_user_history(self, user_id, limit=10):
        """Get user's detection history"""
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