import base64
import io
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image
import torch
from transformers import ViTImageProcessor, ViTForImageClassification
import json
import os
from fastapi.middleware.cors import CORSMiddleware
from gtts import gTTS
import uuid

app = FastAPI()

# Mount static directory
os.makedirs("static", exist_ok=True)
app.static_files = StaticFiles(directory="static")
app.mount("/static", app.static_files, name="static")

# CORS
origins = ["*"]
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

# Upcycling ideas
upcycling_ideas = {
    "suitcase": ("Turn into a stylish pet bed!", "suitcase_pet_bed.jpg"),
    "plastic bottle": ("Create a vertical garden planter!", "vertical_garden.jpg"),
    "water bottle": ("Use as a DIY bird feeder", "bird_feeder.jpg"),
    "jeans": ("Repurpose into a denim tote bag!", "denim_tote.jpg"),
    "wooden chair": ("Convert into a rustic bookshelf!", "wooden_bookshelf.jpg"),
    "glass jar": ("Make DIY storage containers!", "glass_storage.jpg"),
    "tin can": ("Turn into a pencil holder or flower vase!", "tin_can_vase.jpg"),
    "old wallet": ("Transform into DIY Key Holder!", "wallwt.png"),
    "old t-shirt": (
        "Turn into a reusable shopping bag or braided rug!",
        "Upcycled-T-Shirt-Tote-Bags.jpg",
    ),
}

# Recyclability info with steps
recyclability_info_en = {
    "plastic bottle": {
        "recyclable": "Yes, it can be recycled.",
        "steps": [
            "1. Empty and rinse the bottle to remove any residue",
            "2. Remove the cap (often recycled separately)",
            "3. Check local recycling guidelines for plastic types",
            "4. Place in recycling bin or take to recycling center",
        ],
    },
    "water bottle": {
        "recyclable": "Yes, it can be recycled.",
        "steps": [
            "1. Empty and rinse thoroughly",
            "2. Remove labels if possible",
            "3. Crush to save space if allowed in your area",
            "4. Place in plastic recycling bin",
        ],
    },
    "tin can": {
        "recyclable": "Yes, it can be recycled.",
        "steps": [
            "1. Rinse thoroughly to remove food residue",
            "2. Remove paper labels if possible",
            "3. You can crush to save space",
            "4. Place in metal recycling bin",
        ],
    },
    "glass jar": {
        "recyclable": "Yes, it can be recycled.",
        "steps": [
            "1. Remove any remaining contents and rinse",
            "2. Remove metal lids and recycle separately",
            "3. Check if colored glass is accepted in your area",
            "4. Place in glass recycling container",
        ],
    },
    "jeans": {
        "recyclable": "No, but it can be upcycled or donated.",
        "steps": [
            "1. Consider donating if still wearable",
            "2. Many brands offer denim recycling programs",
            "3. Cut into rags for cleaning",
            "4. Upcycle into new items like bags or quilts",
        ],
    },
    "old wallet": {
        "recyclable": "No, not recyclable but reusable.",
        "steps": [
            "1. Donate if still in good condition",
            "2. Remove any metal parts for separate recycling",
            "3. Repurpose as a small storage pouch",
            "4. Use leather/fabric parts for craft projects",
        ],
    },
    "wooden chair": {
        "recyclable": "Yes, wood can be reused or recycled.",
        "steps": [
            "1. Donate if still functional",
            "2. Disassemble and separate materials",
            "3. Wood can be chipped for mulch or compost",
            "4. Metal parts should be recycled separately",
        ],
    },
    "old t-shirt": {
        "recyclable": "No, but it can be repurposed or donated.",
        "steps": [
            "1. Donate to charity if wearable",
            "2. Cut into rags for cleaning",
            "3. Many stores offer clothing recycling programs",
            "4. Upcycle into new items like bags or quilts",
        ],
    },
    "suitcase": {
        "recyclable": "No, not easily recyclable but great for upcycling.",
        "steps": [
            "1. Donate if still usable",
            "2. Remove hardware for metal recycling",
            "3. Repurpose as storage container",
            "4. Transform into unique furniture pieces",
        ],
    },
}

recyclability_info_hi = {
    "plastic bottle": {
        "recyclable": "हाँ, इसे रिसायकल किया जा सकता है।",
        "steps": [
            "1. बोतल को खाली करके किसी भी अवशेष को हटाने के लिए धो लें",
            "2. ढक्कन हटा दें (अक्सर अलग से रिसायकल किया जाता है)",
            "3. प्लास्टिक के प्रकारों के लिए स्थानीय रिसाइक्लिंग दिशानिर्देशों की जाँच करें",
            "4. रिसाइक्लिंग बिन में डालें या रिसाइक्लिंग केंद्र पर ले जाएँ",
        ],
    },
    "water bottle": {
        "recyclable": "हाँ, इसे रिसायकल किया जा सकता है।",
        "steps": [
            "1. खाली करके अच्छी तरह से धो लें",
            "2. यदि संभव हो तो लेबल हटा दें",
            "3. यदि आपके क्षेत्र में अनुमति हो तो जगह बचाने के लिए कुचल दें",
            "4. प्लास्टिक रिसाइक्लिंग बिन में डालें",
        ],
    },
    "tin can": {
        "recyclable": "हाँ, इसे रिसायकल किया जा सकता है।",
        "steps": [
            "1. खाद्य अवशेषों को हटाने के लिए अच्छी तरह से धो लें",
            "2. यदि संभव हो तो कागज के लेबल हटा दें",
            "3. आप जगह बचाने के लिए कुचल सकते हैं",
            "4. धातु रिसाइक्लिंग बिन में डालें",
        ],
    },
    "glass jar": {
        "recyclable": "हाँ, इसे रिसायकल किया जा सकता है।",
        "steps": [
            "1. कोई भी शेष सामग्री हटाकर धो लें",
            "2. धातु के ढक्कन हटाकर अलग से रिसायकल करें",
            "3. जाँचें कि क्या आपके क्षेत्र में रंगीन कांच स्वीकार किया जाता है",
            "4. ग्लास रिसाइक्लिंग कंटेनर में डालें",
        ],
    },
    "jeans": {
        "recyclable": "नहीं, लेकिन इसे अपसायकल किया जा सकता है या दान दिया जा सकता है।",
        "steps": [
            "1. यदि अभी भी पहनने लायक है तो दान करने पर विचार करें",
            "2. कई ब्रांड डेनिम रिसाइक्लिंग कार्यक्रम प्रदान करते हैं",
            "3. सफाई के लिए चीथड़ों में काट लें",
            "4. बैग या रजाई जैसी नई वस्तुओं में अपसायकल करें",
        ],
    },
    "old wallet": {
        "recyclable": "नहीं, रिसायकल नहीं, लेकिन फिर भी इस्तेमाल किया जा सकता है।",
        "steps": [
            "सुप्रभात गांडू",
            "1. यदि अच्छी स्थिति में है तो दान करें",
            "2. अलग से रिसायकल करने के लिए किसी भी धातु के हिस्से को हटा दें",
            "3. छोटे स्टोरेज पाउच के रूप में पुनः उपयोग करें",
            "4. क्राफ्ट प्रोजेक्ट्स के लिए चमड़े/कपड़े के हिस्सों का उपयोग करें",
        ],
    },
    "wooden chair": {
        "recyclable": "हाँ, लकड़ी को फिर से उपयोग या रिसायकल किया जा सकता है।",
        "steps": [
            "1. यदि अभी भी कार्यात्मक है तो दान करें",
            "2. सामग्रियों को अलग करके अलग करें",
            "3. लकड़ी को मल्च या कम्पोस्ट के लिए चिप किया जा सकता है",
            "4. धातु के हिस्सों को अलग से रिसायकल किया जाना चाहिए",
        ],
    },
    "old t-shirt": {
        "recyclable": "नहीं, लेकिन इसे फिर से इस्तेमाल किया जा सकता है या दान दिया जा सकता है।",
        "steps": [
            "1. यदि पहनने योग्य है तो चैरिटी को दान करें",
            "2. सफाई के लिए चीथड़ों में काट लें",
            "3. कई स्टोर कपड़े रिसाइक्लिंग कार्यक्रम प्रदान करते हैं",
            "4. बैग या रजाई जैसी नई वस्तुओं में अपसायकल करें",
        ],
    },
    "suitcase": {
        "recyclable": "नहीं, आसानी से रिसायकल नहीं, लेकिन अपसायकल के लिए बेहतरीन।",
        "steps": [
            "1. यदि अभी भी उपयोग करने योग्य है तो दान करें",
            "2. धातु रिसाइक्लिंग के लिए हार्डवेयर हटा दें",
            "3. स्टोरेज कंटेनर के रूप में पुनः उपयोग करें",
            "4. अद्वितीय फर्नीचर टुकड़ों में बदलें",
        ],
    },
}


# Label normalization
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
    return synonyms.get(
        label.lower(), label.lower().replace("_", " ").replace("-", " ")
    )


@app.post("/upcycle/")
async def upcycle(file: UploadFile = File(...), language: str = Form("en")):
    try:
        # Save uploaded image
        file_path = os.path.join("static", file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        image = Image.open(file_path)
    except Exception as e:
        return JSONResponse(
            status_code=400, content={"error": f"Invalid image file: {e}"}
        )

    # Model prediction
    inputs = image_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    top_k_indices = torch.topk(logits, k=5, dim=-1).indices.squeeze().tolist()

    detected_objects = [
        normalize_label(labels.get(str(idx), ["Unknown", "Unknown"])[1])
        for idx in top_k_indices
    ]

    # Suggestions & images
    suggestions = []
    image_paths = []
    for obj in detected_objects:
        if obj in upcycling_ideas:
            text, img_name = upcycling_ideas[obj]
            suggestions.append(f"Object: {obj}\nIdea: {text}")
            img_path = os.path.join("static/upcycling_images", img_name)
            image_paths.append(img_name if os.path.exists(img_path) else None)

    # Recyclability with steps
    if language.lower() == "hi":
        info_dict = recyclability_info_hi
    else:
        info_dict = recyclability_info_en

    recyclable_info = None
    recycling_steps = []
    detected_obj = None

    for obj in detected_objects:
        if obj in info_dict:
            detected_obj = obj
            recyclable_info = info_dict[obj]["recyclable"]
            recycling_steps = info_dict[obj]["steps"]
            break

    if not recyclable_info:
        recyclable_info = "Sorry, the object could not be classified for recycling."
        recycling_steps = [
            "Please check local recycling guidelines for proper disposal."
        ]

    # Generate TTS - combine recyclability info and ALL steps
    try:
        tts_filename = f"tts_{uuid.uuid4().hex}.mp3"
        tts_path = os.path.join("static", tts_filename)

        # Create comprehensive TTS text with all steps
        if language.lower() == "hi":
            tts_text = f"पता चला वस्तु: {detected_obj if detected_obj else 'अज्ञात'}. {recyclable_info}"
            if recycling_steps:
                tts_text += " रिसायक्लिंग के चरण: " + ". ".join(
                    [
                        step.replace("1.", "")
                        .replace("2.", "")
                        .replace("3.", "")
                        .replace("4.", "")
                        for step in recycling_steps
                    ]
                )
        else:
            tts_text = f"Detected object: {detected_obj if detected_obj else 'Unknown'}. {recyclable_info}"
            if recycling_steps:
                tts_text += " Recycling steps: " + ". ".join(
                    [
                        step.replace("1.", "")
                        .replace("2.", "")
                        .replace("3.", "")
                        .replace("4.", "")
                        for step in recycling_steps
                    ]
                )

        tts = gTTS(text=tts_text, lang="hi" if language.lower() == "hi" else "en")
        tts.save(tts_path)
    except Exception as e:
        print("TTS generation error:", e)
        tts_filename = None

    # First image
    first_image_url = None
    for img_name in image_paths:
        if img_name:
            first_image_url = f"/static/upcycling_images/{img_name}"
            break

    return JSONResponse(
        content={
            "suggestions": "\n\n".join(suggestions)
            if suggestions
            else "No specific upcycling idea found.",
            "image_url": first_image_url,
            "recyclable_info": recyclable_info,
            "recycling_steps": recycling_steps,
            "detected_object": detected_obj if detected_obj else "Unknown",
            "tts_url": f"/static/{tts_filename}" if tts_filename else None,
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
