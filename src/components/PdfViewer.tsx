import { X } from 'lucide-react';

interface PdfViewerProps {
  url: string | null;
  onClose: () => void;
}

export function PdfViewer({ url, onClose }: PdfViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1002] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-semibold">Паспорт объекта</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {url ? (
            <iframe
              src={url}
              className="w-full h-full"
              title="PDF Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <p className="text-xl text-gray-600 mb-2">Паспорт недоступен</p>
                <p className="text-sm text-gray-500">PDF файл не загружен для данного объекта</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
