
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
            <div className="container mx-auto py-4 px-4 md:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Scan to Markdown AI Converter
                </h1>
            </div>
        </header>
    );
};
