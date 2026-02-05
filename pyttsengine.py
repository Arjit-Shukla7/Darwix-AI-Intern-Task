import pyttsx3
import os
import uuid

def bolnelagi(text,params):
    engine=pyttsx3.init()

    filename=f"temp_{uuid.uuid4()}.wav"
    defa_rate=engine.getProperty('rate')
    defa_volumne=engine.getProperty('volume')

    new_rate=int(defa_rate*params.get('rate',1.0))
    engine.setProperty('rate',new_rate)

    new_volume=defa_volumne*params.get('volume',1.0)
    engine.setProperty('volume',new_volume)

    engine.save_to_file(text,filename)
    engine.say(text)
    engine.runAndWait()
    return filename

def audio_stream(text,params):
    file_path=bolnelagi(text,params)

    with open(file_path,"rb") as f:
        yield from f
    
    os.remove(file_path)