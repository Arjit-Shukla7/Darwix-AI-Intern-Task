import ElevenLabsengine
import classification
import ttsmapping
import pyttsengine

def final():
    while True:
        text=input("\nEnter text to convert to speach or press 'c' to cancel  ")
        if text.lower()=='c':
            break

        print("Analysing your text's emotion")
        emo_data=classification.emotion(text)
        score=emo_data['score']

        print(f"Your emotions is:{emo_data['label']} and i am {int(emo_data['score']*100)} % sure")

        tts_params=ttsmapping.tts_params(emo_data['label'])
        print(f"parameters are : {tts_params}")

        print(f"Speaking...")
        pyttsengine.bolnelagi(text,tts_params)
        #ElevenLabsengine.bolnegai11(text,tts_params)

if __name__ == "__main__":
    final()
