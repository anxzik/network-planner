import {useEffect, useState} from 'react';
import {AlertCircle, Save, X} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {getHostnameValidationError, getIPValidationError, getSubnetValidationError,} from '../../utils/ipValidation';

function NetworkObjectForm({networkObject, onSave, onCancel}) {
  const {currentTheme} = useSettings();
  const [formData, setFormData] = useState({
    displayName: '',
    ip: '',
    subnet: '',
    hostname: '',
    nameserver1: '',
    nameserver2: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate form with existing data if editing
  useEffect(() => {
    if (networkObject) {
      setFormData({
        displayName: networkObject.displayName || '',
        ip: networkObject.ip || '',
        subnet: networkObject.subnet || '',
        hostname: networkObject.hostname || '',
        nameserver1: networkObject.nameserver1 || '',
        nameserver2: networkObject.nameserver2 || '',
        notes: networkObject.notes || '',
      });
    }
  }, [networkObject]);

  // Validate field
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'displayName':
        if (!value.trim()) {
          error = 'Display Name is required';
        }
        break;
      case 'ip':
        if (value.trim()) {
          error = getIPValidationError(value, 'ipv4');
        }
        break;
      case 'subnet':
        if (value.trim()) {
          error = getSubnetValidationError(value);
        }
        break;
      case 'hostname':
        if (value.trim()) {
          error = getHostnameValidationError(value);
        }
        break;
      case 'nameserver1':
      case 'nameserver2':
        if (value.trim()) {
          error = getIPValidationError(value, 'ipv4');
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Handle input change
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({...prev, [name]: error}));
    }
  };

  // Handle field blur
  const handleBlur = (e) => {
    const {name, value} = e.target;
    setTouched((prev) => ({...prev, [name]: true}));

    // Validate on blur
    const error = validateField(name, value);
    setErrors((prev) => ({...prev, [name]: error}));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({...acc, [key]: true}), {})
    );

    if (!hasErrors) {
      onSave({
        ...formData,
        id: networkObject?.id || Date.now().toString(),
        createdAt: networkObject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
      onClick={onCancel}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        style={{backgroundColor: currentTheme.surface}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{borderColor: currentTheme.border}}
        >
          <h2
            className="text-xl font-bold"
            style={{color: currentTheme.text}}
          >
            {networkObject ? 'Edit Network Object' : 'Create Network Object'}
          </h2>
          <button
            onClick={onCancel}
            className="p-1 rounded transition-colors"
            style={{color: currentTheme.textSecondary}}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = currentTheme.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="px-6 py-4 overflow-y-auto" style={{maxHeight: 'calc(90vh - 140px)'}}>
            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  Display Name <span style={{color: '#ef4444'}}>*</span>
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: errors.displayName && touched.displayName ? '#ef4444' : currentTheme.border,
                  }}
                  placeholder="e.g., Main Office Network"
                />
                {errors.displayName && touched.displayName && (
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
                    <AlertCircle size={12} />
                    {errors.displayName}
                  </div>
                )}
              </div>

              {/* IP Address */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  IP Address
                </label>
                <input
                  type="text"
                  name="ip"
                  value={formData.ip}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: errors.ip && touched.ip ? '#ef4444' : currentTheme.border,
                  }}
                  placeholder="e.g., 192.168.1.1"
                />
                {errors.ip && touched.ip && (
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
                    <AlertCircle size={12} />
                    {errors.ip}
                  </div>
                )}
              </div>

              {/* Subnet Mask */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  Subnet Mask
                </label>
                <input
                  type="text"
                  name="subnet"
                  value={formData.subnet}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: errors.subnet && touched.subnet ? '#ef4444' : currentTheme.border,
                  }}
                  placeholder="e.g., 255.255.255.0"
                />
                {errors.subnet && touched.subnet && (
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
                    <AlertCircle size={12} />
                    {errors.subnet}
                  </div>
                )}
              </div>

              {/* Hostname */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  Hostname
                </label>
                <input
                  type="text"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: errors.hostname && touched.hostname ? '#ef4444' : currentTheme.border,
                  }}
                  placeholder="e.g., router.company.local"
                />
                {errors.hostname && touched.hostname && (
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
                    <AlertCircle size={12} />
                    {errors.hostname}
                  </div>
                )}
              </div>

              {/* Nameserver 1 */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  Nameserver 1
                </label>
                <input
                  type="text"
                  name="nameserver1"
                  value={formData.nameserver1}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: errors.nameserver1 && touched.nameserver1 ? '#ef4444' : currentTheme.border,
                  }}
                  placeholder="e.g., 8.8.8.8"
                />
                {errors.nameserver1 && touched.nameserver1 && (
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
                    <AlertCircle size={12} />
                    {errors.nameserver1}
                  </div>
                )}
              </div>

              {/* Nameserver 2 */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  Nameserver 2
                </label>
                <input
                  type="text"
                  name="nameserver2"
                  value={formData.nameserver2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: errors.nameserver2 && touched.nameserver2 ? '#ef4444' : currentTheme.border,
                  }}
                  placeholder="e.g., 8.8.4.4"
                />
                {errors.nameserver2 && touched.nameserver2 && (
                  <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
                    <AlertCircle size={12} />
                    {errors.nameserver2}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{color: currentTheme.text}}
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 rounded border outline-none resize-none"
                  style={{
                    backgroundColor: currentTheme.background,
                    color: currentTheme.text,
                    borderColor: currentTheme.border,
                  }}
                  placeholder="Additional notes or comments..."
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{borderColor: currentTheme.border}}
          >
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded text-sm font-medium transition-colors"
              style={{
                color: currentTheme.text,
                backgroundColor: currentTheme.border,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium text-white transition-colors"
              style={{
                backgroundColor: currentTheme.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Save size={16} />
              {networkObject ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NetworkObjectForm;
