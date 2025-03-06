import { toPng } from 'html-to-image';
import { PDFDocument } from 'pdf-lib';

export const generateImage = async () => {
    const node = document.querySelector('.card-preview');
    if (node instanceof HTMLElement) {
        const dataUrl = await toPng(node);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'business-card.png';
        link.click();
    }
};

export const generatePDF = async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { height } = page.getSize();

    page.drawText('Business Card PDF', { x: 50, y: height - 50 });

    const pdfBytes = await pdfDoc.save();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
    link.download = 'business-card.pdf';
    link.click();
};
