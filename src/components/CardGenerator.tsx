"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image as KonvaImage,
  Transformer,
} from "react-konva";
import Konva from "konva";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface TextObject {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

interface ImageObject {
  id: number;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  ref: React.RefObject<Konva.Image | null>;
}

interface SelectedObject {
  type: "text" | "image";
  id: number;
}

const CardGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"background" | "text" | "image">(
    "background"
  );
  const [cardBgColor, setCardBgColor] = useState<string>("#ffffff");
  const [borderRadius, setBorderRadius] = useState<number>(0);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [backgroundImageOpacity, setBackgroundImageOpacity] =
    useState<number>(1);
  const [texts, setTexts] = useState<TextObject[]>([]);
  const [images, setImages] = useState<ImageObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  const stageRef = useRef<Konva.Stage>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accordionRef = useRef<HTMLDivElement>(null);
  const dbRef = useRef<IDBDatabase | null>(null);

  // Add event listeners for accordion collapse

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const stage = stageRef.current;
      const accordion = accordionRef.current;
      if (!stage || !selectedObject) return;

      const container = stage.container();
      const target = event.target as Node;

      const isTextTab = activeTab === "text";

      if (
        container &&
        !container.contains(target) &&
        (!isTextTab || (accordion && !accordion.contains(target)))
      ) {
        setSelectedObject(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedObject]);

  // Background handlers
  const handleCardBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardBgColor(e.target.value);
  };

  const handleBorderRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorderRadius(Number(e.target.value));
  };

  const handleBackgroundImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          setBackgroundImage(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBackgroundImageOpacityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBackgroundImageOpacity(Number(e.target.value));
  };

  // Text handlers
  const handleTextFontSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const newSize = parseInt(e.target.value, 10);
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === id ? { ...text, fontSize: newSize } : text
      )
    );
  };

  const handleTextFontFamilyChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    id: number
  ) => {
    const newFontFamily = e.target.value;
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === id ? { ...text, fontFamily: newFontFamily } : text
      )
    );
  };

  const handleTextColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const newColor = e.target.value;
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === id ? { ...text, fill: newColor } : text
      )
    );
  };

  const addNewText = () => {
    const newText: TextObject = {
      id: texts.length > 0 ? Math.max(...texts.map((t) => t.id)) + 1 : 1,
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000000",
    };
    setTexts((prevTexts) => [...prevTexts, newText]);
    setSelectedObject({ type: "text", id: newText.id });
  };

  const handleTextDrag = (e: Konva.KonvaEventObject<DragEvent>, id: number) => {
    const newX = e.target.x();
    const newY = e.target.y();
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === id ? { ...text, x: newX, y: newY } : text
      )
    );
  };

  const handleTextClick = (
    e: Konva.KonvaEventObject<MouseEvent>,
    id: number
  ) => {
    setSelectedObject({ type: "text", id });
  };

  const handleTextDelete = (id: number) => {
    setTexts((prevTexts) => prevTexts.filter((t) => t.id !== id));
    setSelectedObject(null);
  };

  const handleTextChange = (e: any, id: number) => {
    const newText = e.target.text();
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === id ? { ...text, text: newText } : text
      )
    );
  };

  const loadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const newImage: ImageObject = {
            id: Date.now(),
            image: img,
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            rotation: 0,
            ref: React.createRef<Konva.Image>(),
          };
          setImages((prev) => [...prev, newImage]);
          setSelectedObject({ type: "image", id: newImage.id });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrag = (
    e: Konva.KonvaEventObject<DragEvent>,
    id: number
  ) => {
    const newX = e.target.x();
    const newY = e.target.y();
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, x: newX, y: newY } : img
      )
    );
  };

  const handleImageClick = (
    e: Konva.KonvaEventObject<MouseEvent>,
    id: number
  ) => {
    e.cancelBubble = true;
    const image = images.find((img) => img.id === id);
    if (image?.ref.current) {
      setSelectedObject({ type: "image", id });
    }
  };

  const handleImageResize = (e: any, id: number) => {
    const newWidth = e.target.width();
    const newHeight = e.target.height();
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, width: newWidth, height: newHeight } : img
      )
    );
  };

  const handleImageRotation = (e: any, id: number) => {
    const newRotation = e.target.rotation();
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, rotation: newRotation } : img
      )
    );
  };

  const handleImageDelete = (id: number) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
    setSelectedObject(null);
  };

  // Export and save functions
  const exportAsImage = () => {
    const stage = stageRef.current;
    if (stage) {
      setSelectedObject(null);
      const dataURL = stage.toDataURL();
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "card.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const openDB = () => {
      const request = indexedDB.open('CardTemplatesDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        dbRef.current = (event.target as IDBOpenDBRequest).result;
        // Load the template if ID exists
        const templateId = 1742800729575;
        if (templateId) {
          loadTemplate(templateId);
        }
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      };
    };

    openDB();

    // Cleanup function
    return () => {
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, []);

  // Modified loadTemplate function with proper null checks
  const loadTemplate = async (templateId: number) => {
    if (!dbRef.current) {
      console.error('Database not initialized');
      return;
    }

    try {
      const transaction = dbRef.current.transaction(['templates'], 'readonly');
      const store = transaction.objectStore('templates');
      const request = store.get(templateId);

      request.onsuccess = (event) => {
        const template = (event.target as IDBRequest).result;
        if (!template) {
          console.warn(`Template with ID ${templateId} not found`);
          return;
        }

        // Load background image if exists
        if (template.backgroundImage) {
          const bgImg = new Image();
          bgImg.src = template.backgroundImage;
          setBackgroundImage(bgImg);
        }

        // Load regular images
        const loadImages = async () => {
          const loadedImages = await Promise.all(
            template.images.map(async (imgData: any) => {
              const img = new Image();
              img.src = imgData.src;
              await new Promise((resolve) => {
                img.onload = resolve;
              });
              return {
                id: imgData.id,
                image: img,
                x: imgData.x,
                y: imgData.y,
                width: imgData.width,
                height: imgData.height,
                rotation: imgData.rotation,
                ref: React.createRef<Konva.Image>(),
              };
            })
          );
          setImages(loadedImages);
        };

        loadImages();

        // Load other template properties
        setCardBgColor(template.cardBgColor);
        setBorderRadius(template.borderRadius);
        setBackgroundImageOpacity(template.backgroundImageOpacity);
        setTexts(template.texts);
      };

      request.onerror = (event) => {
        console.error('Error loading template:', (event.target as IDBRequest).error);
      };
    } catch (error) {
      console.error('Error accessing database:', error);
    }
  };

  // Modified saveTemplate function with proper null checks
  const saveTemplate = async (templateName: string) => {
    if (!templateName.trim()) {
      setErrorMessage("Please enter a template name.");
      return;
    }

    if (!dbRef.current) {
      console.error('Database not initialized');
      setErrorMessage("Database not available. Please refresh the page.");
      return;
    }

    try {
      // Count existing templates to enforce limit
      const countRequest = dbRef.current
        .transaction(['templates'], 'readonly')
        .objectStore('templates')
        .count();

      countRequest.onsuccess = (event) => {
        const count = (event.target as IDBRequest).result;
        if (count >= 5) {
          alert(
            "You have reached the maximum of 5 saved templates. Please delete some before saving new ones."
          );
          return;
        }

        // Create the template object
        const template = {
          id: Date.now(), // Unique ID for the template
          name: templateName,
          cardBgColor,
          borderRadius,
          backgroundImage: backgroundImage ? backgroundImage.src : null,
          backgroundImageOpacity,
          texts,
          images: images.map((img) => ({
            id: img.id,
            x: img.x,
            y: img.y,
            width: img.width,
            height: img.height,
            rotation: img.rotation,
            src: img.image.src,
          })),
        };

        // Save to IndexedDB
        const transaction = dbRef.current!.transaction(['templates'], 'readwrite');
        const store = transaction.objectStore('templates');
        const addRequest = store.add(template);

        addRequest.onsuccess = () => {
          console.log(template.id)
          setErrorMessage("");
          const templateNameInput = document.getElementById(
            "templateNameInput"
          ) as HTMLInputElement;
          if (templateNameInput) {
            templateNameInput.value = "";
          }
          
          alert(`Template "${templateName}" saved successfully!`);
        };

        addRequest.onerror = (event) => {
          console.error('Error saving template:', (event.target as IDBRequest).error);
          alert('Failed to save template. Please try again.');
        };
      };

      countRequest.onerror = (event) => {
        console.error('Error counting templates:', (event.target as IDBRequest).error);
      };
    } catch (error) {
      console.error('Error accessing database:', error);
      setErrorMessage("Error accessing database. Please try again.");
    }
  };

  //todo width height manipulations of image doesnt stored, and bring forward
  return (
    <div
      className="d-flex rounded-3 bg-custom h-full"
      style={{ height: "100%" }}
    >
      {/* Left-side panel for settings */}
      <div className="w-25 p-3 border-end overflow-auto container">
        {/* Tabs for Background, Text, and Image */}
        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn flex-grow-1 ${
              activeTab === "background" ? "btn-custom" : "btn-light"
            }`}
            onClick={() => setActiveTab("background")}
          >
            Background
          </button>
          <button
            className={`btn flex-grow-1 ${
              activeTab === "text" ? "btn-custom" : "btn-light"
            }`}
            onClick={() => setActiveTab("text")}
          >
            Texts
          </button>
          <button
            className={`btn flex-grow-1 ${
              activeTab === "image" ? "btn-custom" : "btn-light"
            }`}
            onClick={() => setActiveTab("image")}
          >
            Images
          </button>
        </div>

        {/* Background Tab Content */}
        {activeTab === "background" && (
          <div>
            <h3 className="h5 mb-3">Background Styling</h3>
            <div className="mb-3">
              <label className="form-label">Card Background Color:</label>
              <input
                type="color"
                className="form-control form-control-color"
                value={cardBgColor}
                onChange={handleCardBgColorChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Background Image:</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleBackgroundImageChange}
              />
              {backgroundImage && (
                <button
                  className="btn btn-danger w-100 mt-2"
                  onClick={removeBackgroundImage}
                >
                  Remove Background Image
                </button>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Border Radius:</label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="100"
                value={borderRadius}
                onChange={handleBorderRadiusChange}
              />
              <span className="text-muted">{borderRadius}px</span>
            </div>
            <div className="mb-3">
              <label className="form-label">Background Image Opacity:</label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="1"
                step="0.1"
                value={backgroundImageOpacity}
                onChange={handleBackgroundImageOpacityChange}
              />
              <span className="text-muted">{backgroundImageOpacity}</span>
            </div>
          </div>
        )}

        {/* Text Tab Content */}
        {activeTab === "text" && (
          <div>
            <h3 className="h5 mb-3">Text Settings</h3>
            {texts.length > 0 ? (
              <div ref={accordionRef} className="accordion" id="textAccordion">
                {texts.map((text) => (
                  <div key={text.id} className="accordion-item">
                    <h2 className="accordion-header" id={`heading${text.id}`}>
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${text.id}`}
                        aria-expanded={
                          selectedObject?.id === text.id ? "true" : "false"
                        }
                        aria-controls={`collapse${text.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedObject({ type: "text", id: text.id });
                        }}
                      >
                        {text.text || "New Text"}
                      </button>
                    </h2>
                    <div
                      id={`collapse${text.id}`}
                      className={`accordion-collapse collapse ${
                        selectedObject?.id === text.id ? "show" : ""
                      }`}
                      aria-labelledby={`heading${text.id}`}
                      data-bs-parent="#textAccordion"
                    >
                      <div className="accordion-body">
                        <div className="mb-3">
                          <label className="form-label">Text Content:</label>
                          <input
                            type="text"
                            className="form-control"
                            value={text.text}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setTexts((prevTexts) =>
                                prevTexts.map((t) =>
                                  t.id === text.id ? { ...t, text: newText } : t
                                )
                              );
                            }}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Font Size:</label>
                          <input
                            type="number"
                            className="form-control"
                            value={text.fontSize}
                            onChange={(e) =>
                              handleTextFontSizeChange(e, text.id)
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Font Family:</label>
                          <select
                            className="form-select"
                            onChange={(e) =>
                              handleTextFontFamilyChange(e, text.id)
                            }
                            value={text.fontFamily}
                          >
                            <option value="Calibri">Calibri</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">
                              Times New Roman
                            </option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Color:</label>
                          <input
                            type="color"
                            className="form-control form-control-color"
                            value={text.fill}
                            onChange={(e) => handleTextColorChange(e, text.id)}
                          />
                        </div>
                        <button
                          className="btn btn-danger w-100"
                          onClick={() => handleTextDelete(text.id)}
                        >
                          Remove Text
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No texts added yet.</p>
            )}
            <button className="btn btn-custom1 w-100 mt-3" onClick={addNewText}>
              Add New Text
            </button>
          </div>
        )}

        {/* Image Tab Content */}
        {activeTab === "image" && (
          <div>
            <h3 className="h5 mb-3">Image Styling</h3>
            <div className="mb-3">
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={loadImage}
              />
            </div>
            {images.length > 0 && (
              <div>
                <label className="form-label">Selected Image:</label>
                <select
                  className="form-select"
                  value={
                    selectedObject?.type === "image"
                      ? selectedObject.id
                      : undefined
                  }
                  onChange={(e) =>
                    setSelectedObject({
                      type: "image",
                      id: Number(e.target.value),
                    })
                  }
                >
                  {images.map((img) => (
                    <option key={img.id} value={img.id}>
                      Image {img.id}
                    </option>
                  ))}
                </select>
                {selectedObject?.type === "image" && (
                  <button
                    className="btn btn-danger w-100 mt-2"
                    onClick={() => handleImageDelete(selectedObject.id)}
                  >
                    Remove Image
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right-side canvas for card */}
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <Stage width={700} height={400} ref={stageRef}>
          <Layer>
            {/* Background Rectangle */}
            <Rect
              x={0}
              y={0}
              width={700}
              height={400}
              fill={cardBgColor}
              cornerRadius={borderRadius}
            />

            {/* Background Image */}
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                x={0}
                y={0}
                width={700}
                height={400}
                cornerRadius={borderRadius}
                opacity={backgroundImageOpacity}
              />
            )}

            {/* Texts */}
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
                stroke={
                  selectedObject?.type === "text" &&
                  selectedObject.id === text.id
                    ? "#2c3e50"
                    : "transparent"
                }
                strokeWidth={
                  selectedObject?.type === "text" &&
                  selectedObject.id === text.id
                    ? 2
                    : 0
                }
              />
            ))}

            {/* Images */}
            {images.map((img) => (
              <KonvaImage
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
                ref={img.ref}
              />
            ))}

            {/* Transformer for Selected Image */}
            {selectedObject?.type === "image" && (
              <Transformer
                nodes={images
                  .filter(
                    (img) => img.id === selectedObject.id && img.ref.current
                  )
                  .map((img) => img.ref.current!)}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onTransformEnd={(e) => {
                  const node = images.find(
                    (img) => img.id === selectedObject.id
                  );
                  if (node?.ref.current) {
                    handleImageResize(e, node.id);
                    handleImageRotation(e, node.id);
                  }
                }}
              />
            )}
          </Layer>
        </Stage>
        <div className="d-flex align-self-end me-3 gap-3">
          <button className="btn btn-custom mt-3" onClick={exportAsImage}>
            Export as Image
          </button>
          <button
            className="btn btn-custom mt-3"
            data-bs-toggle="modal"
            data-bs-target="#templateNameModal"
          >
            Save template
          </button>
        </div>
      </div>

      {/* Bootstrap Modal for Template Name */}
      <div
        className="modal fade"
        id="templateNameModal"
        tabIndex={-1}
        aria-labelledby="templateNameModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="templateNameModalLabel">
                Save Template
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* Error Message */}
              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}
              <label htmlFor="templateNameInput" className="form-label">
                Template Name:
              </label>
              <input
                type="text"
                className="form-control"
                id="templateNameInput"
                placeholder="Enter template name"
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const templateName = (
                    document.getElementById(
                      "templateNameInput"
                    ) as HTMLInputElement
                  ).value;
                  saveTemplate(templateName);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGenerator;
