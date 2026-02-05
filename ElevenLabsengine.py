import os
from dotenv import load_dotenv
from elevenlabs.play import play
from elevenlabs import stream
from elevenlabs import ElevenLabs,VoiceSettings

load_dotenv()
client=ElevenLabs(api_key=os.getenv("ELEVEN_API_KEY"))

def bolnegai11(text,params):
    print(f"Speaking with:{params}")
    try:
        audio_stream=client.text_to_speech.convert(
            text=text,
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2",
        )
        print("Speaking....")
        play(audio_stream)
        
        save_path = "output.mp3"
        with open(save_path, "wb") as f:
            for chunk in audio_stream:
                if chunk:
                    f.write(chunk)
        
        print(f"   [ElevenLabs] Audio saved to {save_path}")
    except Exception as e:
        print(f"ElevenLabs generation failed:{e}")

if __name__ == "__main__":
    test_params = {
        "stability": 0.35,
        "similarity_boost": 0.75, 
        "style": 0.6, 
        "use_speaker_boost": True, 
        "speed": 1.15
    }
    bolnegai11("I cannot believe you deleted the production database!", test_params)