import os
import io
import uuid

import numpy as np
import tensorflow as tf

tf.config.threading.set_intra_op_parallelism_threads(1)
tf.config.threading.set_inter_op_parallelism_threads(1)

from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import cv2
import mediapipe as mp
# Explicitly import from the python submodule to bypass the Python 3.12 attribute bug
from mediapipe.python.solutions import hands as mp_hands

# ============================================================
# MEDIAPIPE INITIALIZATION
# ============================================================
hands_detector = mp_hands.Hands(
    static_image_mode=True, max_num_hands=1, min_detection_confidence=0.5
)

# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "models", "palmistry_unet_weighted.keras")

RESULTS_DIR = os.path.join(BASE_DIR, "results", "api_predictions")

IMG_SIZE = 256
NUM_CLASSES = 6

# ============================================================
# CLASS INFORMATION
# ============================================================

CLASS_NAMES = {
    0: "Background",
    1: "Life Line",
    2: "Head Line",
    3: "Heart Line",
    4: "Fate Line",
    5: "Sun Line",
}

# ============================================================
# CREATE RESULT DIRECTORY
# ============================================================

os.makedirs(RESULTS_DIR, exist_ok=True)

# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Palmistry AI API",
    description="Palm line segmentation using U-Net with MediaPipe Cropping",
    version="1.0.0",
)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# STATIC RESULT FILES
# ============================================================

app.mount("/results", StaticFiles(directory=RESULTS_DIR), name="results")

# ============================================================
# LOAD MODEL
# ============================================================

print("\n==============================")
print("PALMISTRY AI API")
print("==============================")
print("\nLoading U-Net model...")

try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Model loaded successfully.")
    print("Model:", MODEL_PATH)
except Exception as e:
    print("❌ Error loading model:", e)
    model = None

# ============================================================
# ROOT & HEALTH
# ============================================================


@app.get("/")
def home():
    return {
        "message": "Palmistry AI API is running",
        "status": "ready",
        "model": "palmistry_unet_weighted.keras",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": model is not None}


# ============================================================
# HELPERS
# ============================================================


# --- NEW: MEDIAPIPE ROI EXTRACTION ---
def extract_palm_roi(pil_image: Image.Image, padding_delta: float = 0.15):
    """
    Extracts the Palm Region of Interest (ROI) using MediaPipe Hand Landmarks.
    Formulas implemented:
      - Center: Cp = 1/5 * (L0 + L5 + L9 + L13 + L17)
      - Bounding box: x_min = min(x_i) - delta, x_max = max(x_i) + delta
    """
    img_np = np.array(pil_image)
    h, w, _ = img_np.shape

    # Process RGB image with MediaPipe
    results = hands_detector.process(img_np)

    if not results.multi_hand_landmarks:
        # If no hand detected, fallback to original image
        return pil_image, False, None

    landmarks = results.multi_hand_landmarks[0].landmark

    # 1. Palm Center Cp calculation (Wrist L0, Knuckles L5, L9, L13, L17)
    palm_indices = [0, 5, 9, 13, 17]
    cp_x = sum(landmarks[i].x for i in palm_indices) / 5.0
    cp_y = sum(landmarks[i].y for i in palm_indices) / 5.0

    # 2. Extract bounding box across key palm landmarks
    xs = [landmarks[i].x * w for i in palm_indices]
    ys = [landmarks[i].y * h for i in palm_indices]

    delta_x = padding_delta * w
    delta_y = padding_delta * h

    x_min = max(0, int(min(xs) - delta_x))
    x_max = min(w, int(max(xs) + delta_x))
    y_min = max(0, int(min(ys) - delta_y))
    y_max = min(h, int(max(ys) + delta_y))

    # Crop the palm ROI
    cropped_roi = img_np[y_min:y_max, x_min:x_max]

    # Check if crop is valid (prevents crash if bounding box is somehow outside image)
    if cropped_roi.size == 0:
        return pil_image, False, None

    cropped_pil = Image.fromarray(cropped_roi)

    landmark_metadata = {
        "palm_center": {"x": round(cp_x, 3), "y": round(cp_y, 3)},
        "roi_box": {"x_min": x_min, "x_max": x_max, "y_min": y_min, "y_max": y_max},
    }

    return cropped_pil, True, landmark_metadata


def create_colored_mask(predicted_mask):
    colors = np.array(
        [
            [0, 0, 0],  # Background
            [255, 0, 0],  # Life Line
            [0, 255, 0],  # Head Line
            [0, 0, 255],  # Heart Line
            [255, 255, 0],  # Fate Line
            [255, 0, 255],  # Sun Line
        ],
        dtype=np.uint8,
    )
    return colors[predicted_mask]


def extract_lines(predicted_mask, output_dir):
    line_results = {}
    for class_id in range(1, NUM_CLASSES):
        class_name = CLASS_NAMES[class_id]
        line_mask = np.where(predicted_mask == class_id, 255, 0).astype(np.uint8)
        pixel_count = int(np.sum(predicted_mask == class_id))
        filename = class_name.lower().replace(" ", "_") + ".png"
        output_path = os.path.join(output_dir, filename)

        Image.fromarray(line_mask).save(output_path)

        line_results[class_name] = {"pixels": pixel_count, "file": filename}
    return line_results


# ============================================================
# PREDICT
# ============================================================


@app.post("/predict")
async def predict_palm(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        return {"success": False, "error": "Please upload an image file."}

    image_bytes = await file.read()
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return {"success": False, "error": "Invalid image file."}

    original_size = image.size
    prediction_id = str(uuid.uuid4())
    prediction_dir = os.path.join(RESULTS_DIR, prediction_id)
    os.makedirs(prediction_dir, exist_ok=True)

    # --------------------------------------------------------
    # MediaPipe ROI Extraction & Preprocessing
    # --------------------------------------------------------
    palm_roi, hand_detected, roi_meta = extract_palm_roi(image, padding_delta=0.15)

    # Resize cropped ROI (or original image if fallback) to model input size (256x256)
    resized = palm_roi.resize((IMG_SIZE, IMG_SIZE))
    image_array = np.array(resized, dtype=np.float32) / 255.0
    image_array = np.expand_dims(image_array, axis=0)

    prediction = model.predict(image_array, verbose=0)
    predicted_mask = np.argmax(prediction[0], axis=-1)

    # --------------------------------------------------------
    # Save Outputs
    # --------------------------------------------------------
    raw_mask_path = os.path.join(prediction_dir, "mask.png")
    Image.fromarray(predicted_mask.astype(np.uint8)).save(raw_mask_path)

    colored_mask = create_colored_mask(predicted_mask)
    colored_mask_path = os.path.join(prediction_dir, "colored_mask.png")
    Image.fromarray(colored_mask).save(colored_mask_path)

    # IMPORTANT: Overlay using the cropped palm_roi, not the original image!
    original_resized = palm_roi.resize((IMG_SIZE, IMG_SIZE))
    original_array = np.array(original_resized)
    overlay = 0.6 * original_array + 0.4 * colored_mask
    overlay = np.clip(overlay, 0, 255).astype(np.uint8)
    overlay_path = os.path.join(prediction_dir, "overlay.png")
    Image.fromarray(overlay).save(overlay_path)

    class_distribution = {}
    for class_id in range(NUM_CLASSES):
        pixels = int(np.sum(predicted_mask == class_id))
        percentage = (pixels / predicted_mask.size) * 100
        class_distribution[CLASS_NAMES[class_id]] = {
            "pixels": pixels,
            "percentage": round(percentage, 2),
        }

    lines_dir = os.path.join(prediction_dir, "palm_lines")
    os.makedirs(lines_dir, exist_ok=True)
    line_results = extract_lines(predicted_mask, lines_dir)

    base_url = f"/results/{prediction_id}"

    # ========================================================
    # NEXT.JS FRONTEND COMPATIBILITY LAYER
    # ========================================================

    frontend_lines = {}
    mapping = {
        1: "life_line",
        2: "head_line",
        3: "heart_line",
        4: "fate_line",
        5: "sun_line",
    }

    for class_id, frontend_key in mapping.items():
        y_coords, x_coords = np.where(predicted_mask == class_id)
        pixel_count = len(y_coords)
        detected = pixel_count > 30  # Threshold for detection

        # Extract true AI confidence from the probability matrix
        if detected:
            avg_prob = float(np.mean(prediction[0][y_coords, x_coords, class_id]))
            confidence = round(float(avg_prob), 2)
        else:
            confidence = round(float(min(0.3, pixel_count / 100.0)), 2)

        # Extract points for UI display ("Traced across X key points")
        points = []
        if detected:
            step = max(1, pixel_count // 15)
            for i in range(0, pixel_count, step):
                if len(points) < 15:
                    points.append([int(x_coords[i]), int(y_coords[i])])

        frontend_lines[frontend_key] = {
            "detected": detected,
            "confidence": confidence,
            "points": points,
        }

    # ========================================================
    # RESPONSE (Combined for ML Testing + Next.js UI)
    # ========================================================

    return {
        "success": True,
        "hand_detected": hand_detected,  # NEW
        "roi_metadata": roi_meta,  # NEW
        "prediction_id": prediction_id,
        "filename": file.filename,
        "original_size": {"width": original_size[0], "height": original_size[1]},
        "model_input_size": {"width": IMG_SIZE, "height": IMG_SIZE},
        "classes": class_distribution,
        "segmentation": {
            "mask": base_url + "/mask.png",
            "colored_mask": base_url + "/colored_mask.png",
            "overlay": base_url + "/overlay.png",
        },
        "palm_lines": line_results,
        # --- NEXT.JS FRONTEND KEYS ---
        "model": "U-Net Segmentation",
        "message": "Palm successfully processed",
        "lines": frontend_lines,
    }
