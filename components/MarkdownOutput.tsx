import React, { useState, useEffect } from 'react';

interface MarkdownOutputProps {
    content: string;
}

export const MarkdownOutput: React.FC<MarkdownOutputProps> = ({ content }) => {
    const [copyStatus, setCopyStatus] = useState<'Copy' | 'Copied!'>('Copy');

    useEffect(() => {
        if (content) {
            setCopyStatus('Copy');
        }
    }, [content]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        });
    };

    const handleDownload = () => {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-slate-800">Generated Markdown</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${copyStatus === 'Copied!' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                        {copyStatus}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors duration-200"
                        aria-label="Download Markdown file"
                    >
                        Download .md
                    </button>
                </div>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-lg shadow-inner overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm">
                    <code>{content}</code>
                </pre>
            </div>
        </div>
    );
};
