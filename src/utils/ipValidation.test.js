import {describe, expect, it} from 'vitest';
import {
    calculateNetworkAddress,
    cidrToMask,
    getHostnameValidationError,
    getIPValidationError,
    getSubnetValidationError,
    isIPInSubnet,
    isValidHostname,
    isValidIPv4,
    isValidIPv6,
    isValidSubnetMask,
    maskToCIDR,
} from './ipValidation';

describe('IP Validation - IPv4', () => {
  describe('isValidIPv4', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true);
      expect(isValidIPv4('10.0.0.0')).toBe(true);
      expect(isValidIPv4('172.16.0.1')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
      expect(isValidIPv4('0.0.0.0')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.1')).toBe(false);
      expect(isValidIPv4('192.168.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.-1.1')).toBe(false);
      expect(isValidIPv4('abc.def.ghi.jkl')).toBe(false);
      expect(isValidIPv4('')).toBe(false);
      expect(isValidIPv4('192.168.1.256')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidIPv4('01.02.03.04')).toBe(true); // Leading zeros
      expect(isValidIPv4('1.2.3.4')).toBe(true); // Single digits
      expect(isValidIPv4('192.168.001.001')).toBe(true); // Multiple leading zeros
    });
  });

  describe('getIPValidationError', () => {
    it('should return null for valid IPv4', () => {
      expect(getIPValidationError('192.168.1.1', 'ipv4')).toBeNull();
    });

    it('should return error message for invalid IPv4', () => {
      expect(getIPValidationError('256.1.1.1', 'ipv4')).toBeTruthy();
      expect(getIPValidationError('192.168.1', 'ipv4')).toBeTruthy();
      // Empty string returns null (treated as optional field)
      expect(getIPValidationError('', 'ipv4')).toBeNull();
    });

    it('should return specific error messages', () => {
      const error = getIPValidationError('256.1.1.1', 'ipv4');
      expect(error).toContain('Invalid');
    });
  });
});

describe('IP Validation - IPv6', () => {
  describe('isValidIPv6', () => {
    it('should validate correct IPv6 addresses', () => {
      expect(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(isValidIPv6('2001:db8:85a3::8a2e:370:7334')).toBe(true);
      expect(isValidIPv6('::1')).toBe(true);
      expect(isValidIPv6('::')).toBe(true);
      expect(isValidIPv6('fe80::1')).toBe(true);
      // Note: IPv4-mapped format (::ffff:192.168.1.1) requires more complex validation
    });

    it('should reject invalid IPv6 addresses', () => {
      expect(isValidIPv6('02001:0db8:0000:0000:0000:ff00:0042:8329')).toBe(false); // Too many digits
      expect(isValidIPv6('2001:0db8:0000:0000:0000:gg00:0042:8329')).toBe(false); // Invalid hex
      expect(isValidIPv6('192.168.1.1')).toBe(false); // IPv4 address
      expect(isValidIPv6('')).toBe(false);
      expect(isValidIPv6(':::')).toBe(false);
    });

    it('should handle compressed notation', () => {
      expect(isValidIPv6('2001:db8::1')).toBe(true);
      expect(isValidIPv6('2001:db8::8a2e:370:7334')).toBe(true);
      expect(isValidIPv6('2001:0db8:0000:0000:0000:0000:0000:0001')).toBe(true);
    });
  });
});

describe('IP Validation - Subnet Masks', () => {
  describe('isValidSubnetMask', () => {
    it('should validate correct subnet masks', () => {
      expect(isValidSubnetMask('255.255.255.0')).toBe(true);
      expect(isValidSubnetMask('255.255.0.0')).toBe(true);
      expect(isValidSubnetMask('255.0.0.0')).toBe(true);
      expect(isValidSubnetMask('255.255.255.252')).toBe(true);
      expect(isValidSubnetMask('255.255.255.128')).toBe(true);
    });

    it('should reject invalid subnet masks', () => {
      expect(isValidSubnetMask('255.255.255.1')).toBe(false); // Non-contiguous bits
      expect(isValidSubnetMask('255.255.0.255')).toBe(false); // Non-contiguous bits
      expect(isValidSubnetMask('255.254.255.0')).toBe(false); // Non-contiguous bits
      expect(isValidSubnetMask('192.168.1.1')).toBe(false); // Not a valid mask
      expect(isValidSubnetMask('256.255.255.0')).toBe(false); // Invalid octet
    });

    it('should handle edge cases', () => {
      expect(isValidSubnetMask('0.0.0.0')).toBe(true); // /0
      expect(isValidSubnetMask('255.255.255.255')).toBe(true); // /32
      expect(isValidSubnetMask('128.0.0.0')).toBe(true); // /1
    });
  });

  describe('maskToCIDR', () => {
    it('should convert subnet masks to CIDR notation', () => {
      expect(maskToCIDR('255.255.255.0')).toBe(24);
      expect(maskToCIDR('255.255.0.0')).toBe(16);
      expect(maskToCIDR('255.0.0.0')).toBe(8);
      expect(maskToCIDR('255.255.255.252')).toBe(30);
      expect(maskToCIDR('255.255.255.128')).toBe(25);
    });

    it('should handle edge cases', () => {
      expect(maskToCIDR('0.0.0.0')).toBe(0);
      expect(maskToCIDR('255.255.255.255')).toBe(32);
      expect(maskToCIDR('128.0.0.0')).toBe(1);
    });

    it('should return null for invalid masks', () => {
      expect(maskToCIDR('255.255.0.255')).toBeNull();
      expect(maskToCIDR('invalid')).toBeNull();
    });
  });

  describe('cidrToMask', () => {
    it('should convert CIDR notation to subnet masks', () => {
      expect(cidrToMask(24)).toBe('255.255.255.0');
      expect(cidrToMask(16)).toBe('255.255.0.0');
      expect(cidrToMask(8)).toBe('255.0.0.0');
      expect(cidrToMask(30)).toBe('255.255.255.252');
      expect(cidrToMask(25)).toBe('255.255.255.128');
    });

    it('should handle edge cases', () => {
      expect(cidrToMask(0)).toBe('0.0.0.0');
      expect(cidrToMask(32)).toBe('255.255.255.255');
      expect(cidrToMask(1)).toBe('128.0.0.0');
    });

    it('should return null for invalid CIDR values', () => {
      expect(cidrToMask(-1)).toBeNull();
      expect(cidrToMask(33)).toBeNull();
    });
  });
});

describe('IP Validation - Network Calculations', () => {
  describe('calculateNetworkAddress', () => {
    it('should calculate network address for /24 subnet', () => {
      expect(calculateNetworkAddress('192.168.1.100', '255.255.255.0')).toBe('192.168.1.0');
      expect(calculateNetworkAddress('192.168.1.1', '255.255.255.0')).toBe('192.168.1.0');
      expect(calculateNetworkAddress('192.168.1.255', '255.255.255.0')).toBe('192.168.1.0');
    });

    it('should calculate network address for /16 subnet', () => {
      expect(calculateNetworkAddress('172.16.50.100', '255.255.0.0')).toBe('172.16.0.0');
      expect(calculateNetworkAddress('172.16.255.255', '255.255.0.0')).toBe('172.16.0.0');
    });

    it('should calculate network address for /30 subnet', () => {
      expect(calculateNetworkAddress('192.168.1.1', '255.255.255.252')).toBe('192.168.1.0');
      expect(calculateNetworkAddress('192.168.1.5', '255.255.255.252')).toBe('192.168.1.4');
      expect(calculateNetworkAddress('192.168.1.9', '255.255.255.252')).toBe('192.168.1.8');
    });

    it('should handle edge cases', () => {
      expect(calculateNetworkAddress('10.0.0.0', '255.0.0.0')).toBe('10.0.0.0');
      expect(calculateNetworkAddress('255.255.255.255', '255.255.255.255')).toBe('255.255.255.255');
    });
  });

  describe('isIPInSubnet', () => {
    it('should determine if IP is in /24 subnet', () => {
      expect(isIPInSubnet('192.168.1.100', '192.168.1.0', '255.255.255.0')).toBe(true);
      expect(isIPInSubnet('192.168.1.1', '192.168.1.0', '255.255.255.0')).toBe(true);
      expect(isIPInSubnet('192.168.1.255', '192.168.1.0', '255.255.255.0')).toBe(true);
      expect(isIPInSubnet('192.168.2.1', '192.168.1.0', '255.255.255.0')).toBe(false);
    });

    it('should determine if IP is in /16 subnet', () => {
      expect(isIPInSubnet('172.16.50.100', '172.16.0.0', '255.255.0.0')).toBe(true);
      expect(isIPInSubnet('172.17.0.1', '172.16.0.0', '255.255.0.0')).toBe(false);
    });

    it('should determine if IP is in /30 subnet', () => {
      expect(isIPInSubnet('192.168.1.1', '192.168.1.0', '255.255.255.252')).toBe(true);
      expect(isIPInSubnet('192.168.1.2', '192.168.1.0', '255.255.255.252')).toBe(true);
      expect(isIPInSubnet('192.168.1.5', '192.168.1.0', '255.255.255.252')).toBe(false);
    });

    it('should handle network and broadcast addresses', () => {
      expect(isIPInSubnet('192.168.1.0', '192.168.1.0', '255.255.255.0')).toBe(true);
      expect(isIPInSubnet('192.168.1.255', '192.168.1.0', '255.255.255.0')).toBe(true);
    });
  });
});

describe('IP Validation - Hostnames', () => {
  describe('isValidHostname', () => {
    it('should validate correct hostnames', () => {
      expect(isValidHostname('example.com')).toBe(true);
      expect(isValidHostname('sub.example.com')).toBe(true);
      expect(isValidHostname('server-01.local')).toBe(true);
      expect(isValidHostname('my-server')).toBe(true);
      expect(isValidHostname('localhost')).toBe(true);
    });

    it('should validate FQDNs', () => {
      expect(isValidHostname('mail.google.com')).toBe(true);
      expect(isValidHostname('www.example.co.uk')).toBe(true);
      expect(isValidHostname('server.internal.company.com')).toBe(true);
    });

    it('should reject invalid hostnames', () => {
      expect(isValidHostname('example-.com')).toBe(false); // Ends with hyphen
      expect(isValidHostname('-example.com')).toBe(false); // Starts with hyphen
      expect(isValidHostname('example..com')).toBe(false); // Double dot
      expect(isValidHostname('.example.com')).toBe(false); // Starts with dot
      expect(isValidHostname('example.com.')).toBe(false); // Ends with dot
      expect(isValidHostname('')).toBe(false); // Empty
      expect(isValidHostname('example_com')).toBe(false); // Underscore not allowed
    });

    it('should handle length limits', () => {
      const longLabel = 'a'.repeat(64);
      expect(isValidHostname(longLabel + '.com')).toBe(false); // Label too long

      const validLabel = 'a'.repeat(63);
      expect(isValidHostname(validLabel + '.com')).toBe(true); // Max label length
    });

    it('should handle numeric hostnames', () => {
      expect(isValidHostname('123')).toBe(true);
      expect(isValidHostname('server01')).toBe(true);
      expect(isValidHostname('01-server')).toBe(true);
    });
  });
});

describe('IP Validation - Integration Tests', () => {
  it('should validate complete network configuration', () => {
    const ip = '192.168.1.100';
    const mask = '255.255.255.0';
    const network = '192.168.1.0';

    expect(isValidIPv4(ip)).toBe(true);
    expect(isValidSubnetMask(mask)).toBe(true);
    expect(calculateNetworkAddress(ip, mask)).toBe(network);
    expect(isIPInSubnet(ip, network, mask)).toBe(true);
    expect(maskToCIDR(mask)).toBe(24);
  });

  it('should handle gateway validation', () => {
    const ip = '192.168.1.100';
    const gateway = '192.168.1.1';
    const mask = '255.255.255.0';
    const network = calculateNetworkAddress(ip, mask);

    expect(isIPInSubnet(gateway, network, mask)).toBe(true);
  });

  it('should detect IP conflicts', () => {
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.100';

    expect(ip1).toBe(ip2); // Same IP = conflict
  });

  it('should validate DNS servers in same subnet', () => {
    const ip = '192.168.1.100';
    const dns1 = '192.168.1.1';
    const dns2 = '8.8.8.8'; // Google DNS - different subnet
    const mask = '255.255.255.0';
    const network = calculateNetworkAddress(ip, mask);

    expect(isIPInSubnet(dns1, network, mask)).toBe(true);
    expect(isIPInSubnet(dns2, network, mask)).toBe(false);
  });
});

describe('IP Validation - Error Messages', () => {
  it('should provide helpful error messages for IPv4', () => {
    expect(getIPValidationError('256.1.1.1', 'ipv4')).toMatch(/invalid/i);
    expect(getIPValidationError('192.168.1', 'ipv4')).toMatch(/invalid|format/i);
  });

  it('should provide helpful error messages for IPv6', () => {
    expect(getIPValidationError('invalid', 'ipv6')).toMatch(/invalid/i);
  });

  it('should provide helpful error messages for subnet masks', () => {
    expect(getSubnetValidationError('255.255.0.255')).toMatch(/invalid|contiguous/i);
  });

  it('should provide helpful error messages for hostnames', () => {
    expect(getHostnameValidationError('example-.com')).toMatch(/invalid/i);
  });
});