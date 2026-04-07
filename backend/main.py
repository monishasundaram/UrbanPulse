from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://urban-pulse.web.app",
    "https://urban-pulse.firebaseapp.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "AI service running"}

# Duplicate permissive middleware removed

# ─── TEXT CHECKER ───
class TextCheck(BaseModel):
    title: str
    description: str
    category: str
    location: str

@app.post("/check/text")
async def check_text(data: TextCheck):
    issues = []
    score = 100

    # Check 1 — minimum word count
    word_count = len(data.description.split())
    if word_count < 10:
        issues.append(f"Description too short ({word_count} words written). Minimum 10 words required.")
        score -= 40

    # Check 2 — title length
    if len(data.title) < 5:
        issues.append("Title is too short. Please be more specific about the issue.")
        score -= 20

    # Check 3 — spam words
    spam_words = ["test", "abc", "xyz", "asdf", "qwerty", "dummy", "fake", "123", "hello", "hi"]
    description_lower = data.description.lower()
    title_lower = data.title.lower()
    for word in spam_words:
        if word in description_lower or word in title_lower:
            issues.append(f"Complaint contains spam content: '{word}'. Please describe a real issue.")
            score -= 30
            break

    # Check 4 — location
    if len(data.location) < 3:
        issues.append("Please provide a valid location for your complaint.")
        score -= 20

    # Check 5 — meaningful content
    unique_words = set(data.description.lower().split())
    if len(unique_words) < 5:
        issues.append("Description lacks meaningful content. Please describe the issue in detail.")
        score -= 20

    # Check 6 — repeated words (spam detection)
    words = data.description.lower().split()
    if len(words) > 0:
        most_common = max(set(words), key=words.count)
        if words.count(most_common) > len(words) * 0.5:
            issues.append(f"Description appears to be spam — word '{most_common}' repeated too many times.")
            score -= 30

    score = max(0, score)
    passed = score >= 60 and len(issues) == 0

    return {
        "passed": passed,
        "score": score,
        "issues": issues,
        "word_count": word_count,
        "message": "✅ Text check passed!" if passed else "❌ Text check failed!"
    }


# ─── IMAGE CHECKER ───
@app.post("/check/image")
async def check_image(file: UploadFile = File(...)):
    issues = []
    score = 100

    try:
        from PIL import Image
        import io

        contents = await file.read()
        file_size = len(contents)

        # Check 1 — file too small (AI generated images are often tiny)
        if file_size < 50000:
            issues.append(f"Image too small ({round(file_size/1024, 1)}KB) — minimum 50KB required. Real photos are larger.")
            score -= 50

        # Check 2 — valid image format
        try:
            img = Image.open(io.BytesIO(contents))
            img.verify()
            img = Image.open(io.BytesIO(contents))
        except Exception:
            issues.append("Invalid image file — please upload a real photo (JPG, PNG, WEBP)")
            score -= 100

        # Check 3 — dimensions too small
        img = Image.open(io.BytesIO(contents))
        width, height = img.size
        if width < 200 or height < 200:
            issues.append(f"Image resolution too low ({width}x{height}px) — please use a real camera photo")
            score -= 40

        # Check 4 — color diversity analysis
        img_rgb = img.convert('RGB').resize((50, 50))
        pixels = list(img_rgb.getdata())
        unique_colors = len(set(pixels))
        total_pixels = len(pixels)
        diversity = unique_colors / total_pixels

        if diversity < 0.05:
            issues.append("Image appears AI-generated — extremely uniform colors detected")
            score -= 80
        elif diversity < 0.15:
            issues.append("Image may be AI-generated or screenshot — low color diversity detected")
            score -= 40

        # Check 5 — EXIF metadata (real camera photos have EXIF)
        has_exif = False
        try:
            exif_data = img._getexif()
            if exif_data and len(exif_data) > 2:
                has_exif = True
                score += 10
        except Exception:
            pass

        if not has_exif:
            issues.append("No camera metadata (EXIF) found — AI-generated images and screenshots lack this data")
            score -= 15

        # Check 6 — file type validation
        allowed_types = [
            "image/jpeg", "image/png", "image/jpg",
            "image/webp", "image/avif", "image/gif"
        ]
        if file.content_type not in allowed_types:
            issues.append(f"Invalid file type: {file.content_type} — please use JPG, PNG or WEBP")
            score -= 40

        score = max(0, min(100, score))

        # Strict passing criteria
        ai_issues = [i for i in issues if any(word in i.lower() for word in ['ai', 'generated', 'screenshot', 'uniform', 'metadata'])]
        passed = score >= 60 and len(issues) == 0

        return {
            "passed": passed,
            "score": score,
            "issues": issues,
            "details": {
                "file_size_kb": round(file_size/1024, 1),
                "dimensions": f"{width}x{height}",
                "color_diversity": round(diversity, 3),
                "has_exif": has_exif
            },
            "message": "✅ Image verified as authentic!" if passed else "🚨 Fake or AI-generated image detected by UrbanPulse AI!"
        }

    except Exception as e:
        return {
            "passed": False,
            "score": 0,
            "issues": [f"Image check failed: {str(e)}"],
            "message": "❌ Could not verify image — please upload a valid photo"
        }


# ─── FULL PROOF GATE ───
class ProofGate(BaseModel):
    title: str
    description: str
    category: str
    location: str

@app.post("/check/proof-gate")
async def proof_gate(data: ProofGate):
    text_result = await check_text(data)

    overall_passed = text_result["passed"]
    all_issues = text_result["issues"]
    final_score = text_result["score"]

    return {
        "passed": overall_passed,
        "final_score": final_score,
        "issues": all_issues,
        "text_check": text_result,
        "message": "✅ Complaint passed AI verification!" if overall_passed else "❌ Complaint failed AI verification!"
    }


# ─── HEALTH CHECK ───
@app.get("/")
async def health():
    return {
        "status": "running",
        "service": "UrbanPulse AI Service",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)