
import React from 'react';

interface ImagePreviewProps {
    files: File[];
    onRemoveFile: (index: number) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ files, onRemoveFile }) => {
    if (files.length === 0) return null;

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Selected Pages:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {files.map((file, index) => (
                    <div key={index} className="relative group aspect-w-1 aspect-h-1">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${file.name}`}
                            className="object-cover w-full h-full rounded-lg shadow-sm border border-slate-200"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg flex items-center justify-center">
                            <button
                                onClick={() => onRemoveFile(index)}
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                                aria-label="Remove image"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
