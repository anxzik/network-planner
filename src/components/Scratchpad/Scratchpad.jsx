import {useCallback, useRef, useState} from 'react';
import {ChevronDown, FileText, GripHorizontal, Trash2} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useScratchpad} from '../../context/ScratchpadContext';
import CalculationCard from './CalculationCard';

function Scratchpad() {
  const { currentTheme } = useSettings();
  const {
    isOpen,
    panelHeight,
    notes,
    calculations,
    closeScratchpad,
    setPanelHeight,
    updateNotes,
    deleteCalculation,
    clearAllCalculations,
  } = useScratchpad();

  const [activeTab, setActiveTab] = useState('calculations'); // 'calculations' or 'notes'
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  // Handle resize drag
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);

    const startY = e.clientY;
    const startHeight = panelHeight;

    const handleMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, 150), 600);
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [panelHeight, setPanelHeight]);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all saved calculations?')) {
      clearAllCalculations();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      className="border-t flex flex-col"
      style={{
        height: panelHeight,
        backgroundColor: currentTheme.surface,
        borderColor: currentTheme.border,
      }}
    >
      {/* Resize Handle */}
      <div
        className="flex items-center justify-center h-2 cursor-ns-resize hover:bg-gray-200 transition-colors"
        onMouseDown={handleResizeStart}
        style={{ backgroundColor: isResizing ? currentTheme.border : 'transparent' }}
      >
        <GripHorizontal size={16} style={{ color: currentTheme.border }} />
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: currentTheme.border }}
      >
        <div className="flex items-center gap-4">
          <h3 className="text-sm font-semibold" style={{ color: currentTheme.text }}>
            Scratchpad
          </h3>

          {/* Tab Buttons */}
          <div
            className="flex rounded-md p-0.5"
            style={{ backgroundColor: currentTheme.border }}
          >
            <button
              onClick={() => setActiveTab('calculations')}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: activeTab === 'calculations' ? currentTheme.surface : 'transparent',
                color: activeTab === 'calculations' ? currentTheme.primary : currentTheme.textSecondary,
              }}
            >
              Calculations ({calculations.length})
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className="px-3 py-1 rounded text-xs font-medium transition-colors"
              style={{
                backgroundColor: activeTab === 'notes' ? currentTheme.surface : 'transparent',
                color: activeTab === 'notes' ? currentTheme.primary : currentTheme.textSecondary,
              }}
            >
              Notes
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'calculations' && calculations.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} />
              Clear All
            </button>
          )}
          <button
            onClick={closeScratchpad}
            className="p-1 rounded transition-colors"
            style={{ color: currentTheme.textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'calculations' ? (
          <div className="space-y-3">
            {calculations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText size={48} style={{ color: currentTheme.border }} className="mb-3" />
                <p className="text-sm font-medium mb-1" style={{ color: currentTheme.text }}>
                  No saved calculations
                </p>
                <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                  Use the "Save to Scratchpad" button in the Calculator to save results here
                </p>
              </div>
            ) : (
              calculations.map(calc => (
                <CalculationCard
                  key={calc.id}
                  calculation={calc}
                  onDelete={deleteCalculation}
                />
              ))
            )}
          </div>
        ) : (
          <div className="h-full">
            <textarea
              value={notes}
              onChange={(e) => updateNotes(e.target.value)}
              className="w-full h-full resize-none rounded-lg border p-3 text-sm outline-none"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
              placeholder="Write your notes here... (auto-saved)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Scratchpad;
