def tts_params(label,score=1):
    emo_cordi={
        "excitement":   ( 0.9,  0.9), 
        "joy":          ( 0.8,  0.8),  
        "desire":       ( 0.7,  0.8),  
        "admiration":   ( 0.7,  0.6),  
        "amusement":    ( 0.6,  0.7),  
        "pride":        ( 0.8,  0.7),  
        "love":         ( 0.9,  0.5),
        "gratitude":    ( 0.7,  0.3),
        "optimism":     ( 0.7,  0.5),
        "approval":     ( 0.6,  0.4),
        "caring":       ( 0.6,  0.3),
        "relief":       ( 0.6,  0.2),
        "anger":        (-0.7,  0.9), 
        "fear":         (-0.8,  0.9),  
        "nervousness":  (-0.5,  0.8), 
        "disgust":      (-0.8,  0.7), 
        "annoyance":    (-0.4,  0.6),  
        "embarrassment":(-0.5,  0.6),  
        "sadness":      (-0.8,  0.2), 
        "grief":        (-0.9,  0.2),  
        "remorse":      (-0.6,  0.2), 
        "disappointment":(-0.6, 0.3), 
        "disapproval":  (-0.6,  0.4),
        "surprise":     ( 0.2,  0.9),  
        "realization":  ( 0.1,  0.6), 
        "confusion":    (-0.2,  0.5),  
        "curiosity":    ( 0.4,  0.6), 
        "neutral":      ( 0.0,  0.1),
    }

    valence,arousal=emo_cordi.get(label.lower(),(0.0,0.1))

    tar_rate=0.7+(0.6* arousal)
    tar_volume=0.7+(0.3*arousal)
    tar_pitch=1.0+(0.15*valence)

    def mixing(target,default,weight):
        return (target*weight)+(default*(1-weight))

    fin_rate=mixing(tar_rate,1.0,score)
    fin_volume=mixing(tar_volume,1.0,score)
    fin_pitch=mixing(tar_pitch,1.0,score)

    return {
        "rate":round(fin_rate,2),
        "pitch":round(fin_volume,2),
        "volume":round(fin_volume,2)
    }

if __name__ == "__main__":
    test=["joy","grief","anger","relief","surprise"]
    print(f"{'Emotion':<15} | {'Rate':<6} | {'Pitch':<6} | {'Volume':<6}")
    print("-" * 50)

    for emo in test:
        p=tts_params(emo)
        print(f"{emo:<15} | {p['rate']:<6} | {p['pitch']:<6} | {p['volume']:<6}")
