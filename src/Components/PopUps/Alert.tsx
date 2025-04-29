import React from 'react';
import {AlertPopupProps} from '../../Common/Interface'
// import './AlertPopup.css'; // Import the CSS file for styling


const AlertPopup: React.FC<AlertPopupProps> = ({ title, message, onClose }) => {
    return (
        <div className="alert-popup-overlay">
          <div className="alert-popup">
            <div className="alert-popup-header">
              <div className="alert-popup-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.4481 13.0412L8.97619 1.83186C8.54214 1.0803 7.45785 1.0803 7.0238 1.83186L0.551894 13.0412C0.119532 13.7927 0.661667 14.7318 1.52808 14.7318H14.4719C15.3383 14.7318 15.8805 13.7927 15.4481 13.0412ZM7.38861 5.18098H8.61138C8.86641 5.18098 9.06739 5.39885 9.04543 5.65218L8.77183 8.91516C8.75325 9.14148 8.56409 9.31544 8.33778 9.31544H7.66221C7.43589 9.31544 7.24673 9.14148 7.22816 8.91516L6.95456 5.65218C6.9326 5.39885 7.13358 5.18098 7.38861 5.18098ZM7.99999 12.9078C7.41901 12.9078 6.9478 12.4365 6.9478 11.8556C6.9478 11.2746 7.41901 10.8034 7.99999 10.8034C8.58098 10.8034 9.05218 11.2746 9.05218 11.8556C9.05218 12.4365 8.58098 12.9078 7.99999 12.9078Z" fill="#FB2B3A"/>
                </svg>
              </div>
              <span className="alert-popup-title">{title}</span>
              <button className="alert-popup-close" onClick={onClose}>×</button>
            </div>
            <div className="alert-popup-body" dangerouslySetInnerHTML={{ __html: message }} />
            <div className="alert-popup-footer">
              <button className="alert-popup-retry" onClick={onClose}>OK</button>
            </div>
          </div>
        </div>
      );
    };

export default AlertPopup;