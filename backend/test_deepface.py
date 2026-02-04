import os
import sys
from deepface import DeepFace
import numpy as np

# Force CPU to avoid CUDA issues just in case
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

print("🔍 Starting DeepFace Debugger...")
print(f"Python: {sys.version}")

try:
    print("⏳ Initializing DeepFace (ArcFace)... This may take a moment...")
    # Generate a dummy image (black square)
    img = np.zeros((500, 500, 3), dtype=np.uint8)
    
    # Run represent on dummy image (expecting 'Face not found' error, but checking if model loads)
    try:
        embedding = DeepFace.represent(img_path=img, model_name="ArcFace", enforce_detection=True)
        print("✅ DeepFace returned embedding (Unexpected for black image, but model loaded!)")
    except ValueError as e:
        print(f"✅ DeepFace Model Loaded! (Got expected 'Face could not be detected' error): {e}")
    except Exception as e:
        print(f"❌ DeepFace Error during inference: {e}")

except Exception as e:
    print(f"❌ Critical Error loading DeepFace: {e}")

print("🏁 Debug check complete.")
