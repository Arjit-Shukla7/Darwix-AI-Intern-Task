import ttsmapping
import classification
from aiohttp.hdrs import ACCESS_CONTROL_ALLOW_CREDENTIALS
from fastapi import FastAPI,HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import ElevenLabsengine
import classification
import ttsmapping

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextRequest(BaseModel):
    text:str

@app.post("/generate-audio")
async def generate_audio(request:TextRequest):
    print(f"Your text:{request.text}")

    emotion_data=classification.emotion(request.text)
    label=emotion_data['label']
    score=emotion_data['score']
    print(f"Your emotion is:{label} and i am {int(score*100)}% sure")

    params=ttsmapping.tts_params(label,score)
    print(f"Parameters are:{params}")

    
