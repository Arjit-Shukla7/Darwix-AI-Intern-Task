import React, { useState, useRef } from 'react';
import './App.css'; // Optional styling

function App() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Reference to the hidden audio player
  const audioRef = useRef(null);

  const handleGenerate = async () => {
    if (!text) return;

    setIsLoading(true);
    setStatus('Analyzing emotion...');

    try {
      // 1. Call your FastAPI Backend
      const response = await fetch('http://localhost:8000/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setStatus('Receiving audio...');

      // 2. Convert response to a Blob (Binary Large Object)
      const audioBlob = await response.blob();

      // 3. Create a temporary URL for this blob
      const audioUrl = URL.createObjectURL(audioBlob);

      // 4. Set the audio source and play
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

      setStatus(`Done! Played audio for: "${text.substring(0, 20)}..."`);

    } catch (error) {
      console.error("Error:", error);
      setStatus('Error generating audio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🎭 Emotional TTS</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something emotional here... (e.g., 'I am so angry right now!')"
        style={{ width: '100%', height: '100px', padding: '10px', fontSize: '16px' }}
      />

      <br /><br />

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {isLoading ? 'Generating...' : 'Speak It 🔊'}
      </button>

      <p style={{ marginTop: '20px', color: '#666' }}>{status}</p>

      {/* The Audio Element (Hidden or Visible) */}
      <audio ref={audioRef} controls style={{ marginTop: '20px', width: '100%' }} />
    </div>
  );
}

export default App;