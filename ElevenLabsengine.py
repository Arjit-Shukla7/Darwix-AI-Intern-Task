from click import style
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
        return client.text_to_speech.convert(
            text=text,
            voice_id="JBFqnCBsd6RMkjVDRZzb",
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=params['stability'],
                similarity_boost=params['similarity_boost'],
                style=params['style'],
                use_speaker_boost=params['use_speaker_boost'],
                speed=params['speed']
            )
        )
    except Exception as e:
        print(f"ElevenLabs generation failed:{e}")

if __name__ == "__main__":
    test_params = {
        "stability": 0.3,
        "similarity_boost": 0.3, 
        "style": 0.3, 
        "use_speaker_boost": True, 
        "speed": 1.15
    }
    bolnegai11("I cannot believe you deleted the production database!", test_params)