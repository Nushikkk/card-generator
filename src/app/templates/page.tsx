'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

interface Template {
  id: number;
  name: string;
  thumbnail: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);

  const handleDeleteTemplate = (id: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this template?");
    if (!confirmed) return;

    const request = indexedDB.open('CardTemplatesDB', 1);

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction('templates', 'readwrite');
      const store = transaction.objectStore('templates');

      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => {
        // Update local state to remove deleted template from UI
        setTemplates((prevTemplates) => prevTemplates.filter(t => t.id !== id));
        alert("Template deleted successfully.");
      };

      deleteRequest.onerror = (event) => {
        console.error("Error deleting template:", (event.target as IDBRequest).error);
        alert("Failed to delete template.");
      };
    };
  };


  useEffect(() => {
    const openDB = () => {
      const request = indexedDB.open('CardTemplatesDB', 1);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('templates', 'readonly');
        const store = transaction.objectStore('templates');
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          setTemplates(getAllRequest.result);
        };
      };
    };

    openDB();
  }, []);

  const handleTemplateSelect = (templateId: number) => {
    router.push(`/editor?templateId=${templateId}`);
  };

  return (
    <div className="p-4 bg-photo-templates" style={{ height: '100vh' }}>
      <div className="container py-4">
        <h1 className="h4 mb-4">Choose a Template</h1>
        <div className="row g-4">
          {templates.map((template) => (
            <div key={template.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div
                className="card h-100 shadow-sm hover-shadow cursor-pointer"
                onClick={() => handleTemplateSelect(template.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ratio ratio-16x9 bg-light">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="card-img-top object-fit-cover"
                    style={{ transition: 'transform 0.3s' }}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </div>
                <div className="card-body d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{template.name}</h5>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent template selection
                      handleDeleteTemplate(template.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
