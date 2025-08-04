import React, { useState } from 'react';
import './RatingModel.css';

const RatingModel = () => {
  const [formData, setFormData] = useState({
    totalReactions: '',
    comments: '',
    shares: '',
    views: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/predictEngagement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Total_Reactions: parseInt(formData.totalReactions),
          Comments: parseInt(formData.comments),
          Shares: parseInt(formData.shares),
          Views: parseInt(formData.views)
        }),
      });
      const data = await response.json();
      setPrediction(data);
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
              <h2>Ratings Prediction</h2>
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Total Reactions</label>
                  <input 
                    type="number" 
                    name="totalReactions"
                    value={formData.totalReactions}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Comments</label>
                  <input 
                    type="number" 
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Shares</label>
                  <input 
                    type="number" 
                    name="shares"
                    value={formData.shares}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Views</label>
                  <input 
                    type="number" 
                    name="views"
                    value={formData.views}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" disabled={loading}>
                  {loading ? 'Predicting...' : 'Predict'}
                </button>
              </form>
            </div>
            <div className="form-right">
              {prediction && (
                <div className="prediction-result">
                  <p>
                    Predicted Rating: <strong>{Math.min(5, Math.max(1, Math.round(prediction.rating)))} stars</strong>
                  </p>
                  <div className="star-rating">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={
                          i < Math.min(5, Math.max(1, Math.round(prediction.rating))) ? 'star filled' : 'star'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {/* <p>Predicted Review Count: <strong>{prediction.review_count}</strong></p> */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModel;