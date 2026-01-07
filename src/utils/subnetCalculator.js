/**
 * Advanced IP Subnet Calculator Utilities
 * Includes subnet calculations, supernetting, and CIDR operations
 */

import {
    calculateBroadcastAddress,
    calculateNetworkAddress,
    calculateUsableHosts,
    cidrToMask,
    isValidIPv4,
    isValidSubnetMask,
    maskToCIDR,
} from './ipValidation';

/**
 * Parse CIDR notation (e.g., "192.168.1.0/24")
 * @param {string} cidrNotation - IP address with CIDR prefix
 * @returns {object} { ip, cidr } or null if invalid
 */
export function parseCIDR(cidrNotation) {
  if (!cidrNotation || typeof cidrNotation !== 'string') return null;

  const parts = cidrNotation.trim().split('/');
  if (parts.length !== 2) return null;

  const ip = parts[0];
  const cidr = parseInt(parts[1], 10);

  if (!isValidIPv4(ip) || cidr < 0 || cidr > 32) return null;

  return { ip, cidr };
}

/**
 * Calculate comprehensive subnet information
 * @param {string} ip - IPv4 address
 * @param {string|number} maskOrCidr - Subnet mask or CIDR prefix
 * @returns {object} Detailed subnet information
 */
export function calculateSubnetInfo(ip, maskOrCidr) {
  if (!isValidIPv4(ip)) return null;

  // Convert to mask if CIDR provided
  let mask;
  let cidr;

  if (typeof maskOrCidr === 'number') {
    cidr = maskOrCidr;
    mask = cidrToMask(cidr);
    if (!mask) return null;
  } else {
    if (!isValidSubnetMask(maskOrCidr)) return null;
    mask = maskOrCidr;
    cidr = maskToCIDR(mask);
  }

  const networkAddress = calculateNetworkAddress(ip, mask);
  const broadcastAddress = calculateBroadcastAddress(ip, mask);
  const usableHosts = calculateUsableHosts(mask);
  const totalHosts = Math.pow(2, 32 - cidr);

  // Calculate first and last usable IPs
  const firstUsable = cidr === 31 || cidr === 32 ? networkAddress : incrementIP(networkAddress);
  const lastUsable = cidr === 31 || cidr === 32 ? broadcastAddress : decrementIP(broadcastAddress);

  // IP class information
  const ipClass = getIPClass(ip);

  // Determine if private IP
  const isPrivate = isPrivateIP(ip);

  return {
    ip,
    cidr,
    mask,
    networkAddress,
    broadcastAddress,
    firstUsable,
    lastUsable,
    usableHosts,
    totalHosts,
    ipClass,
    isPrivate,
    wildcardMask: calculateWildcardMask(mask),
    ipRange: `${firstUsable} - ${lastUsable}`,
    cidrNotation: `${networkAddress}/${cidr}`,
  };
}

/**
 * Increment IP address by 1
 * @param {string} ip - IPv4 address
 * @returns {string} Incremented IP address
 */
export function incrementIP(ip) {
  const octets = ip.split('.').map(Number);
  let value = octets[0] * 256 * 256 * 256 + octets[1] * 256 * 256 + octets[2] * 256 + octets[3];
  value++;

  return [
    Math.floor(value / (256 * 256 * 256)) % 256,
    Math.floor(value / (256 * 256)) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join('.');
}

/**
 * Decrement IP address by 1
 * @param {string} ip - IPv4 address
 * @returns {string} Decremented IP address
 */
export function decrementIP(ip) {
  const octets = ip.split('.').map(Number);
  let value = octets[0] * 256 * 256 * 256 + octets[1] * 256 * 256 + octets[2] * 256 + octets[3];
  value--;

  // Handle underflow by wrapping to maximum IP (255.255.255.255 = 4294967295)
  if (value < 0) {
    value = 4294967295;
  }

  return [
    Math.floor(value / (256 * 256 * 256)) % 256,
    Math.floor(value / (256 * 256)) % 256,
    Math.floor(value / 256) % 256,
    value % 256,
  ].join('.');
}

/**
 * Calculate wildcard mask (inverse of subnet mask)
 * @param {string} mask - Subnet mask
 * @returns {string} Wildcard mask
 */
export function calculateWildcardMask(mask) {
  const octets = mask.split('.').map(o => 255 - parseInt(o, 10));
  return octets.join('.');
}

/**
 * Get IP address class (A, B, C, D, E)
 * @param {string} ip - IPv4 address
 * @returns {string} IP class
 */
export function getIPClass(ip) {
  const firstOctet = parseInt(ip.split('.')[0], 10);

  if (firstOctet < 128) return 'A';
  if (firstOctet < 192) return 'B';
  if (firstOctet < 224) return 'C';
  if (firstOctet < 240) return 'D (Multicast)';
  return 'E (Reserved)';
}

/**
 * Check if IP is private (RFC 1918)
 * @param {string} ip - IPv4 address
 * @returns {boolean} True if private IP
 */
export function isPrivateIP(ip) {
  const octets = ip.split('.').map(Number);
  const firstOctet = octets[0];
  const secondOctet = octets[1];

  // 10.0.0.0/8
  if (firstOctet === 10) return true;

  // 172.16.0.0/12
  if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return true;

  // 192.168.0.0/16
  if (firstOctet === 192 && secondOctet === 168) return true;

  // 127.0.0.0/8 (loopback)
  if (firstOctet === 127) return true;

  // 169.254.0.0/16 (link-local)
  if (firstOctet === 169 && secondOctet === 254) return true;

  return false;
}

/**
 * Calculate supernetting (summarize multiple subnets)
 * @param {array} subnets - Array of CIDR notation subnets (e.g., ["192.168.0.0/24", "192.168.1.0/24"])
 * @returns {object} Supernetting information or error
 */
export function calculateSupernetting(subnets) {
  if (!Array.isArray(subnets) || subnets.length === 0) {
    return { error: 'No subnets provided' };
  }

  // Parse all subnets
  const parsedSubnets = subnets.map(subnet => parseCIDR(subnet)).filter(s => s !== null);

  if (parsedSubnets.length === 0) {
    return { error: 'No valid subnets found' };
  }

  if (parsedSubnets.length === 1) {
    return { 
      result: subnets[0],
      count: 1,
      error: 'Need at least 2 subnets to supernet'
    };
  }

  // Convert all to binary representation
  const binarySubnets = parsedSubnets.map(s => ({
    ...s,
    binary: ipToBinary(s.ip),
  }));

  // Find common prefix
  const firstBinary = binarySubnets[0].binary;
  let commonLength = 32;

  for (const subnet of binarySubnets.slice(1)) {
    let matchLength = 0;
    for (let i = 0; i < 32; i++) {
      if (firstBinary[i] === subnet.binary[i]) {
        matchLength++;
      } else {
        break;
      }
    }
    commonLength = Math.min(commonLength, matchLength);
  }

  // Ensure all subnets are covered
  // We need to find the largest CIDR that encompasses all
  let supernet = commonLength;

  // Build the supernet address from common bits
  const supermask = '1'.repeat(supernet) + '0'.repeat(32 - supernet);
  const supermaskOctets = [];
  for (let i = 0; i < 4; i++) {
    supermaskOctets.push(parseInt(supermask.substr(i * 8, 8), 2));
  }
  const supermaskStr = supermaskOctets.join('.');
  const supermaskIP = binarySubnets[0].ip;
  const supermaskNetwork = calculateNetworkAddress(supermaskIP, supermaskStr);

  // Validate that all subnets are actually contained
  let validSupernet = true;
  let currentSupernet = supernet;

  while (validSupernet && currentSupernet >= 1) {
    const testMask = cidrToMask(currentSupernet);
    const testNetwork = calculateNetworkAddress(supermaskNetwork, testMask);
    const testBroadcast = calculateBroadcastAddress(testNetwork, testMask);

    let allContained = true;
    for (const subnet of binarySubnets) {
      const subnetInfo = calculateSubnetInfo(subnet.ip, subnet.cidr);
      if (!isIPInRange(subnetInfo.networkAddress, testNetwork, testBroadcast) ||
          !isIPInRange(subnetInfo.broadcastAddress, testNetwork, testBroadcast)) {
        allContained = false;
        break;
      }
    }

    if (allContained) {
      return {
        result: `${testNetwork}/${currentSupernet}`,
        cidr: currentSupernet,
        mask: testMask,
        networkAddress: testNetwork,
        subnets: subnets,
        count: subnets.length,
      };
    }

    currentSupernet--;
  }

  return { error: 'Cannot supernet these subnets (not contiguous)' };
}

/**
 * Convert IP to 32-bit binary string
 * @param {string} ip - IPv4 address
 * @returns {string} 32-character binary string
 */
function ipToBinary(ip) {
  const octets = ip.split('.').map(o => parseInt(o, 10).toString(2).padStart(8, '0'));
  return octets.join('');
}

/**
 * Check if IP is within a range
 * @param {string} ip - IP to check
 * @param {string} rangeStart - Range start IP
 * @param {string} rangeEnd - Range end IP
 * @returns {boolean} True if IP is in range
 */
function isIPInRange(ip, rangeStart, rangeEnd) {
  const ipNum = ipToNumber(ip);
  const startNum = ipToNumber(rangeStart);
  const endNum = ipToNumber(rangeEnd);
  return ipNum >= startNum && ipNum <= endNum;
}

/**
 * Convert IP to 32-bit number
 * @param {string} ip - IPv4 address
 * @returns {number} IP as 32-bit number
 */
function ipToNumber(ip) {
  const octets = ip.split('.').map(Number);
  return (octets[0] * 256 * 256 * 256) + (octets[1] * 256 * 256) + (octets[2] * 256) + octets[3];
}

/**
 * Subnetting: divide a network into smaller subnets
 * @param {string} cidrNotation - Network in CIDR notation (e.g., "192.168.0.0/24")
 * @param {number} newCidr - New CIDR prefix for subnets (must be > original CIDR)
 * @returns {array} Array of subnets or error
 */
export function calculateSubnetting(cidrNotation, newCidr) {
  const parsed = parseCIDR(cidrNotation);
  if (!parsed) return { error: 'Invalid CIDR notation' };

  if (newCidr <= parsed.cidr || newCidr > 32) {
    return { error: `New CIDR (${newCidr}) must be greater than current CIDR (${parsed.cidr}) and ≤ 32` };
  }

  const subnets = [];
  const subnetInfo = calculateSubnetInfo(parsed.ip, parsed.cidr);
  let currentIP = subnetInfo.networkAddress;
  const newMask = cidrToMask(newCidr);
  const hostsPerSubnet = Math.pow(2, 32 - newCidr);

  // Calculate number of subnets that can be created
  const numberOfSubnets = Math.pow(2, newCidr - parsed.cidr);

  for (let i = 0; i < numberOfSubnets && i < 256; i++) {
    const subnetNetwork = calculateNetworkAddress(currentIP, newMask);
    const subnetBroadcast = calculateBroadcastAddress(subnetNetwork, newMask);
    const subnetUsable = calculateUsableHosts(newMask);

    subnets.push({
      cidrNotation: `${subnetNetwork}/${newCidr}`,
      network: subnetNetwork,
      broadcast: subnetBroadcast,
      mask: newMask,
      cidr: newCidr,
      hosts: subnetUsable,
      index: i,
    });

    // Move to next subnet
    currentIP = incrementIP(subnetBroadcast);
  }

  return {
    subnets,
    originalNetwork: cidrNotation,
    numberOfSubnets: numberOfSubnets,
    hostsPerSubnet: newCidr === 31 ? 2 : newCidr === 32 ? 1 : hostsPerSubnet - 2,
  };
}

/**
 * Calculate VLSM (Variable Length Subnet Mask) allocation
 * @param {string} cidrNotation - Parent network
 * @param {array} requirements - Array of { hosts, name } requirements
 * @returns {array} VLSM allocation or error
 */
export function calculateVLSM(cidrNotation, requirements) {
  if (!Array.isArray(requirements) || requirements.length === 0) {
    return { error: 'No requirements provided' };
  }

  const parsed = parseCIDR(cidrNotation);
  if (!parsed) return { error: 'Invalid CIDR notation' };

  // Sort requirements by hosts descending
  const sorted = [...requirements].sort((a, b) => (b.hosts || 0) - (a.hosts || 0));

  const allocations = [];
  const parentMask = cidrToMask(parsed.cidr);

  if (!parentMask) {
    return { error: 'Cannot convert parent CIDR to mask' };
  }

  let currentIP = calculateNetworkAddress(parsed.ip, parentMask);

  if (!currentIP) {
    return { error: 'Cannot calculate network address' };
  }

  const parentBroadcast = calculateBroadcastAddress(currentIP, parentMask);

  for (const req of sorted) {
    const hostsNeeded = req.hosts || 1;

    // Calculate CIDR needed for this many hosts
    // We need to find the smallest subnet that can accommodate the required hosts
    // Start from parent CIDR and increase toward /32, keeping the last one that fits
    let neededCidr = parsed.cidr;
    for (let cidr = parsed.cidr; cidr <= 32; cidr++) {
      const hostsAvailable = cidr === 31 || cidr === 32 ?
        (cidr === 31 ? 2 : 1) :
        Math.pow(2, 32 - cidr) - 2;
      if (hostsAvailable >= hostsNeeded) {
        neededCidr = cidr;
        // Keep going to find the smallest (most efficient) subnet
      } else {
        // Can't fit anymore, use the previous CIDR
        break;
      }
    }

    // Validate that the chosen CIDR can actually accommodate the required hosts
    const finalHostsAvailable = neededCidr === 31 || neededCidr === 32 ?
      (neededCidr === 31 ? 2 : 1) :
      Math.pow(2, 32 - neededCidr) - 2;

    if (finalHostsAvailable < hostsNeeded) {
      return { error: `Cannot allocate ${hostsNeeded} hosts - largest available subnet (/${neededCidr}) only has ${finalHostsAvailable} usable hosts` };
    }

    if (neededCidr > 32) {
      return { error: `Cannot allocate ${hostsNeeded} hosts in remaining space` };
    }

    const mask = cidrToMask(neededCidr);
    const network = calculateNetworkAddress(currentIP, mask);
    const broadcast = calculateBroadcastAddress(network, mask);
    const usable = calculateUsableHosts(mask);

    // Check if still within parent network
    const parentNetwork = calculateNetworkAddress(parsed.ip, parentMask);
    if (!isIPInRange(network, parentNetwork, parentBroadcast)) {
      return { error: `Allocation exceeds parent network range` };
    }

    allocations.push({
      name: req.name || `Subnet ${allocations.length + 1}`,
      requestedHosts: hostsNeeded,
      cidrNotation: `${network}/${neededCidr}`,
      network,
      broadcast,
      mask,
      cidr: neededCidr,
      usableHosts: usable,
    });

    currentIP = incrementIP(broadcast);
  }

  return {
    allocations,
    parentNetwork: cidrNotation,
  };
}

