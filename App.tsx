import React, { useState, useCallback } from 'react';
import { generateMarkdownFromImages } from './services/geminiService';
import { FileUpload } from './components/FileUpload';
import { ImagePreview } from './components/ImagePreview';
import { MarkdownOutput } from './components/MarkdownOutput';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { ErrorDisplay } from './components/ErrorDisplay';
import { toBase64, processPdf } from './utils/fileUtils';
import { parsePageRange } from './utils/pageRangeParser';

const App: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [pageRange, setPageRange] = useState<string>('');
    const [markdown, setMarkdown] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (selectedFiles: FileList | null) => {
        if (!selectedFiles) return;

        setFiles([]);
        setMarkdown('');
        setError(null);
        setPageRange('');
        setIsLoading(true);

        try {
            const processedFiles: File[] = [];
            for (const file of Array.from(selectedFiles)) {
                if (file.type === 'application/pdf') {
                    const pagesAsImages = await processPdf(file);
                    processedFiles.push(...pagesAsImages);
                } else if (file.type.startsWith('image/')) {
                    processedFiles.push(file);
                }
            }
            setFiles(processedFiles);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during file processing.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRemoveFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleConvert = useCallback(async () => {
        if (files.length === 0) {
            setError('Please select at least one image file.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setMarkdown('');

        try {
            let filesToConvert = files;
            if (pageRange.trim() !== '') {
                 try {
                    const selectedIndices = parsePageRange(pageRange, files.length);
                    if (selectedIndices.length === 0) {
                        setError('The specified page range is empty or invalid for the number of uploaded pages.');
                        setIsLoading(false);
                        return;
                    }
                    filesToConvert = selectedIndices.map(index => files[index]);
                } catch (e) {
                    setError(e instanceof Error ? e.message : 'Invalid page range format.');
                    setIsLoading(false);
                    return;
                }
            }


            const imageParts = await Promise.all(
                filesToConvert.map(async (file) => {
                    const base64 = await toBase64(file);
                    return {
                        inlineData: {
                            data: base64,
                            mimeType: file.type,
                        },
                    };
                })
            );
            
            const result = await generateMarkdownFromImages(imageParts);
            setMarkdown(result);
            
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [files, pageRange]);

    const getButtonText = () => {
        if (isLoading) return 'Converting...';
        if (pageRange.trim() !== '') return 'Convert Selected Pages';
        return 'Convert to Markdown';
    };

    return (
        <div className="min-h-screen font-sans">
            <Header />
            <main className="container mx-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
                    <p className="text-center text-slate-600 mb-6">
                        Upload scanned pages of your textbook. The AI will extract the text, format it, and describe any images in detail.
                    </p>

                    <FileUpload onFileChange={handleFileChange} />
                    
                    <ImagePreview files={files} onRemoveFile={handleRemoveFile} />
                    
                    {files.length > 0 && (
                        <>
                            <div className="mt-6">
                                <label htmlFor="page-range" className="block text-sm font-medium text-slate-700 mb-1">
                                    Page Range to Convert (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="page-range"
                                    value={pageRange}
                                    onChange={(e) => setPageRange(e.target.value)}
                                    placeholder="e.g., 1-3, 5, 8-10"
                                    className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    aria-describedby="page-range-description"
                                />
                                <p id="page-range-description" className="mt-2 text-xs text-slate-500">
                                    Specify pages to convert. Leave blank to convert all {files.length} pages.
                                </p>
                            </div>
                            <div className="text-center mt-6">
                                <button
                                    onClick={handleConvert}
                                    disabled={isLoading}
                                    className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
                                >
                                    {getButtonText()}
                                </button>
                            </div>
                        </>
                    )}

                    {isLoading && <Loader />}
                    {error && <ErrorDisplay message={error} />}
                    {markdown && <MarkdownOutput content={markdown} />}
                </div>
            </main>
             <footer className="text-center p-4 text-sm text-slate-500">
                <p>Powered by Gemini AI</p>
            </footer>
        </div>
    );
};

export default App;