import {useState} from 'react';
import {Edit2, Plus, Search, Trash2} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';
import NetworkObjectForm from './NetworkObjectForm';

function ListView() {
  const {currentTheme} = useSettings();
  const {networkObjects, addNetworkObject, updateNetworkObject, deleteNetworkObject} = useNetwork();
  const [showForm, setShowForm] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter network objects based on search query
  const filteredObjects = networkObjects.filter((obj) => {
    const query = searchQuery.toLowerCase();
    return (
      obj.displayName?.toLowerCase().includes(query) ||
      obj.ip?.toLowerCase().includes(query) ||
      obj.hostname?.toLowerCase().includes(query)
    );
  });

  // Handle create new
  const handleCreate = () => {
    setEditingObject(null);
    setShowForm(true);
  };

  // Handle edit
  const handleEdit = (obj) => {
    setEditingObject(obj);
    setShowForm(true);
  };

  // Handle save
  const handleSave = (data) => {
    if (editingObject) {
      updateNetworkObject(data.id, data);
    } else {
      addNetworkObject(data);
    }
    setShowForm(false);
    setEditingObject(null);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this network object?')) {
      deleteNetworkObject(id);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingObject(null);
  };

  return (
    <div className="flex flex-col h-full" style={{backgroundColor: currentTheme.background}}>
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold" style={{color: currentTheme.text}}>
            Network Objects
          </h2>
          <div
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: currentTheme.border,
              color: currentTheme.textSecondary,
            }}
          >
            {filteredObjects.length} {filteredObjects.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{color: currentTheme.textSecondary}}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-2 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
                width: '250px',
              }}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
            style={{backgroundColor: currentTheme.primary}}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <Plus size={16} />
            Create
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredObjects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="text-6xl mb-4"
                style={{color: currentTheme.border}}
              >
                📋
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{color: currentTheme.text}}
              >
                {searchQuery ? 'No results found' : 'No network objects yet'}
              </h3>
              <p
                className="text-sm mb-4"
                style={{color: currentTheme.textSecondary}}
              >
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create your first network object to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
                  style={{backgroundColor: currentTheme.primary}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <Plus size={16} />
                  Create Network Object
                </button>
              )}
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr
                className="border-b"
                style={{
                  backgroundColor: currentTheme.surface,
                  borderColor: currentTheme.border,
                }}
              >
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{color: currentTheme.textSecondary}}
                >
                  Display Name
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{color: currentTheme.textSecondary}}
                >
                  IP Address
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{color: currentTheme.textSecondary}}
                >
                  Subnet
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{color: currentTheme.textSecondary}}
                >
                  Hostname
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{color: currentTheme.textSecondary}}
                >
                  Nameservers
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                  style={{color: currentTheme.textSecondary}}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((obj, index) => (
                <tr
                  key={obj.id}
                  className="border-b transition-colors"
                  style={{
                    borderColor: currentTheme.border,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = currentTheme.border + '30';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td className="px-6 py-4">
                    <div
                      className="text-sm font-medium"
                      style={{color: currentTheme.text}}
                    >
                      {obj.displayName}
                    </div>
                    {obj.notes && (
                      <div
                        className="text-xs mt-1 truncate max-w-xs"
                        style={{color: currentTheme.textSecondary}}
                      >
                        {obj.notes}
                      </div>
                    )}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-mono"
                    style={{color: currentTheme.text}}
                  >
                    {obj.ip || '-'}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-mono"
                    style={{color: currentTheme.text}}
                  >
                    {obj.subnet || '-'}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{color: currentTheme.text}}
                  >
                    {obj.hostname || '-'}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-mono"
                    style={{color: currentTheme.text}}
                  >
                    {obj.nameserver1 || obj.nameserver2 ? (
                      <div className="space-y-0.5">
                        {obj.nameserver1 && <div>{obj.nameserver1}</div>}
                        {obj.nameserver2 && <div>{obj.nameserver2}</div>}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(obj)}
                        className="p-1.5 rounded transition-colors"
                        style={{color: currentTheme.textSecondary}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = currentTheme.border;
                          e.currentTarget.style.color = currentTheme.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = currentTheme.textSecondary;
                        }}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(obj.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{color: currentTheme.textSecondary}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = currentTheme.border;
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = currentTheme.textSecondary;
                        }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <NetworkObjectForm
          networkObject={editingObject}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default ListView;