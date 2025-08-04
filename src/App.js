import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import ReviewAuthentication from './components/ReviewAuthentication';
import ProductReviews from './components/ProductReviews';
import RatingModel from './components/RatingModel';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <Routes>
          <Route path="/authentication" element={<ReviewAuthentication />} />
          <Route path="/reviews" element={<ProductReviews />} />
          <Route path="/rating" element={<RatingModel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;