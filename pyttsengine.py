import pyttsx3

def bolnelagi(text,params):
    engine=pyttsx3.init()

    defa_rate=engine.getProperty('rate')
    defa_volumne=engine.getProperty('volume')

    new_rate=int(defa_rate*params.get('rate',1.0))
    engine.setProperty('rate',new_rate)

    new_volume=defa_volumne*params.get('volume',1.0)
    engine.setProperty('volume',new_volume)

    print(f"Speaking:'{text}")
    engine.say(text)
    engine.runAndWait()

if __name__ == "__main__":
    sad_params = {"rate": 0.7, "pitch": 0.8, "volume": 0.7} 
    bolnelagi("I am feeling a bit down today.", sad_params)

    happy_params = {"rate": 1.3, "pitch": 1.2, "volume": 1.0}
    bolnelagi("But now I am super excited to be coding!", happy_params)
