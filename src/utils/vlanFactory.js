// VLAN creation and management utilities

/**
 * Generate unique VLAN ID
 * @returns {string} Unique VLAN identifier
 */
function generateVlanUuid() {
  return `vlan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default VLAN colors for visualization
 */
const DEFAULT_VLAN_COLORS = [
  '#3B82F6',  // Blue
  '#10B981',  // Green
  '#F59E0B',  // Amber
  '#EF4444',  // Red
  '#8B5CF6',  // Purple
  '#EC4899',  // Pink
  '#14B8A6',  // Teal
  '#F97316',  // Orange
  '#6366F1',  // Indigo
  '#84CC16',  // Lime
];

/**
 * Get a color for a VLAN based on its ID
 * @param {number} vlanId - VLAN ID
 * @returns {string} Hex color code
 */
function getDefaultVlanColor(vlanId) {
  return DEFAULT_VLAN_COLORS[vlanId % DEFAULT_VLAN_COLORS.length];
}

/**
 * Validate VLAN ID
 * @param {number} vlanId - VLAN ID to validate
 * @param {Array} existingVlans - Array of existing VLAN objects
 * @returns {object} Validation result { valid, error }
 */
export function validateVlanId(vlanId, existingVlans = []) {
  // Check if it's a number
  const numericVlanId = Number(vlanId);
  if (isNaN(numericVlanId)) {
    return {
      valid: false,
      error: 'VLAN ID must be a number'
    };
  }

  // Check valid range (1-4094)
  if (numericVlanId < 1 || numericVlanId > 4094) {
    return {
      valid: false,
      error: 'VLAN ID must be between 1 and 4094'
    };
  }

  // Check for reserved VLANs (warn but allow)
  let warning = null;
  if (numericVlanId >= 1002 && numericVlanId <= 1005) {
    warning = `VLAN ${numericVlanId} is reserved for Token Ring and FDDI. Use with caution.`;
  }

  // Check for duplicates
  const duplicate = existingVlans.find(vlan => vlan.vlanId === numericVlanId);
  if (duplicate) {
    return {
      valid: false,
      error: `VLAN ${numericVlanId} already exists`
    };
  }

  return {
    valid: true,
    warning
  };
}

/**
 * Create a VLAN object
 * @param {number} vlanId - VLAN ID (1-4094)
 * @param {string} name - VLAN name
 * @param {object} options - Additional VLAN options
 * @returns {object} VLAN object
 */
export function createVlan(vlanId, name, options = {}) {
  const {
    description = '',
    color = null,
    subnet = null
  } = options;

  return {
    id: generateVlanUuid(),
    vlanId: Number(vlanId),
    name: name || `VLAN ${vlanId}`,
    description,
    color: color || getDefaultVlanColor(vlanId),
    subnet: subnet ? {
      network: subnet.network,
      cidr: subnet.cidr,
      mask: subnet.mask || '',
      gateway: subnet.gateway || ''
    } : null,
    createdAt: new Date().toISOString()
  };
}

/**
 * Get default VLAN (VLAN 1)
 * @returns {object} Default VLAN object
 */
export function getDefaultVlan() {
  return createVlan(1, 'Default', {
    description: 'Default VLAN',
    color: '#94A3B8'  // Gray
  });
}

/**
 * Check if a VLAN is the default VLAN
 * @param {object} vlan - VLAN object
 * @returns {boolean} True if default VLAN
 */
export function isDefaultVlan(vlan) {
  return vlan.vlanId === 1;
}

/**
 * Check if a VLAN is reserved
 * @param {number} vlanId - VLAN ID
 * @returns {boolean} True if reserved
 */
export function isReservedVlan(vlanId) {
  return (vlanId >= 1002 && vlanId <= 1005) || vlanId === 1;
}

/**
 * Format VLAN list as string (e.g., [10,20,30,31,32,40] => "10,20,30-32,40")
 * @param {Array} vlanIds - Array of VLAN IDs
 * @returns {string} Formatted VLAN list string
 */
export function formatVlanList(vlanIds) {
  if (!vlanIds || vlanIds.length === 0) {
    return '';
  }

  const sorted = [...vlanIds].sort((a, b) => a - b);
  const ranges = [];
  let rangeStart = sorted[0];
  let rangeEnd = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === rangeEnd + 1) {
      // Continue range
      rangeEnd = sorted[i];
    } else {
      // End current range
      if (rangeStart === rangeEnd) {
        ranges.push(`${rangeStart}`);
      } else if (rangeEnd === rangeStart + 1) {
        ranges.push(`${rangeStart},${rangeEnd}`);
      } else {
        ranges.push(`${rangeStart}-${rangeEnd}`);
      }
      rangeStart = sorted[i];
      rangeEnd = sorted[i];
    }
  }

  // Add final range
  if (rangeStart === rangeEnd) {
    ranges.push(`${rangeStart}`);
  } else if (rangeEnd === rangeStart + 1) {
    ranges.push(`${rangeStart},${rangeEnd}`);
  } else {
    ranges.push(`${rangeStart}-${rangeEnd}`);
  }

  return ranges.join(',');
}

