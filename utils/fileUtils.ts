import * as pdfjsLib from 'pdfjs-dist';
// Set worker source for pdf.js to use the ESM-compatible CDN version matching the installed version (5.4.149)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.worker.mjs';

export const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URI scheme prefix (e.g., "data:image/png;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
    });
};

const canvasToFile = (canvas: HTMLCanvasElement, pageNum: number, originalFileName: string): Promise<File> => {
    return new Promise(resolve => {
        canvas.toBlob(blob => {
            if (blob) {
                const file = new File([blob], `${originalFileName.replace(/\.pdf$/i, '')}-page-${pageNum}.png`, { type: 'image/png' });
                resolve(file);
            }
        }, 'image/png', 0.95);
    });
};

/**
 * Converts a PDF file into an array of image files, one for each page.
 * @param file The PDF file to process.
 * @returns A promise that resolves to an array of File objects.
 */
export const processPdf = async (file: File): Promise<File[]> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const pageFiles: File[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const scale = 2.0; // Use a higher scale for better image quality
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
                const pageFile = await canvasToFile(canvas, i, file.name);
                pageFiles.push(pageFile);
            }
        }
        return pageFiles;
    } catch (error) {
        console.error("Error processing PDF: ", error);
        if (error instanceof Error) {
            alert(`PDF processing error: ${error.name} - ${error.message}\nSee console for details.`);
        } else {
            alert(`PDF processing error: ${JSON.stringify(error)}\nSee console for details.`);
        }
        throw new Error("Could not process PDF. It may be corrupted, password-protected, or there is a worker/network issue.");
    }
};