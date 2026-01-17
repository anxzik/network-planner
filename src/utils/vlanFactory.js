// VLAN creation and management utilities

/**
 * Generate unique VLAN ID
 * @returns {string} Unique VLAN identifier
 */
export function generateVlanUuid() {
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
export function getDefaultVlanColor(vlanId) {
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
 * Validate VLAN subnet configuration
 * @param {object} subnet - Subnet object { network, cidr, mask, gateway }
 * @returns {object} Validation result { valid, error }
 */
export function validateVlanSubnet(subnet) {
  if (!subnet) {
    return { valid: true };  // Subnet is optional
  }

  // Basic validation - network and cidr are required if subnet is provided
  if (!subnet.network) {
    return {
      valid: false,
      error: 'Network address is required for subnet configuration'
    };
  }

  if (!subnet.cidr && !subnet.mask) {
    return {
      valid: false,
      error: 'Either CIDR or subnet mask is required'
    };
  }

  // Validate network address format (basic IPv4 check)
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(subnet.network)) {
    return {
      valid: false,
      error: 'Invalid network address format'
    };
  }

  // Validate CIDR if provided
  if (subnet.cidr !== undefined) {
    const cidr = Number(subnet.cidr);
    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return {
        valid: false,
        error: 'CIDR must be between 0 and 32'
      };
    }
  }

  // Validate gateway if provided
  if (subnet.gateway && !ipv4Regex.test(subnet.gateway)) {
    return {
      valid: false,
      error: 'Invalid gateway address format'
    };
  }

  return { valid: true };
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
 * Update VLAN object
 * @param {object} vlan - Existing VLAN object
 * @param {object} updates - Properties to update
 * @returns {object} Updated VLAN object
 */
export function updateVlan(vlan, updates) {
  return {
    ...vlan,
    ...updates,
    updatedAt: new Date().toISOString()
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
 * Get VLAN name suggestions based on common use cases
 * @param {number} vlanId - VLAN ID
 * @returns {Array} Array of suggested names
 */
export function getVlanNameSuggestions(vlanId) {
  const suggestions = {
    1: ['Default', 'Native'],
    10: ['Management', 'Admin', 'MGMT'],
    20: ['Data', 'Users', 'Workstations'],
    30: ['Voice', 'VoIP', 'Phones'],
    40: ['Guest', 'Guest Network', 'Visitors'],
    50: ['DMZ', 'Public Servers', 'Web'],
    99: ['Management', 'Network Management'],
    100: ['Servers', 'Server Network', 'Production'],
    200: ['Wireless', 'WiFi', 'WLAN'],
    666: ['Quarantine', 'Isolation', 'Blocked'],
    999: ['Reserved', 'Unused']
  };

  return suggestions[vlanId] || [`VLAN ${vlanId}`];
}

/**
 * Parse VLAN list string (e.g., "10,20,30-40")
 * @param {string} vlanListString - VLAN list string
 * @returns {Array} Array of VLAN IDs
 */
export function parseVlanList(vlanListString) {
  if (!vlanListString || typeof vlanListString !== 'string') {
    return [];
  }

  const vlans = new Set();
  const parts = vlanListString.split(',').map(s => s.trim());

  parts.forEach(part => {
    if (part.includes('-')) {
      // Range (e.g., "30-40")
      const [start, end] = part.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          if (i >= 1 && i <= 4094) {
            vlans.add(i);
          }
        }
      }
    } else {
      // Single VLAN
      const vlanId = Number(part);
      if (!isNaN(vlanId) && vlanId >= 1 && vlanId <= 4094) {
        vlans.add(vlanId);
      }
    }
  });

  return Array.from(vlans).sort((a, b) => a - b);
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

/**
 * Check if two VLAN ranges overlap
 * @param {Array} vlans1 - First VLAN array
 * @param {Array} vlans2 - Second VLAN array
 * @returns {Array} Array of overlapping VLAN IDs
 */
export function getVlanOverlap(vlans1, vlans2) {
  return vlans1.filter(vlan => vlans2.includes(vlan));
}

/**
 * Validate native VLAN configuration
 * @param {number} nativeVlan - Native VLAN ID
 * @param {Array} allowedVlans - Array of allowed VLAN IDs
 * @returns {object} Validation result { valid, error, warning }
 */
export function validateNativeVlan(nativeVlan, allowedVlans) {
  if (!nativeVlan) {
    return { valid: true };  // Native VLAN is optional
  }

  // Native VLAN should be in allowed VLANs
  if (!allowedVlans.includes(nativeVlan)) {
    return {
      valid: false,
      error: `Native VLAN ${nativeVlan} is not in the list of allowed VLANs`,
      warning: 'Native VLAN will be automatically added to allowed VLANs'
    };
  }

  // Warning if native VLAN is not VLAN 1 (common practice)
  let warning = null;
  if (nativeVlan !== 1) {
    warning = `Native VLAN is ${nativeVlan}. Industry best practice is to use VLAN 1 or change the native VLAN on both sides of the trunk.`;
  }

  return {
    valid: true,
    warning
  };
}
