/**
 * IP Address and Subnet Validation Utilities
 */

/**
 * Validate IPv4 address format
 * @param {string} ip - IPv4 address to validate
 * @returns {boolean} True if valid IPv4 address
 */
export function isValidIPv4(ip) {
  if (!ip || typeof ip !== 'string') return false;

  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Pattern);

  if (!match) return false;

  // Check each octet is between 0-255
  for (let i = 1; i <= 4; i++) {
    const octet = parseInt(match[i], 10);
    if (octet < 0 || octet > 255) return false;
  }

  return true;
}

/**
 * Validate IPv6 address format (simplified validation)
 * @param {string} ip - IPv6 address to validate
 * @returns {boolean} True if valid IPv6 address
 */
export function isValidIPv6(ip) {
  if (!ip || typeof ip !== 'string') return false;

  // Simplified IPv6 validation pattern
  const ipv6Pattern = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|::)$/;

  return ipv6Pattern.test(ip);
}

/**
 * Validate subnet mask in dotted decimal notation
 * @param {string} mask - Subnet mask to validate (e.g., "255.255.255.0")
 * @returns {boolean} True if valid subnet mask
 */
export function isValidSubnetMask(mask) {
  if (!isValidIPv4(mask)) return false;

  // Convert to binary and check if it's a valid mask (contiguous 1s followed by 0s)
  const octets = mask.split('.').map(o => parseInt(o, 10));
  let binary = '';

  for (const octet of octets) {
    binary += octet.toString(2).padStart(8, '0');
  }

  // Valid subnet mask must be contiguous 1s followed by 0s
  // 0.0.0.0 (/0) is also valid
  const validPattern = /^1*0*$/;
  return validPattern.test(binary);
}

/**
 * Convert subnet mask to CIDR notation
 * @param {string} mask - Subnet mask in dotted decimal (e.g., "255.255.255.0")
 * @returns {number|null} CIDR prefix length (e.g., 24) or null if invalid
 */
export function maskToCIDR(mask) {
  if (!isValidSubnetMask(mask)) return null;

  const octets = mask.split('.').map(o => parseInt(o, 10));
  let binary = '';

  for (const octet of octets) {
    binary += octet.toString(2).padStart(8, '0');
  }

  // Count the number of 1s
  return binary.split('1').length - 1;
}

/**
 * Convert CIDR notation to subnet mask
 * @param {number} cidr - CIDR prefix length (0-32)
 * @returns {string|null} Subnet mask in dotted decimal or null if invalid
 */
export function cidrToMask(cidr) {
  if (cidr < 0 || cidr > 32) return null;

  const binary = '1'.repeat(cidr) + '0'.repeat(32 - cidr);
  const octets = [];

  for (let i = 0; i < 4; i++) {
    const octetBinary = binary.substr(i * 8, 8);
    octets.push(parseInt(octetBinary, 2));
  }

  return octets.join('.');
}

/**
 * Calculate network address from IP and subnet mask
 * @param {string} ip - IPv4 address
 * @param {string} mask - Subnet mask
 * @returns {string|null} Network address or null if invalid
 */
export function calculateNetworkAddress(ip, mask) {
  if (!isValidIPv4(ip) || !isValidSubnetMask(mask)) return null;

  const ipOctets = ip.split('.').map(o => parseInt(o, 10));
  const maskOctets = mask.split('.').map(o => parseInt(o, 10));

  const networkOctets = ipOctets.map((octet, i) => octet & maskOctets[i]);

  return networkOctets.join('.');
}

/**
 * Calculate broadcast address from IP and subnet mask
 * @param {string} ip - IPv4 address
 * @param {string} mask - Subnet mask
 * @returns {string|null} Broadcast address or null if invalid
 */
export function calculateBroadcastAddress(ip, mask) {
  if (!isValidIPv4(ip) || !isValidSubnetMask(mask)) return null;

  const ipOctets = ip.split('.').map(o => parseInt(o, 10));
  const maskOctets = mask.split('.').map(o => parseInt(o, 10));

  const broadcastOctets = ipOctets.map((octet, i) => octet | (~maskOctets[i] & 255));

  return broadcastOctets.join('.');
}

/**
 * Calculate number of usable hosts in a subnet
 * @param {string} mask - Subnet mask
 * @returns {number|null} Number of usable hosts or null if invalid
 */
export function calculateUsableHosts(mask) {
  const cidr = maskToCIDR(mask);
  if (cidr === null) return null;

  const totalHosts = Math.pow(2, 32 - cidr);

  // Subtract network and broadcast addresses
  // Exception: /31 and /32 have special rules
  if (cidr === 31) return 2; // Point-to-point links
  if (cidr === 32) return 1; // Single host

  return totalHosts - 2;
}

/**
 * Check if an IP address is in a given subnet
 * @param {string} ip - IPv4 address to check
 * @param {string} networkIp - Network address
 * @param {string} mask - Subnet mask
 * @returns {boolean} True if IP is in subnet
 */
export function isIPInSubnet(ip, networkIp, mask) {
  if (!isValidIPv4(ip) || !isValidIPv4(networkIp) || !isValidSubnetMask(mask)) {
    return false;
  }

  const ipNetwork = calculateNetworkAddress(ip, mask);
  return ipNetwork === networkIp;
}

/**
 * Validate hostname format (RFC 1123)
 * @param {string} hostname - Hostname to validate
 * @returns {boolean} True if valid hostname
 */
export function isValidHostname(hostname) {
  if (!hostname || typeof hostname !== 'string') return false;
  if (hostname.length > 253) return false;

  // Hostname pattern: alphanumeric and hyphens, cannot start/end with hyphen
  const hostnamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return hostnamePattern.test(hostname);
}

/**
 * Get validation error message for IP address
 * @param {string} ip - IP address to validate
 * @param {string} type - 'ipv4' or 'ipv6'
 * @returns {string|null} Error message or null if valid
 */
export function getIPValidationError(ip, type = 'ipv4') {
  if (!ip || ip.trim() === '') {
    return null; // Allow empty for optional fields
  }

  if (type === 'ipv4') {
    if (!isValidIPv4(ip)) {
      return 'Invalid IPv4 address format (e.g., 192.168.1.1)';
    }
  } else if (type === 'ipv6') {
    if (!isValidIPv6(ip)) {
      return 'Invalid IPv6 address format';
    }
  }

  return null;
}

/**
 * Get validation error message for subnet mask
 * @param {string} mask - Subnet mask to validate
 * @returns {string|null} Error message or null if valid
 */
export function getSubnetValidationError(mask) {
  if (!mask || mask.trim() === '') {
    return null; // Allow empty for optional fields
  }

  if (!isValidIPv4(mask)) {
    return 'Invalid subnet mask format (e.g., 255.255.255.0)';
  }

  if (!isValidSubnetMask(mask)) {
    return 'Invalid subnet mask (must be contiguous 1s followed by 0s)';
  }

  return null;
}

/**
 * Get validation error message for hostname
 * @param {string} hostname - Hostname to validate
 * @returns {string|null} Error message or null if valid
 */
export function getHostnameValidationError(hostname) {
  if (!hostname || hostname.trim() === '') {
    return null; // Allow empty for optional fields
  }

  if (!isValidHostname(hostname)) {
    return 'Invalid hostname format (alphanumeric and hyphens, max 253 chars)';
  }

  return null;
}