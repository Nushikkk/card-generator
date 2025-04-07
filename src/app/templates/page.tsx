// app/templates/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Template {
  id: number;
  name: string;
  thumbnail: string;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);

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
      <h1 className="text-2xl mb-4">Choose a Template</h1>
      <div className="w-full max-w-7xl mx-auto px-4"> {/* Container with proper width and padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
              onClick={() => handleTemplateSelect(template.id)}
            >
              {/* Image with aspect ratio */}
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card content */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                {/* {template.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {template.description}
                  </p>
                )} */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}