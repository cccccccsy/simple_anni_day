import React from 'react';
import './Header.css';

function Header({ onAddClick }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="header-title">Simple Anniversary</h1>
          <p className="header-subtitle">Never forget the special moments</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={onAddClick}>
            <span className="btn-icon">+</span>
            Add Anniversary
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
