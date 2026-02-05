from transformers import pipeline

print("Setting up model")
emo_classifier=pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=1
)
print("model loaded sucesfuly")
def emotion(text):
    try:
        results=emo_classifier(text)
        result=results[0][0]
        print(result)
        return{
            "label":result['label'],
            "score":round(result['score'],4)
        }
    except Exception as e:
        return {
            "error":str(e)
        }

if __name__ == "__main__":
    sentences=[
        "I wonder will how transformer works?",
        "I'm really worried about my mother",
        "Wow,Machine learning is amazing",
        "I hope you are feeling better"
    ]

    print(f"{'Text':<50} , {'Emotion':<12} , {'Confidence'}")
    print('-'*80)

    for sentence in sentences:
        result=emotion(sentence)
        print(f"{sentence:<50} , {result['label']:<12} , {result['score']}")
    

