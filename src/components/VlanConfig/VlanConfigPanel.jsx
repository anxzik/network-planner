import {useState} from 'react';
import {Network as NetworkIcon, Plus, Search, X} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';
import VlanCard from './VlanCard';
import VlanEditor from './VlanEditor';
import {isDefaultVlan} from '../../utils/vlanFactory';

function VlanConfigPanel({ isOpen, onClose }) {
  const { currentTheme } = useSettings();
  const { vlans, deleteVlan, nodes } = useNetwork();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('create');
  const [selectedVlan, setSelectedVlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmVlan, setDeleteConfirmVlan] = useState(null);

  if (!isOpen) return null;

  // Filter VLANs by search
  const filteredVlans = vlans.filter(vlan =>
    vlan.vlanId.toString().includes(searchTerm) ||
    vlan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vlan.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort VLANs by ID
  const sortedVlans = [...filteredVlans].sort((a, b) => a.vlanId - b.vlanId);

  const handleCreateNew = () => {
    setEditorMode('create');
    setSelectedVlan(null);
    setEditorOpen(true);
  };

  const handleEdit = (vlan) => {
    setEditorMode('edit');
    setSelectedVlan(vlan);
    setEditorOpen(true);
  };

  const handleDelete = (vlan) => {
    if (isDefaultVlan(vlan)) return;
    setDeleteConfirmVlan(vlan);
  };

  const confirmDelete = () => {
    if (deleteConfirmVlan) {
      deleteVlan(deleteConfirmVlan.id);
      setDeleteConfirmVlan(null);
    }
  };

  return (
    <>
      {/* Main Panel */}
      <div
        className="absolute top-0 left-0 h-full w-80 border-r shadow-lg overflow-hidden flex flex-col"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{
            backgroundColor: currentTheme.surface,
            borderColor: currentTheme.border,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="p-1.5 rounded"
              style={{ backgroundColor: currentTheme.primary + '20' }}
            >
              <NetworkIcon size={16} style={{ color: currentTheme.primary }} />
            </div>
            <h3 className="font-semibold text-sm" style={{ color: currentTheme.text }}>
              VLAN Management
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: currentTheme.textSecondary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: currentTheme.border }}
        >
          <div className="flex items-center justify-between text-xs">
            <div style={{ color: currentTheme.textSecondary }}>
              Total VLANs: <span className="font-semibold" style={{ color: currentTheme.text }}>{vlans.length}</span>
            </div>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white transition-colors"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Plus size={14} />
              New VLAN
            </button>
          </div>
        </div>

        {/* Search */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: currentTheme.border }}
        >
          <div className="relative">
            <Search
              className="absolute left-2.5 top-2"
              size={16}
              style={{ color: currentTheme.textSecondary }}
            />
            <input
              type="text"
              placeholder="Search VLANs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
            />
          </div>
        </div>

        {/* VLAN List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sortedVlans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <NetworkIcon
                size={48}
                style={{ color: currentTheme.border }}
                className="mb-3"
              />
              <div className="text-sm font-medium mb-1" style={{ color: currentTheme.text }}>
                {searchTerm ? 'No VLANs Found' : 'No VLANs Yet'}
              </div>
              <div className="text-xs mb-3" style={{ color: currentTheme.textSecondary }}>
                {searchTerm
                  ? 'Try a different search term'
                  : 'Create your first VLAN to get started'
                }
              </div>
              {!searchTerm && (
                <button
                  onClick={handleCreateNew}
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  <Plus size={14} />
                  Create VLAN
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedVlans.map(vlan => (
                <VlanCard
                  key={vlan.id}
                  vlan={vlan}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VLAN Editor Modal */}
      <VlanEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        vlan={selectedVlan}
        mode={editorMode}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmVlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete VLAN {deleteConfirmVlan.vlanId}?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirmVlan.name}</strong>?
              This action cannot be undone.
            </p>

            {/* Warning if ports are assigned */}
            {(() => {
              const portCount = nodes.reduce((count, node) => {
                const portsInVlan = node.data?.ports?.filter(p =>
                  p.assignedVlans.includes(deleteConfirmVlan.vlanId)
                ) || [];
                return count + portsInVlan.length;
              }, 0);

              if (portCount > 0) {
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                    <div className="text-sm font-medium text-amber-900 mb-1">
                      Warning
                    </div>
                    <div className="text-xs text-amber-700">
                      This VLAN is assigned to {portCount} port{portCount !== 1 ? 's' : ''}.
                      Deleting it may affect network connectivity.
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmVlan(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete VLAN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default VlanConfigPanel;
