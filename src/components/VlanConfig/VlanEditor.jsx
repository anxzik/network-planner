import {useEffect, useState} from 'react';
import {AlertCircle, Save, X} from 'lucide-react';
import {useNetwork} from '../../context/NetworkContext';
import {createVlan, validateVlanId} from '../../utils/vlanFactory';
import {isValidIPv4, isValidSubnetMask, maskToCIDR} from '../../utils/ipValidation';

function VlanEditor({ isOpen, onClose, vlan = null, mode = 'create' }) {
  const { vlans, addVlan, updateVlan: updateExistingVlan } = useNetwork();

  const [formData, setFormData] = useState({
    vlanId: '',
    name: '',
    description: '',
    color: '#3B82F6',
    // Subnet configuration (optional)
    hasSubnet: false,
    network: '',
    cidr: '',
    mask: '',
    gateway: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && vlan) {
        setFormData({
          vlanId: vlan.vlanId.toString(),
          name: vlan.name,
          description: vlan.description || '',
          color: vlan.color,
          hasSubnet: !!vlan.subnet,
          network: vlan.subnet?.network || '',
          cidr: vlan.subnet?.cidr ? vlan.subnet.cidr.toString() : '',
          mask: vlan.subnet?.mask || '',
          gateway: vlan.subnet?.gateway || ''
        });
      } else {
        // Reset for create
        setFormData({
          vlanId: '',
          name: '',
          description: '',
          color: '#3B82F6',
          hasSubnet: false,
          network: '',
          cidr: '',
          mask: '',
          gateway: ''
        });
      }
      setErrors({});
      setTouched({});
    }
  }, [isOpen, mode, vlan]);

  const validateField = (name, value) => {
    let error = null;

    switch (name) {
      case 'vlanId':
        if (!value) {
          error = 'VLAN ID is required';
        } else {
          // Exclude current VLAN when editing
          const existingVlans = mode === 'edit'
            ? vlans.filter(v => v.id !== vlan.id)
            : vlans;
          const validation = validateVlanId(value, existingVlans);
          if (!validation.valid) {
            error = validation.error;
          }
        }
        break;

      case 'name':
        if (!value.trim()) {
          error = 'VLAN name is required';
        }
        break;

      case 'network':
        if (formData.hasSubnet && value.trim()) {
          if (!isValidIPv4(value)) {
            error = 'Invalid network address';
          }
        }
        break;

      case 'cidr':
        if (formData.hasSubnet && value) {
          const cidrNum = Number(value);
          if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
            error = 'CIDR must be between 0 and 32';
          }
        }
        break;

      case 'mask':
        if (formData.hasSubnet && value.trim()) {
          if (!isValidSubnetMask(value)) {
            error = 'Invalid subnet mask';
          }
        }
        break;

      case 'gateway':
        if (formData.hasSubnet && value.trim()) {
          if (!isValidIPv4(value)) {
            error = 'Invalid gateway address';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Auto-sync CIDR <-> Mask
  const handleCidrChange = (e) => {
    const cidr = e.target.value;
    setFormData(prev => ({
      ...prev,
      cidr,
      mask: cidr && !isNaN(cidr) ? cidrToMask(parseInt(cidr)) : ''
    }));

    if (touched.cidr) {
      const error = validateField('cidr', cidr);
      setErrors(prev => ({ ...prev, cidr: error }));
    }
  };

  const handleMaskChange = (e) => {
    const mask = e.target.value;
    setFormData(prev => ({
      ...prev,
      mask,
      cidr: mask && isValidSubnetMask(mask) ? maskToCIDR(mask).toString() : prev.cidr
    }));

    if (touched.mask) {
      const error = validateField('mask', mask);
      setErrors(prev => ({ ...prev, mask: error }));
    }
  };

  // Simple CIDR to mask conversion
  const cidrToMask = (cidr) => {
    if (cidr < 0 || cidr > 32) return '';
    const mask = ~(2 ** (32 - cidr) - 1);
    return [
      (mask >>> 24) & 255,
      (mask >>> 16) & 255,
      (mask >>> 8) & 255,
      mask & 255
    ].join('.');
  };

  const handleSave = () => {
    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    ['vlanId', 'name', 'network', 'cidr', 'mask', 'gateway'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched({
      vlanId: true,
      name: true,
      network: true,
      cidr: true,
      mask: true,
      gateway: true
    });

    if (hasErrors) return;

    // Build VLAN object
    const vlanData = {
      vlanId: parseInt(formData.vlanId),
      name: formData.name,
      description: formData.description,
      color: formData.color,
      subnet: formData.hasSubnet && formData.network && (formData.cidr || formData.mask)
        ? {
            network: formData.network,
            cidr: parseInt(formData.cidr),
            mask: formData.mask,
            gateway: formData.gateway
          }
        : null
    };

    if (mode === 'create') {
      const newVlan = createVlan(vlanData.vlanId, vlanData.name, {
        description: vlanData.description,
        color: vlanData.color,
        subnet: vlanData.subnet
      });
      addVlan(newVlan);
    } else {
      updateExistingVlan(vlan.id, vlanData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'create' ? 'Create New VLAN' : 'Edit VLAN'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* VLAN ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              VLAN ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="vlanId"
              value={formData.vlanId}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={mode === 'edit'}
              min="1"
              max="4094"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="e.g., 10"
            />
            {errors.vlanId && touched.vlanId && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={12} />
                {errors.vlanId}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Valid range: 1-4094 (Reserved: 1002-1005)
            </div>
          </div>

          {/* VLAN Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              VLAN Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Management"
            />
            {errors.name && touched.name && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={12} />
                {errors.name}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional description..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Color (for logical view)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          {/* Subnet Configuration Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="hasSubnet"
                checked={formData.hasSubnet}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Configure IP Subnet
              </span>
            </label>
          </div>

          {/* Subnet Fields (conditional) */}
          {formData.hasSubnet && (
            <div className="space-y-4 pl-6 border-l-2 border-blue-200">
              {/* Network Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Network Address
                </label>
                <input
                  type="text"
                  name="network"
                  value={formData.network}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="e.g., 192.168.10.0"
                />
                {errors.network && touched.network && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <AlertCircle size={12} />
                    {errors.network}
                  </div>
                )}
              </div>

              {/* CIDR / Subnet Mask */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    CIDR
                  </label>
                  <input
                    type="number"
                    name="cidr"
                    value={formData.cidr}
                    onChange={handleCidrChange}
                    onBlur={handleBlur}
                    min="0"
                    max="32"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="24"
                  />
                  {errors.cidr && touched.cidr && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <AlertCircle size={12} />
                      {errors.cidr}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subnet Mask
                  </label>
                  <input
                    type="text"
                    name="mask"
                    value={formData.mask}
                    onChange={handleMaskChange}
                    onBlur={handleBlur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="255.255.255.0"
                  />
                  {errors.mask && touched.mask && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                      <AlertCircle size={12} />
                      {errors.mask}
                    </div>
                  )}
                </div>
              </div>

              {/* Gateway */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Gateway (Optional)
                </label>
                <input
                  type="text"
                  name="gateway"
                  value={formData.gateway}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="e.g., 192.168.10.1"
                />
                {errors.gateway && touched.gateway && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                    <AlertCircle size={12} />
                    {errors.gateway}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save size={16} />
            {mode === 'create' ? 'Create VLAN' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VlanEditor;
