from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from datetime import datetime
import psycopg
from facenet_pytorch import InceptionResnetV1, MTCNN
from PIL import Image
import io
import torch

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/")
def read_root():
    return "FaceMatch API is running!"


mtcnn = MTCNN(image_size=160)
resnet = InceptionResnetV1(pretrained="vggface2").eval()


def extract_face_embeddings(image):
    # Convert the image to RGB format if it's not
    if image.mode != "RGB":
        image = image.convert("RGB")

    image_tensor = mtcnn(image)
    if image_tensor is None:
        return None
    embedding = resnet(image_tensor.unsqueeze(0))
    return embedding


# Endpoint to compare two faces
@app.post("/compare-faces/")
async def compare_faces(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    image1 = Image.open(io.BytesIO(await file1.read()))
    image2 = Image.open(io.BytesIO(await file2.read()))

    # Extract face embeddings
    emb1 = extract_face_embeddings(image1)
    emb2 = extract_face_embeddings(image2)

    if emb1 is None or emb2 is None:
        return {"error": "Could not detect a face in one of the images"}

    # Calculate cosine similarity to compare faces
    distance = torch.nn.functional.cosine_similarity(emb1, emb2)
    is_same_person = distance.item() > 0.5  # Threshold can be adjusted

    return {"is_same_person": is_same_person, "similarity_score": distance.item()}
