import {useEffect, useMemo, useState} from 'react';
import {AlertCircle, Cable, Cloud, Network as NetworkIcon, Save, Settings, X} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';
import {getHostnameValidationError, getIPValidationError, getSubnetValidationError,} from '../../utils/ipValidation';
import PortConfigRow from './PortConfigRow';

// Provider options for cloud/logical devices
const PROVIDER_OPTIONS = [
  { value: '', label: 'Select Provider...' },
  { value: 'AWS', label: 'AWS' },
  { value: 'Azure', label: 'Microsoft Azure' },
  { value: 'GCP', label: 'Google Cloud Platform' },
  { value: 'OracleCloud', label: 'Oracle Cloud' },
  { value: 'Vultr', label: 'Vultr' },
  { value: 'OnPremise', label: 'On-Premise' },
];

// Connection pathway options
const CONNECTION_PATHWAY_OPTIONS = [
  { value: '', label: 'Select Pathway...' },
  { value: 'VPN', label: 'VPN Tunnel' },
  { value: 'DirectConnect', label: 'Direct Connect / ExpressRoute' },
  { value: 'Peering', label: 'VPC/VNet Peering' },
  { value: 'PublicInternet', label: 'Public Internet' },
  { value: 'PrivateLink', label: 'Private Link / Endpoint' },
];

function NodeConfigPanel() {
  const {currentTheme} = useSettings();
  const {selectedNode, getNodeById, updateNode, clearSelection, updatePortConfig, nodes} = useNetwork();
  const [activeTab, setActiveTab] = useState('general'); // 'general', 'ports', or 'cloud'
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
    // Cloud/Logical device fields
    provider: '',
    region: '',
    instanceType: '',
    cloudAssetLink: '',
    connectionPathway: '',
    vmHost: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const node = selectedNode ? getNodeById(selectedNode) : null;

  // Check if device is logical/cloud type
  const isLogicalDevice = useMemo(() => {
    if (!node?.data?.device) return false;
    const viewType = node.data.device.viewType;
    const hasCloudFields = node.data.device.specifications?.cloudProviderFields;
    return viewType === 'logical' || hasCloudFields;
  }, [node]);

  // Get list of hypervisor nodes for VM host dropdown
  const hypervisorNodes = useMemo(() => {
    return nodes.filter(n =>
      n.data?.device?.category === 'Hypervisors' && n.id !== node?.id
    );
  }, [nodes, node?.id]);

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
        // Cloud/Logical device fields
        provider: node.data.provider || '',
        region: node.data.region || '',
        instanceType: node.data.instanceType || '',
        cloudAssetLink: node.data.cloudAssetLink || '',
        connectionPathway: node.data.connectionPathway || '',
        vmHost: node.data.vmHost || '',
      });
      setErrors({});
      setTouched({});
      setActiveTab('general'); // Reset to general tab when node changes
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

  // Handle port update
  const handlePortUpdate = (portId, updates) => {
    updatePortConfig(node.id, portId, updates);
  };

  const ports = node?.data?.ports || [];
  const portCount = ports.length;
  const connectedPortCount = ports.filter(p => p.connectedTo).length;
  const availablePortCount = ports.filter(p => p.enabled && !p.connectedTo).length;

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

      {/* Tabs */}
      <div className="flex border-b" style={{borderColor: currentTheme.border}}>
        <button
          onClick={() => setActiveTab('general')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'general' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'general' ? currentTheme.primary : currentTheme.textSecondary,
            borderColor: activeTab === 'general' ? currentTheme.primary : 'transparent',
            backgroundColor: activeTab === 'general' ? currentTheme.background : 'transparent'
          }}
        >
          <Settings size={16} />
          General
        </button>
        {isLogicalDevice && (
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'cloud' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'cloud' ? currentTheme.primary : currentTheme.textSecondary,
              borderColor: activeTab === 'cloud' ? currentTheme.primary : 'transparent',
              backgroundColor: activeTab === 'cloud' ? currentTheme.background : 'transparent'
            }}
          >
            <Cloud size={16} />
            Cloud
          </button>
        )}
        <button
          onClick={() => setActiveTab('ports')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'ports' ? 'border-b-2' : ''
          }`}
          style={{
            color: activeTab === 'ports' ? currentTheme.primary : currentTheme.textSecondary,
            borderColor: activeTab === 'ports' ? currentTheme.primary : 'transparent',
            backgroundColor: activeTab === 'ports' ? currentTheme.background : 'transparent'
          }}
        >
          <Cable size={16} />
          Ports
          {portCount > 0 && (
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: currentTheme.primary + '20',
                color: currentTheme.primary
              }}
            >
              {portCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? (
        /* General Tab - Form Fields */
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
      ) : activeTab === 'cloud' ? (
        /* Cloud Tab - Logical device fields */
        <div className="px-4 py-4 space-y-4">
          {/* Provider */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
              Cloud Provider
            </label>
            <select
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
            >
              {PROVIDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
              Region / Zone
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
              placeholder="e.g., us-east-1, eastus, us-central1"
            />
          </div>

          {/* Instance Type */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
              Instance Type / Size
            </label>
            <input
              type="text"
              name="instanceType"
              value={formData.instanceType}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
              placeholder="e.g., t3.medium, Standard_D2s_v3"
            />
          </div>

          {/* Cloud Asset Link */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
              Asset Link / ARN
            </label>
            <input
              type="text"
              name="cloudAssetLink"
              value={formData.cloudAssetLink}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
              placeholder="Console URL or resource ARN"
            />
            {formData.cloudAssetLink && (
              <a
                href={formData.cloudAssetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs mt-1 inline-block"
                style={{color: currentTheme.primary}}
              >
                Open in new tab →
              </a>
            )}
          </div>

          {/* Connection Pathway */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
              Connection Pathway
            </label>
            <select
              name="connectionPathway"
              value={formData.connectionPathway}
              onChange={handleChange}
              className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
              style={{
                backgroundColor: currentTheme.background,
                color: currentTheme.text,
                borderColor: currentTheme.border,
              }}
            >
              {CONNECTION_PATHWAY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* VM Host - only show for VMs and cloud instances */}
          {(node?.data?.device?.type === 'vm' ||
            node?.data?.device?.type === 'container' ||
            node?.data?.device?.type === 'cloudinstance') && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{color: currentTheme.text}}>
                Parent Hypervisor
              </label>
              <select
                name="vmHost"
                value={formData.vmHost}
                onChange={handleChange}
                className="w-full px-2.5 py-1.5 rounded border outline-none text-sm"
                style={{
                  backgroundColor: currentTheme.background,
                  color: currentTheme.text,
                  borderColor: currentTheme.border,
                }}
              >
                <option value="">None (standalone)</option>
                {hypervisorNodes.map(hypervisor => (
                  <option key={hypervisor.id} value={hypervisor.id}>
                    {hypervisor.data.label || hypervisor.data.device?.name}
                  </option>
                ))}
              </select>
              {hypervisorNodes.length === 0 && (
                <p className="text-xs mt-1" style={{color: currentTheme.textSecondary}}>
                  Add a hypervisor to the canvas to link VMs
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Ports Tab */
        <div className="flex flex-col h-full">
          {/* Port Stats */}
          <div className="px-4 py-3 border-b" style={{borderColor: currentTheme.border}}>
            <div className="flex items-center justify-between text-xs">
              <div style={{color: currentTheme.textSecondary}}>
                Total: <span className="font-semibold" style={{color: currentTheme.text}}>{portCount}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span style={{color: currentTheme.textSecondary}}>{availablePortCount} available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span style={{color: currentTheme.textSecondary}}>{connectedPortCount} connected</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ports List */}
          <div className="flex-1 overflow-y-auto">
            {portCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Cable size={48} style={{color: currentTheme.border}} className="mb-3" />
                <div className="text-sm font-medium mb-1" style={{color: currentTheme.text}}>
                  No Ports Available
                </div>
                <div className="text-xs" style={{color: currentTheme.textSecondary}}>
                  This device doesn't have any network ports
                </div>
              </div>
            ) : (
              <div>
                {ports.map(port => (
                  <PortConfigRow
                    key={port.id}
                    node={node}
                    port={port}
                    onUpdate={handlePortUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer - Show save for General and Cloud tabs */}
      {(activeTab === 'general' || activeTab === 'cloud') && (
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
      )}

      {/* Ports tab footer */}
      {activeTab === 'ports' && (
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
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default NodeConfigPanel;