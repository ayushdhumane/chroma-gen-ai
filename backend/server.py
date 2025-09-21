from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # during dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Hello World"}

model = SentenceTransformer("all-MiniLM-L6-v2")

with open("palettes.json") as f:
    palettes = json.load(f)

for p in palettes:
    text = p["name"] + " " + " ".join(p["tags"])
    p["embedding"] = model.encode(text)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
def generate_palette(request: PromptRequest):
    query_emb = model.encode(request.prompt)
    similarities = [
        cosine_similarity([query_emb], [p["embedding"]])[0][0]
        for p in palettes
    ]
    best_idx = similarities.index(max(similarities))
    best_palette = palettes[best_idx]

    return {
        "name": best_palette["name"],
        "colors": best_palette["colors"],
    }

