import React from 'react';
import './RocketLoader.css';

const RocketLoader = ({ message = "Loading...", variant = "default", compact = false }) => {
  const containerClass = `rocket-loader-container ${variant} ${compact ? 'compact' : ''}`;
  
  return (
    <div className={containerClass}>
      <div className="rocket-loader">
        <div className="rocket">
          <div className="rocket-body">
            <div className="rocket-nose"></div>
            <div className="rocket-window"></div>
            <div className="rocket-fins">
              <div className="fin fin-top"></div>
              <div className="fin fin-bottom"></div>
            </div>
          </div>
          <div className="rocket-trail">
            <div className="trail-line"></div>
            <div className="trail-line"></div>
            <div className="trail-line"></div>
            <div className="trail-line"></div>
            <div className="trail-line"></div>
          </div>
        </div>
      </div>
      <div className="loading-text">{message}</div>
    </div>
  );
};

export default RocketLoader;