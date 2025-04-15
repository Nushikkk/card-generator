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
import { useRouter, useSearchParams } from "next/navigation";
import TemplateModal from "./TemplateModal";
import { jsPDF } from "jspdf";

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
  scaleX: number;
  scaleY: number;
  ref: React.RefObject<Konva.Image | null>;
}
interface SelectedObject {
  type: "text" | "image";
  id: number;
}

const CardGenerator: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter()
  const templateId = searchParams.get('templateId');
  const [templateName, setTemplateName] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const stage = stageRef.current;
      const accordion = accordionRef.current;
      if (!stage || !selectedObject) return;

      const container = stage.container();
      const target = event.target as HTMLElement;

      const isImageTab = activeTab === "image";
      const isActionButton = target.closest('.btn') !== null;
      const isActionSelect = target.closest('select') !== null

      const isTextTab = activeTab === "text";
      const clickedInsideStage = container?.contains(target);
      const clickedInsideAccordion = isTextTab && accordion?.contains(target);

      if (!clickedInsideStage &&
        !(isTextTab && clickedInsideAccordion) &&
        !(isImageTab && (isActionButton || isActionSelect))) {
        setSelectedObject(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedObject, activeTab]);

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

  const bringImageForward = (id: number) => {
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      if (index === -1 || index === prevImages.length - 1) return prevImages;

      const newImages = [...prevImages];
      const [image] = newImages.splice(index, 1);
      newImages.push(image);
      return newImages;
    });
  };

  const sendImageBackward = (id: number) => {
    console.log('sendImageBackward')
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      if (index <= 0) return prevImages;

      const newImages = [...prevImages];
      const [image] = newImages.splice(index, 1);
      newImages.splice(index - 1, 0, image);
      return newImages;
    });
  };

  const loadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxDimension = 200; // Max width or height you want
          const ratio = img.width / img.height;
        
          let displayWidth = maxDimension;
          let displayHeight = maxDimension;
        
          if (ratio > 1) {
            // Landscape
            displayHeight = maxDimension / ratio;
          } else {
            // Portrait or square
            displayWidth = maxDimension * ratio;
          }
        
          const newImage: ImageObject = {
            id: Date.now(),
            image: img,
            x: 50,
            y: 50,
            width: displayWidth,
            height: displayHeight,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
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

  const handleImageClick = (e: Konva.KonvaEventObject<MouseEvent>, id: number) => {
    e.cancelBubble = true;
    setSelectedObject({ type: "image", id });
  };

  const handleImageDelete = (id: number) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id));
    setSelectedObject(null);
  };

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


const exportToPDF = () => {
  if (!stageRef.current) return;

  const stage = stageRef.current;
  const width = stage.width();
  const height = stage.height();

  // Export as high-res image
  const dataURL = stage.toDataURL({ pixelRatio: 2 });

  const pdf = new jsPDF({
    orientation: width > height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
  });

  pdf.addImage(dataURL, "PNG", 0, 0, width, height);
  pdf.save("canvas-export.pdf");
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
        if (templateId) {
          loadTemplate(+templateId);
        }
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
      };
    };

    openDB();

    return () => {
      if (dbRef.current) {
        dbRef.current.close();
      }
    };
  }, []);

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

        setCardBgColor(template.cardBgColor);
        setBorderRadius(template.borderRadius);
        setBackgroundImageOpacity(template.backgroundImageOpacity);
        setTexts(template.texts);
        setTemplateName(template.name)
      };

      request.onerror = (event) => {
        console.error('Error loading template:', (event.target as IDBRequest).error);
      };
    } catch (error) {
      console.error('Error accessing database:', error);
    }
  };

  const saveTemplate = async (templateName: string) => {
    if (!templateName.trim()) {
      setErrorMessage("Please enter a template name.");
      return;
    }

    if (!dbRef.current) {
      console.error("Database not initialized");
      setErrorMessage("Database not available. Please refresh the page.");
      return;
    }

    try {
      const stage = stageRef.current;
      let thumbnail = "";

      if (stage) {
        const originalScale = stage.scaleX();
        stage.draw();
        thumbnail = stage.toDataURL({ pixelRatio: 2 });
        stage.scale({ x: originalScale, y: originalScale });
        stage.draw();
      }

      const template = {
        id: templateId ? Number(templateId) : Date.now(),
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
        thumbnail,
      };

      if (!templateId) {
        const countRequest = dbRef.current
          .transaction(["templates"], "readonly")
          .objectStore("templates")
          .count();

        countRequest.onsuccess = (event) => {
          const count = (event.target as IDBRequest).result;
          const store = dbRef.current!.transaction(["templates"], "readwrite").objectStore("templates");
          const addRequest = store.add(template);

          addRequest.onsuccess = () => {
            setErrorMessage("");
            alert(`Template "${templateName}" saved successfully!`);
          };

          addRequest.onerror = (event) => {
            console.error("Error saving template:", (event.target as IDBRequest).error);
            alert("Failed to save template. Please try again.");
          };
        };
      } else {
        const store = dbRef.current!.transaction(["templates"], "readwrite").objectStore("templates");
        const updateRequest = store.put(template);

        updateRequest.onsuccess = () => {
          setErrorMessage("");
          alert(`Template "${templateName}" updated successfully!`);
          router.push("/templates"); 
        };

        updateRequest.onerror = (event) => {
          console.error("Error updating template:", (event.target as IDBRequest).error);
          alert("Failed to update template. Please try again.");
        };
      }
      setErrorMessage('');
      setShowModal(false);
    } catch (error) {
      console.error("Error accessing database:", error);
      setErrorMessage("Error accessing database. Please try again.");
    } finally {
    }
  };

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
            className={`btn flex-grow-1 ${activeTab === "background" ? "btn-custom" : "btn-light"
              }`}
            onClick={() => setActiveTab("background")}
          >
            Background
          </button>
          <button
            className={`btn flex-grow-1 ${activeTab === "text" ? "btn-custom" : "btn-light"
              }`}
            onClick={() => setActiveTab("text")}
          >
            Texts
          </button>
          <button
            className={`btn flex-grow-1 ${activeTab === "image" ? "btn-custom" : "btn-light"
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
                      className={`accordion-collapse collapse ${selectedObject?.id === text.id ? "show" : ""
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
                // multiple
                accept="image/*"
                onChange={loadImage}
              />
            </div>
            {images.length > 0 && (
              <div>
                <label className="form-label">Selected Image:</label>
                <select
                  className="form-select mb-3"
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
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-secondary flex-grow-1"
                        onClick={() => sendImageBackward(selectedObject.id)}
                      >
                        Send Backward
                      </button>
                      <button
                        className="btn btn-secondary flex-grow-1"
                        onClick={() => bringImageForward(selectedObject.id)}
                      >
                        Bring Forward
                      </button>
                    </div>
                    <button
                      className="btn btn-danger w-100"
                      onClick={() => handleImageDelete(selectedObject.id)}
                    >
                      Remove Image
                    </button>
                  </div>
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

            {images.map((img) => (
              <KonvaImage
                key={img.id}
                image={img.image}
                x={img.x}
                y={img.y}
                width={img.width}
                height={img.height}
                rotation={img.rotation}
                scaleX={img.scaleX}
                scaleY={img.scaleY}
                draggable
                onDragEnd={(e) => handleImageDrag(e, img.id)}
                onClick={(e) => handleImageClick(e, img.id)}
                ref={img.ref}
                onTransformEnd={(e) => {
                  const node = img.ref.current;
                  if (!node) return;

                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  setImages(prevImages =>
                    prevImages.map(image =>
                      image.id === img.id
                        ? {
                          ...image,
                          x: node.x(),
                          y: node.y(),
                          width: Math.max(5, node.width() * scaleX),
                          height: Math.max(5, node.height() * scaleY),
                          rotation: node.rotation(),
                          scaleX: 1,
                          scaleY: 1,
                        }
                        : image
                    )
                  );

                  node.scaleX(1);
                  node.scaleY(1);
                }}
              />
            ))}

            {selectedObject?.type === "image" && (
              <Transformer
                nodes={images
                  .filter((img) => img.id === selectedObject.id)
                  .map((img) => img.ref.current!)
                  .filter(Boolean)}
                anchorSize={8}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
        <div className="d-flex align-self-end me-3 gap-3">
         <button className="btn btn-custom mt-3" onClick={exportToPDF}>
            Export to PDF
          </button>
          <button className="btn btn-custom mt-3" onClick={exportAsImage}>
            Export as Image
          </button>
          <button
            className="btn btn-custom mt-3"
            onClick={() => setShowModal(true)}
          >
            {templateId ? 'Update template' : 'Save template'}
          </button>
        </div>
      </div>

      <TemplateModal
        show={showModal}
        onHide={() => setShowModal(false)}
        errorMessage={errorMessage}
        templateId={templateId}
        templateName={templateName}
        setTemplateName={setTemplateName}
        saveTemplate={saveTemplate}
      />
    </div>
  );
};

export default CardGenerator;
