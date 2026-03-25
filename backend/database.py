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
        try:
            file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            
            self.client.storage.from_(self.bucket_name).upload(
                path=unique_filename,
                file=file_data,
                file_options={"content-type": f"image/{file_ext}"}
            )
            return self.client.storage.from_(self.bucket_name).get_public_url(unique_filename)
        except Exception as e:
            print(f"Image upload error: {e}")
            return None
    
    def save_detection(self, user_id, image_url, classification, confidence, raw_score, heatmap_url=None):
        try:
            detection_result = self.client.table('detections').insert({
                'user_id': user_id,
                'image_url': image_url,
                'classification': classification,
                'confidence_score': confidence
            }).execute()
            
            if not detection_result.data: return None
            detection_id = detection_result.data[0]['detection_id']
            
            self.client.table('detection_analysis').insert({
                'detection_id': detection_id,
                'raw_prediction_score': raw_score,
                'heatmap_data': heatmap_url
            }).execute()
            
            return detection_id
        except Exception as e:
            print(f"Database error: {e}")
            return None
    
    def get_user_history(self, user_id, limit=10):
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
        
    def delete_detection(self, detection_id, user_id):
        """Delete a detection record (ensuring the user owns it)"""
        try:
            result = self.client.table('detections')\
                .delete()\
                .eq('detection_id', detection_id)\
                .eq('user_id', user_id)\
                .execute()
            
            # If data is returned, it means a row was actually deleted
            return True if result.data else False
        except Exception as e:
            print(f"Error deleting record: {e}")
            return False