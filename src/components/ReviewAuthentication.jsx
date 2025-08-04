import React, { useState } from 'react';
import './ReviewAuthentication.css';

function ReviewAuthentication() {
  const [text, setText] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!text.trim()) return;
      
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/predictFakeReviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        const data = await response.json();
        console.log('data:', data);
        setPrediction(data.prediction);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
  
  return (
    <div className="container">
      <div className="content">
        <div className="form-container">
          <div className="form-box">
            <div className="form-left">
              <h2>Computer Generated / Original Reviews</h2>
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Text</label>
                  <textarea 
                    id="textarea" 
                    name="textarea" 
                    rows="10" 
                    cols="80"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Predicting...' : 'Predict'}
                </button>
              </form>
            </div>
            <div className="form-right">
              {prediction === 'OR' ? (
                <div className="prediction-result">
                  <h2>This is an Authentic review.</h2>
                </div>
              ) : prediction ? (
                <div className="prediction-result">
                  <h2>This is a Fake review.</h2>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewAuthentication;