import React from 'react';
import { Link, useLocation  } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-links">
          <Link to="/authentication" className={isActive('/authentication') ? 'active' : ''}>Review Authentication</Link>
          <Link to="/reviews" className={isActive('/reviews') ? 'active' : ''}>Product/Seller Reviews</Link>
          <Link to="/rating" className={isActive('/rating') ? 'active' : ''}>Rating Model</Link>
        </div>
        {/* {isLoggedIn && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )} */}
      </div>
    </nav>
  );
};

export default Navbar;