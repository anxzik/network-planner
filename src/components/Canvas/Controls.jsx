import {Maximize2, Trash2, ZoomIn, ZoomOut} from 'lucide-react';
import {useNetwork} from '../../context/NetworkContext';

function CanvasControls({ onZoomIn, onZoomOut, onFitView }) {
  const { clearCanvas, getNodeCount } = useNetwork();

  const handleClearCanvas = () => {
    if (getNodeCount() === 0) return;

    const confirmed = window.confirm(
      'Are you sure you want to clear the entire canvas? This cannot be undone.'
    );

    if (confirmed) {
      clearCanvas();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Canvas Controls */}
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2 flex flex-col gap-1">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} className="text-gray-700" />
        </button>

        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} className="text-gray-700" />
        </button>

        <button
          onClick={onFitView}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Fit View"
        >
          <Maximize2 size={20} className="text-gray-700" />
        </button>

        <div className="h-px bg-gray-300 my-1" />

        <button
          onClick={handleClearCanvas}
          className="p-2 hover:bg-red-50 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Clear Canvas"
          disabled={getNodeCount() === 0}
        >
          <Trash2 size={20} className="text-red-600" />
        </button>
      </div>
    </div>
  );
}

export default CanvasControls;
