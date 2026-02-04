import os
import pickle
import numpy as np
from deepface import DeepFace
from app.config import Config

class FaceRecognitionService:
    @staticmethod
    def extract_embedding(img_path):
        """
        Extracts face embedding from an image path using DeepFace.
        Returns a list representing the embedding.
        """
        try:
            print(f"Extracting embedding for: {img_path}")
            # multiple faces can be detected, we assume 1 for registration
            embedding = DeepFace.represent(
                img_path=img_path,
                model_name=Config.DEEPFACE_MODEL,
                detector_backend='ssd',
                enforce_detection=True  # Changed to True to ensure face is detected
            )
            if embedding and len(embedding) > 0:
                return embedding[0]["embedding"]
            else:
                print("No face embedding returned")
                return None
        except ValueError as e:
            print(f"Face detection error: {e}")
            return None  # No face detected
        except Exception as e:
            print(f"DeepFace processing error: {e}")
            # Do NOT return a mock embedding - fail properly
            return None

    @staticmethod
    def verify_face(img_path, stored_embedding):
        """
        Verifies if the face in img_path matches the stored_embedding.
        Returns (is_match, distance).
        """
        try:
            target_embedding = FaceRecognitionService.extract_embedding(img_path)
            if not target_embedding:
                raise ValueError("No face detected in the image. Please ensure your face is clearly visible in the frame.")

            # Validate stored embedding exists and is valid
            if not stored_embedding or len(stored_embedding) == 0:
                raise ValueError("User has no registered face. Please register your face first.")
            
            # Convert to numpy arrays
            a = np.array(stored_embedding)
            b = np.array(target_embedding)
            
            # Cosine distance calculation
            norm_a = np.linalg.norm(a)
            norm_b = np.linalg.norm(b)
            
            if norm_a == 0 or norm_b == 0:
                print("Error: Zero norm for embedding - invalid face data")
                return False, 1.0

            cosine_distance = 1 - (np.dot(a, b) / (norm_a * norm_b))
            
            # Stricter threshold for ArcFace + Cosine
            # Lower threshold = stricter matching (typical range: 0.4-0.68)
            # Setting to 0.50 for better security while maintaining usability
            threshold = 0.50
            
            is_match = cosine_distance < threshold
            
            print(f"Face verification: distance={cosine_distance:.4f}, threshold={threshold}, match={is_match}")
            
            return is_match, cosine_distance
        except Exception as e:
            print(f"Error verifying face: {e}")
            return False, 0.0
