import React, { useState } from 'react';
import { Stage, Layer, Text, Image, Transformer, Rect } from 'react-konva';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

interface ImageElement {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

type SelectedObject = { type: 'text'; id: string } | { type: 'image'; id: string } | null;

const CardGenerator: React.FC = () => {
  const [texts, setTexts] = useState<TextElement[]>([
    { id: '1', text: 'Sample Text', x: 50, y: 50, fontSize: 20, fontFamily: 'Calibri', fill: 'black' },
  ]);

  const [images, setImages] = useState<ImageElement[]>([]);
  const [selectedObject, setSelectedObject] = useState<SelectedObject>(null);
  const [cardBgColor, setCardBgColor] = useState<string>('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  const handleTextChange = (e: any, id: string) => {
    const newTexts = texts.map((text) =>
      text.id === id ? { ...text, text: e.target.text() } : text
    );
    setTexts(newTexts);
  };

  const handleTextDrag = (e: any, id: string) => {
    const newTexts = texts.map((text) =>
      text.id === id
        ? { ...text, x: e.target.x(), y: e.target.y() }
        : text
    );
    setTexts(newTexts);
  };

  const handleImageDrag = (e: any, id: string) => {
    const newImages = images.map((image) =>
      image.id === id
        ? { ...image, x: e.target.x(), y: e.target.y() }
        : image
    );
    setImages(newImages);
  };

  const handleTextClick = (e: any, id: string) => {
    setSelectedObject({ type: 'text', id });
  };

  const handleImageClick = (e: any, id: string) => {
    setSelectedObject({ type: 'image', id });
  };

  const loadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const img = new window.Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      setImages([...images, { id: new Date().getTime().toString(), image: img, x: 100, y: 100, width: 100, height: 100, rotation: 0 }]);
    };
  };

  const handleImageResize = (e: any, id: string) => {
    const newImages = images.map((image) =>
      image.id === id
        ? { ...image, width: e.target.width(), height: e.target.height() }
        : image
    );
    setImages(newImages);
  };

  const handleImageRotation = (e: any, id: string) => {
    const newImages = images.map((image) =>
      image.id === id
        ? { ...image, rotation: e.target.rotation() }
        : image
    );
    setImages(newImages);
  };

  const handleTextFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newTexts = texts.map((text) =>
      text.id === id ? { ...text, fontSize: parseInt(e.target.value, 10) } : text
    );
    setTexts(newTexts);
  };

  const handleTextFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    const newTexts = texts.map((text) =>
      text.id === id ? { ...text, fontFamily: e.target.value } : text
    );
    setTexts(newTexts);
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newTexts = texts.map((text) =>
      text.id === id ? { ...text, fill: e.target.value } : text
    );
    setTexts(newTexts);
  };

  const handleCardBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardBgColor(e.target.value);
  };

  const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const img = new window.Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = () => {
      setBackgroundImage(img);
    };
  };

  const addNewText = () => {
    const newText: TextElement = {
      id: new Date().getTime().toString(),
      text: 'New Text',
      x: 50,
      y: 100,
      fontSize: 20,
      fontFamily: 'Calibri',
      fill: 'black',
    };
    setTexts([...texts, newText]);
  };

  const exportAsImage = () => {
    const dataURL = document.querySelector('canvas')?.toDataURL();
    if (!dataURL) return;

    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'card.png';
    link.click();
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Left-side panel for settings */}
      <div style={{ width: '300px', padding: '20px', borderRight: '2px solid #ccc' }}>
        <div>
          <label>Card Background Color:</label>
          <input
            type="color"
            value={cardBgColor}
            onChange={handleCardBgColorChange}
          />
        </div>
        <div>
          <label>Background Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageChange}
          />
        </div>

        {/* Show settings only for the selected text */}
        {selectedObject && selectedObject.type === 'text' && (
          <div>
            <h3>Text Settings</h3>
            <label>Font Size:</label>
            <input
              type="number"
              value={texts.find((t) => t.id === selectedObject.id)?.fontSize}
              onChange={(e) => handleTextFontSizeChange(e, selectedObject.id)}
            />
            <label>Font Family:</label>
            <select
              onChange={(e) => handleTextFontFamilyChange(e, selectedObject.id)}
              value={texts.find((t) => t.id === selectedObject.id)?.fontFamily}
            >
              <option value="Calibri">Calibri</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
            </select>
            <label>Color:</label>
            <input
              type="color"
              value={texts.find((t) => t.id === selectedObject.id)?.fill}
              onChange={(e) => handleTextColorChange(e, selectedObject.id)}
            />
          </div>
        )}

        <button onClick={addNewText}>Add New Text</button>
        <div>
          <input type="file" accept="image/*" onChange={loadImage} />
        </div>
        <button onClick={exportAsImage}>Export as Image</button>
      </div>

      {/* Right-side canvas for card */}
      <div style={{ flex: 1, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Stage width={600} height={400}>
          <Layer>
            <Rect
              x={0}
              y={0}
              width={600}
              height={400}
              fill={cardBgColor}
              image={backgroundImage}
            />
            {texts.map((text) => (
              <Text
                key={text.id}
                text={text.text}
                x={text.x}
                y={text.y}
                fontSize={text.fontSize}
                fontFamily={text.fontFamily}
                fill={text.fill}
                draggable
                onDragEnd={(e) => handleTextDrag(e, text.id)}
                onClick={(e) => handleTextClick(e, text.id)}
                onBlur={(e: any) => handleTextChange(e, text.id)}
                // Highlight selected text with border
                stroke={selectedObject?.type === 'text' && selectedObject.id === text.id ? 'blue' : 'transparent'}
                strokeWidth={selectedObject?.type === 'text' && selectedObject.id === text.id ? 2 : 0}
              />
            ))}
            {images.map((img) => (
              <Image
                key={img.id}
                image={img.image}
                x={img.x}
                y={img.y}
                width={img.width}
                height={img.height}
                rotation={img.rotation}
                draggable
                onDragEnd={(e) => handleImageDrag(e, img.id)}
                onClick={(e) => handleImageClick(e, img.id)}
              >
                <Transformer
                  enabled={selectedObject?.type === 'image' && selectedObject.id === img.id}
                  onTransformEnd={(e) => handleImageResize(e, img.id)}
                  onRotateEnd={(e:any) => handleImageRotation(e, img.id)}
                />
              </Image>
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default CardGenerator;
