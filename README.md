# Darwix TTS-Backend API

This is the backend engine for the Darwix Emotional Text-to-Speech system. It is a FastAPI application that processes text, detects its underlying emotional sentiment using advanced NLP (RoBERTa), and dynamically adjusts voice parameters to generate expressive speech.

The system is designed to be modular, allowing you to switch between a high-fidelity cloud engine (ElevenLabs) and a free, offline engine (pyttsx3).

## Video demo of the webapp :


https://github.com/user-attachments/assets/4151e797-cc72-4343-a010-f6b965b450d9

code is in other branch (frontend)

## Project Structure:
- server.py:The main entry point. A FastAPI server that exposes the /generate-audio endpoint.
- classification.py:Handles the AI logic. Uses the SamLowe/roberta-base-go_emotions model to classify text into 28 distinct emotions (e.g., "joy", "anger", "remorse").
- ElevenLabsengine.py:Service module for generating audio using the ElevenLabs API (requires API Key).
- pyttsengine.py:Service module for generating audio using the offline pyttsx3 library (free, local).
- ttsmapping.py:The "Translator." It takes the detected emotion and converts it into specific numbers (Speed, Stability, Volume) for the TTS engines.

## Setup Instructions
### Prerequisties:
  - Python 3.9 or higher
  - Elevenlabs API KEY
  - ffmped

1. Create a virtual environment
2. It is best practice to isolate your dependencies.
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```
2.Install Dependencies
Install the required libraries:
```bash
pip install fastapi "uvicorn[standard]" transformers torch scipy python-dotenv elevenlabs pyttsx3
```
3.Environment Variables
Create a file named .env in the root directory to store your secrets:
```bash
ELEVEN_API_KEY=your_actual_api_key_here
```
4.Run the server
Start the API using Uvicorn. This will launch the backend at http://localhost:8000.
```bash
uvicorn server:app --reload
```

## Design & Logic Choices
### 1. Emotion Classification (The "Brain")
We use the RoBERTa-base-GoEmotions model because it is fine-tuned to detect subtle emotional nuances (28 labels) rather than just "Positive/Negative."

- Input: "I can't believe you did that!"
-Output: Label: "anger", Score: 0.92

### 2. **Parameter Mapping (The Translator)**
The core innovation of this project is ttsmapping.py. Instead of hardcoding settings for every emotion, we map emotions to a 2D coordinate system: **Valence** (Positivity) and **Arousal** (Energy).

**Logic for ElevenLabs**
ElevenLabs controls emotion via "Stability" and "Style".

- High Arousal (Anger/Excitement): We lower the Stability (to ~0.3). This forces the AI to be less predictable and more "dramatic," allowing for voice cracks or shouting.
- Low Arousal (Sadness/Neutral): We increase the Stability (to ~0.9). This makes the voice monotone and steady.

**Logic for pyttsx3**
 Since offline engines are simpler, we manipulate Rate (Speed) and Volume.

- High Arousal: fast rate (200+ wpm), max volume (1.0).
- Low Arousal: slow rate (~130 wpm), lower volume (0.7).

### 3. **Audio Streaming Architecture**
To ensure the frontend feels responsive, the backend does not wait to download the full file before sending it.

- ElevenLabs Mode: Streams chunks of audio bytes directly from the external API to the React client.(it was giving free tier error so switched back to offline mode , code is commented out uncomment it to use elevenlabs)
- Offline Mode: Generates a temporary .wav file, streams it, and immediately cleans it up to save disk space.


    
