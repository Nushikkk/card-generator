'use client'

import React, { useState } from 'react';
import { generateImage, generatePDF } from '../../utils/export';
import CardGenerator from '@/components/CardGenerator';
const EditorPage = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportImage = async () => {
    setIsExporting(true);
    await generateImage();
    setIsExporting(false);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await generatePDF();
    setIsExporting(false);
  };

  return (
    <div>
      <h2>Business Card Editor</h2>
      {/* <Editor /> */}
      <CardGenerator />
      <button onClick={handleExportImage} disabled={isExporting}>
        Export as Image
      </button>
      <button onClick={handleExportPDF} disabled={isExporting}>
        Export as PDF
      </button>
    </div>
  );
};

export default EditorPage;
