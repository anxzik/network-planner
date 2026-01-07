import {useEffect, useState} from 'react';
import {AlertCircle, Network as NetworkIcon, Save, X} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';
import {getHostnameValidationError, getIPValidationError, getSubnetValidationError,} from '../../utils/ipValidation';

function NodeConfigPanel() {
  const {currentTheme} = useSettings();
  const {selectedNode, getNodeById, updateNode, clearSelection} = useNetwork();
  const [formData, setFormData] = useState({
    label: '',
    ipv4: '',
    subnet: '',
    ipv6: '',
    gateway: '',
    dns1: '',
    dns2: '',
    fqdn: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const node = selectedNode ? getNodeById(selectedNode) : null;

  // Update form when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label || '',
        ipv4: node.data.ipv4 || '',
        subnet: node.data.subnet || '',
        ipv6: node.data.ipv6 || '',
        gateway: node.data.gateway || '',
        dns1: node.data.dns1 || '',
        dns2: node.data.dns2 || '',
        fqdn: node.data.fqdn || '',
        notes: node.data.notes || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [node]);

  if (!node) {
    return null;
  }

  // Validate field
  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'label':
        if (!value.trim()) {
          error = 'Label is required';
        }
        break;
      case 'ipv4':
        if (value.trim()) {
          error = getIPValidationError(value, 'ipv4');
        }
        break;
      case 'subnet':
        if (value.trim()) {
          error = getSubnetValidationError(value);
        }
        break;
      case 'ipv6':
        if (value.trim()) {
          error = getIPValidationError(value, 'ipv6');
        }
        break;
      case 'gateway':
      case 'dns1':
      case 'dns2':
        if (value.trim()) {
          error = getIPValidationError(value, 'ipv4');
        }
        break;
      case 'fqdn':
        if (value.trim()) {
          error = getHostnameValidationError(value);
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

  // Handle save
  const handleSave = () => {
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
      updateNode(node.id, formData);
      clearSelection();
    }
  };

  // Handle close
  const handleClose = () => {
    clearSelection();
  };

  return (
    <div
      className="absolute top-0 right-0 h-full w-80 border-l shadow-lg overflow-y-auto"
      style={{
        backgroundColor: currentTheme.surface,
        borderColor: currentTheme.border,
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded"
            style={{backgroundColor: currentTheme.primary + '20'}}
          >
            <NetworkIcon size={16} style={{color: currentTheme.primary}} />
          </div>
          <h3 className="font-semibold text-sm" style={{color: currentTheme.text}}>
            Configure Device
          </h3>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded transition-colors"
          style={{color: currentTheme.textSecondary}}
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

      {/* Device Info */}
      <div className="px-4 py-3 border-b" style={{borderColor: currentTheme.border}}>
        <div className="text-xs font-medium mb-1" style={{color: currentTheme.textSecondary}}>
          Device Type
        </div>
        <div className="text-sm font-medium" style={{color: currentTheme.text}}>
          {node.data.device?.name || 'Unknown Device'}
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-4 py-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            Device Label <span style={{color: '#ef4444'}}>*</span>
          </label>
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.label && touched.label ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., Core Router"
          />
          {errors.label && touched.label && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.label}
            </div>
          )}
        </div>

        {/* IPv4 Address */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            IPv4 Address
          </label>
          <input
            type="text"
            name="ipv4"
            value={formData.ipv4}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm font-mono"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.ipv4 && touched.ipv4 ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., 192.168.1.1"
          />
          {errors.ipv4 && touched.ipv4 && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.ipv4}
            </div>
          )}
        </div>

        {/* Subnet Mask */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            Subnet Mask
          </label>
          <input
            type="text"
            name="subnet"
            value={formData.subnet}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm font-mono"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.subnet && touched.subnet ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., 255.255.255.0"
          />
          {errors.subnet && touched.subnet && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.subnet}
            </div>
          )}
        </div>

        {/* Gateway */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            Gateway
          </label>
          <input
            type="text"
            name="gateway"
            value={formData.gateway}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm font-mono"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.gateway && touched.gateway ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., 192.168.1.254"
          />
          {errors.gateway && touched.gateway && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.gateway}
            </div>
          )}
        </div>

        {/* DNS 1 */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            DNS Server 1
          </label>
          <input
            type="text"
            name="dns1"
            value={formData.dns1}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm font-mono"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.dns1 && touched.dns1 ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., 8.8.8.8"
          />
          {errors.dns1 && touched.dns1 && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.dns1}
            </div>
          )}
        </div>

        {/* DNS 2 */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            DNS Server 2
          </label>
          <input
            type="text"
            name="dns2"
            value={formData.dns2}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm font-mono"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.dns2 && touched.dns2 ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., 8.8.4.4"
          />
          {errors.dns2 && touched.dns2 && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.dns2}
            </div>
          )}
        </div>

        {/* FQDN */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            FQDN
          </label>
          <input
            type="text"
            name="fqdn"
            value={formData.fqdn}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.fqdn && touched.fqdn ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., router.company.local"
          />
          {errors.fqdn && touched.fqdn && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.fqdn}
            </div>
          )}
        </div>

        {/* IPv6 Address (optional, collapsed by default) */}
        <details>
          <summary
            className="text-xs font-medium cursor-pointer mb-1.5"
            style={{color: currentTheme.textSecondary}}
          >
            IPv6 Address (Optional)
          </summary>
          <input
            type="text"
            name="ipv6"
            value={formData.ipv6}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full px-2.5 py-1.5 rounded border outline-none text-sm font-mono mt-1.5"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: errors.ipv6 && touched.ipv6 ? '#ef4444' : currentTheme.border,
            }}
            placeholder="e.g., 2001:db8::1"
          />
          {errors.ipv6 && touched.ipv6 && (
            <div className="flex items-center gap-1 mt-1 text-xs" style={{color: '#ef4444'}}>
              <AlertCircle size={10} />
              {errors.ipv6}
            </div>
          )}
        </details>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-2.5 py-1.5 rounded border outline-none resize-none text-sm"
            style={{
              backgroundColor: currentTheme.background,
              color: currentTheme.text,
              borderColor: currentTheme.border,
            }}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      {/* Footer */}
      <div
        className="sticky bottom-0 flex items-center justify-end gap-2 px-4 py-3 border-t"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: currentTheme.border,
        }}
      >
        <button
          onClick={handleClose}
          className="px-3 py-1.5 rounded text-xs font-medium transition-colors"
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
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-colors"
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
          <Save size={14} />
          Save
        </button>
      </div>
    </div>
  );
}

export default NodeConfigPanel;