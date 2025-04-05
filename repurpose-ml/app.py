import base64
import io
from fastapi import FastAPI, File, UploadFile,Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import torch
from transformers import ViTImageProcessor, ViTForImageClassification
import json
import os
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# Mount static directory for upcycling images
# app.mount("/static", StaticFiles(directory="upcycling_images"), name="static")
app.static_files = StaticFiles(directory="static")
app.mount("/static", app.static_files, name="static")

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load model and processor
model_name = "google/vit-base-patch16-224"
image_processor = ViTImageProcessor.from_pretrained(model_name)
model = ViTForImageClassification.from_pretrained(model_name)

# Load labels
labels_path = "imagenet_class_index.json"
if not os.path.exists(labels_path):
    raise FileNotFoundError(f"Labels file not found at '{labels_path}'.")

with open(labels_path, "r") as f:
    labels = json.load(f)

# Upcycling ideas and images
upcycling_ideas = {
    "suitcase": ("Turn into a stylish pet bed!", "suitcase_pet_bed.jpg"),
    "plastic bottle": ("Create a vertical garden planter!", "vertical_garden.jpg"),
    "water bottle": ("Use as a DIY bird feeder", "bird_feeder.jpg"),
    "jeans": ("Repurpose into a denim tote bag!", "denim_tote.jpg"),
    "wooden chair": ("Convert into a rustic bookshelf!", "wooden_bookshelf.jpg"),
    "glass jar": ("Make DIY storage containers!", "glass_storage.jpg"),
    "tin can": ("Turn into a pencil holder or flower vase!", "tin_can_vase.jpg"),
    "old wallet": ("Transform into DIY Key Holder!", "wallwt.png"),
    "old t-shirt": ("Turn into a reusable shopping bag or braided rug!", "Upcycled-T-Shirt-Tote-Bags.jpg"),
}

def normalize_label(label):
    synonyms = {
        "backpack": "suitcase",
        "plastic bottle": "water bottle",
        "bottle": "water bottle",
        "jean": "jeans",
        "wooden chair": "wooden chair",
        "chair": "wooden chair",
        "glass jar": "glass jar",
        "jar": "glass jar",
        "tin can": "tin can",
        "can": "tin can",
        "manhole_cover": "phone case",
        "wallet": "old wallet",
        "mobile phone": "phone case",
        "t-shirt": "old t-shirt",
        "shirt": "old t-shirt",
        "sweatshirt": "old t-shirt",
    }
    normalized = synonyms.get(label.lower(), label.lower().replace("_", " ").replace("-", " "))
    return normalized

# Create a simple route which will take the file and save the file 
# do from base64 to image
# @app.post("/upload/")
# def upload(file: UploadFile = File(...)):
#     try:
#         contents = file.file.read()
#         with open("uploaded_" + file.filename, "wb") as f:
#             f.write(contents)
#     except Exception:
#         return {"message": "There was an error uploading the file"}
#     finally:
#         file.file.close()
#     return {"message": f"Successfuly uploaded {file.filename}"}




@app.post("/upcycle/")
async def upcycle(file: UploadFile = File(...)):
    try:
        # Save the uploaded file to a temporary location
        with open(os.path.join('static',file.filename), "wb") as f:
            f.write(file.file.read())
        
        
        image = Image.open(os.path.join('static',file.filename))
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Invalid image file: " + str(e)})

    # Preprocess and predict
    inputs = image_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    top_k_indices = torch.topk(logits, k=5, dim=-1).indices.squeeze().tolist()

    detected_objects = []
    for idx in top_k_indices:
        label_name = labels.get(str(idx), ["Unknown", "Unknown"])[1]
        detected_objects.append(normalize_label(label_name))

    suggestions = []
    image_paths = []
    for obj in detected_objects:
        if obj in upcycling_ideas:
            text, img_name = upcycling_ideas[obj]
            suggestions.append(f"Object: {obj}\nIdea: {text}")
            img_path = os.path.join("static/upcycling_images", img_name)
            image_paths.append(img_name if os.path.exists(img_path) else None)

    if not suggestions:
        return JSONResponse(content={
            "suggestions": "No specific upcycling idea found. Try searching for creative DIY ideas!",
            "image_url": None
        })

    # Get first valid image URL
    first_image_url = None
    for img_name in image_paths:
        if img_name:
            first_image_url = f"/static/upcycling_images/{img_name}"
            break

    return JSONResponse(content={
        "suggestions": "\n\n".join(suggestions),
        "image_url": first_image_url
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)