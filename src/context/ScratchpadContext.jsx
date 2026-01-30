import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {debounce, loadData, saveData} from '../utils/storage';

// Create the context
const ScratchpadContext = createContext(null);

// Provider component
export function ScratchpadProvider({ children }) {
  // Scratchpad visibility and height
  const [isOpen, setIsOpen] = useState(() => loadData('scratchpad_isOpen', false));
  const [panelHeight, setPanelHeight] = useState(() => loadData('scratchpad_height', 300));

  // Notes content
  const [notes, setNotes] = useState(() => loadData('scratchpad_notes', ''));

  // Saved calculations
  const [calculations, setCalculations] = useState(() => loadData('scratchpad_calculations', []));

  // Persistors (debounced)
  const persistIsOpen = useMemo(() => debounce((value) => saveData('scratchpad_isOpen', value), 300), []);
  const persistHeight = useMemo(() => debounce((value) => saveData('scratchpad_height', value), 300), []);
  const persistNotes = useMemo(() => debounce((value) => saveData('scratchpad_notes', value), 500), []);
  const persistCalculations = useMemo(() => debounce((value) => saveData('scratchpad_calculations', value), 300), []);

  // Persist state changes
  useEffect(() => { persistIsOpen(isOpen); }, [isOpen, persistIsOpen]);
  useEffect(() => { persistHeight(panelHeight); }, [panelHeight, persistHeight]);
  useEffect(() => { persistNotes(notes); }, [notes, persistNotes]);
  useEffect(() => { persistCalculations(calculations); }, [calculations, persistCalculations]);

  // Toggle scratchpad visibility
  const toggleScratchpad = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Open scratchpad
  const openScratchpad = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close scratchpad
  const closeScratchpad = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Update notes
  const updateNotes = useCallback((newNotes) => {
    setNotes(newNotes);
  }, []);

  // Add a new calculation
  const addCalculation = useCallback((calculation) => {
    const newCalc = {
      id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: Date.now(),
      ...calculation,
    };
    setCalculations(prev => [newCalc, ...prev]);
    // Auto-open scratchpad when adding a calculation
    setIsOpen(true);
    return newCalc;
  }, []);

  // Update an existing calculation
  const updateCalculation = useCallback((calcId, updates) => {
    setCalculations(prev =>
      prev.map(calc =>
        calc.id === calcId
          ? { ...calc, ...updates, updatedAt: Date.now() }
          : calc
      )
    );
  }, []);

  // Delete a calculation
  const deleteCalculation = useCallback((calcId) => {
    setCalculations(prev => prev.filter(calc => calc.id !== calcId));
  }, []);

  // Clear all calculations
  const clearAllCalculations = useCallback(() => {
    setCalculations([]);
  }, []);

  // Get calculation by ID
  const getCalculationById = useCallback((calcId) => {
    return calculations.find(calc => calc.id === calcId);
  }, [calculations]);

  // Export scratchpad data
  const exportScratchpad = useCallback(() => {
    return {
      notes,
      calculations,
      exportedAt: new Date().toISOString(),
    };
  }, [notes, calculations]);

  // Import scratchpad data
  const importScratchpad = useCallback((data) => {
    if (data.notes !== undefined) {
      setNotes(data.notes);
    }
    if (Array.isArray(data.calculations)) {
      setCalculations(data.calculations);
    }
  }, []);

  // Context value
  const value = {
    // State
    isOpen,
    panelHeight,
    notes,
    calculations,

    // Actions
    toggleScratchpad,
    openScratchpad,
    closeScratchpad,
    setPanelHeight,
    updateNotes,
    addCalculation,
    updateCalculation,
    deleteCalculation,
    clearAllCalculations,
    getCalculationById,
    exportScratchpad,
    importScratchpad,

    // Stats
    calculationCount: calculations.length,
  };

  return (
    <ScratchpadContext.Provider value={value}>
      {children}
    </ScratchpadContext.Provider>
  );
}

// Custom hook to use the scratchpad context
// eslint-disable-next-line react-refresh/only-export-components
export function useScratchpad() {
  const context = useContext(ScratchpadContext);
  if (!context) {
    throw new Error('useScratchpad must be used within a ScratchpadProvider');
  }
  return context;
}
