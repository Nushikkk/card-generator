import React, { useState } from 'react';

// Simple styles for the business card
const initialCardStyles = {
  backgroundColor: '#ffffff',
  color: '#000000',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
};

const CardEditor = () => {
  const [cardStyles, setCardStyles] = useState(initialCardStyles);
  const [text, setText] = useState('Your Name');
  
  const handleStyleChange = (e: any) => {
    const { name, value } = e.target;
    setCardStyles((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleTextChange = (e: any) => {
    setText(e.target.value);
  };

  return (
    <div className="card-editor">
      {/* Editor Controls */}
      <div className="editor-controls">
        <div>
          <label htmlFor="bgColor">Background Color:</label>
          <input
            type="color"
            id="bgColor"
            name="backgroundColor"
            value={cardStyles.backgroundColor}
            onChange={handleStyleChange}
          />
        </div>

        <div>
          <label htmlFor="textColor">Text Color:</label>
          <input
            type="color"
            id="textColor"
            name="color"
            value={cardStyles.color}
            onChange={handleStyleChange}
          />
        </div>

        <div>
          <label htmlFor="fontFamily">Font:</label>
          <select
            id="fontFamily"
            name="fontFamily"
            value={cardStyles.fontFamily}
            onChange={handleStyleChange}
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Times New Roman, serif">Times New Roman</option>
          </select>
        </div>

        <div>
          <label htmlFor="fontSize">Font Size:</label>
          <input
            type="number"
            id="fontSize"
            name="fontSize"
            value={parseInt(cardStyles.fontSize, 10)}
            onChange={(e) => handleStyleChange({ target: { name: 'fontSize', value: `${e.target.value}px` } })}
          />
        </div>

        <div>
          <label htmlFor="text">Text:</label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={handleTextChange}
          />
        </div>
      </div>

      {/* Business Card Preview */}
      <div
        className="business-card"
        style={{
          backgroundColor: cardStyles.backgroundColor,
          color: cardStyles.color,
          fontFamily: cardStyles.fontFamily,
          fontSize: cardStyles.fontSize,
          padding: '20px',
          borderRadius: '10px',
          width: '300px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2>{text}</h2>
        <p>Job Title</p>
        <p>Contact Info</p>
      </div>
    </div>
  );
};

export default CardEditor;
