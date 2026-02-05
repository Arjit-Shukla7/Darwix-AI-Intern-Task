import pyttsengine
import ElevenLabsengine
import ttsmapping
import classification
from fastapi import FastAPI,HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import ElevenLabsengine
import classification
import ttsmapping
import pyttsengine


app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Emotion"],
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

    audio_stream=pyttsengine.audio_stream(request.text,params)
#    audio_stream=ElevenLabsengine.bolnegai11(request.text,params)
    if not audio_stream:
        raise HTTPException(status_code=500, detail="Audio generation failed")
    
    return StreamingResponse(
        audio_stream,
        media_type="audio/wav",
        headers={"X-Emotion":label}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8000)


