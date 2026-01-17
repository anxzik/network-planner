import {describe, expect, it} from 'vitest';
import {
    calculateSubnetInfo,
    calculateSubnetting,
    calculateSupernetting,
    calculateVLSM,
    decrementIP,
    getIPClass,
    incrementIP,
    isPrivateIP,
    parseCIDR,
} from './subnetCalculator';

describe('SubnetCalculator - Basic Functions', () => {
  describe('parseCIDR', () => {
    it('should parse valid CIDR notation', () => {
      const result = parseCIDR('192.168.1.0/24');
      expect(result).toEqual({ ip: '192.168.1.0', cidr: 24 });
    });

    it('should parse CIDR with different prefix lengths', () => {
      expect(parseCIDR('10.0.0.0/8')).toEqual({ ip: '10.0.0.0', cidr: 8 });
      expect(parseCIDR('172.16.0.0/16')).toEqual({ ip: '172.16.0.0', cidr: 16 });
      expect(parseCIDR('192.168.0.0/30')).toEqual({ ip: '192.168.0.0', cidr: 30 });
    });

    it('should return null for invalid CIDR notation', () => {
      expect(parseCIDR('192.168.1.0')).toBeNull();
      expect(parseCIDR('invalid/24')).toBeNull();
      expect(parseCIDR('192.168.1.0/33')).toBeNull();
    });
  });

  describe('incrementIP', () => {
    it('should increment IP address by 1', () => {
      expect(incrementIP('192.168.1.0')).toBe('192.168.1.1');
      expect(incrementIP('192.168.1.254')).toBe('192.168.1.255');
    });

    it('should handle octet overflow', () => {
      expect(incrementIP('192.168.1.255')).toBe('192.168.2.0');
      expect(incrementIP('192.168.255.255')).toBe('192.169.0.0');
      expect(incrementIP('255.255.255.255')).toBe('0.0.0.0');
    });
  });

  describe('decrementIP', () => {
    it('should decrement IP address by 1', () => {
      expect(decrementIP('192.168.1.10')).toBe('192.168.1.9');
      expect(decrementIP('192.168.1.1')).toBe('192.168.1.0');
    });

    it('should handle octet underflow', () => {
      expect(decrementIP('192.168.1.0')).toBe('192.168.0.255');
      expect(decrementIP('192.168.0.0')).toBe('192.167.255.255');
      expect(decrementIP('0.0.0.0')).toBe('255.255.255.255');
    });
  });

  describe('getIPClass', () => {
    it('should identify Class A addresses', () => {
      expect(getIPClass('10.0.0.0')).toBe('A');
      expect(getIPClass('50.100.150.200')).toBe('A');
      expect(getIPClass('126.255.255.255')).toBe('A');
    });

    it('should identify Class B addresses', () => {
      expect(getIPClass('128.0.0.0')).toBe('B');
      expect(getIPClass('172.16.0.0')).toBe('B');
      expect(getIPClass('191.255.255.255')).toBe('B');
    });

    it('should identify Class C addresses', () => {
      expect(getIPClass('192.0.0.0')).toBe('C');
      expect(getIPClass('192.168.1.0')).toBe('C');
      expect(getIPClass('223.255.255.255')).toBe('C');
    });

    it('should identify Class D (Multicast) addresses', () => {
      expect(getIPClass('224.0.0.0')).toBe('D (Multicast)');
      expect(getIPClass('239.255.255.255')).toBe('D (Multicast)');
    });

    it('should identify Class E (Reserved) addresses', () => {
      expect(getIPClass('240.0.0.0')).toBe('E (Reserved)');
      expect(getIPClass('255.255.255.255')).toBe('E (Reserved)');
    });
  });

  describe('isPrivateIP', () => {
    it('should identify private IP addresses', () => {
      expect(isPrivateIP('10.0.0.0')).toBe(true);
      expect(isPrivateIP('10.255.255.255')).toBe(true);
      expect(isPrivateIP('172.16.0.0')).toBe(true);
      expect(isPrivateIP('172.31.255.255')).toBe(true);
      expect(isPrivateIP('192.168.0.0')).toBe(true);
      expect(isPrivateIP('192.168.255.255')).toBe(true);
    });

    it('should identify public IP addresses', () => {
      expect(isPrivateIP('8.8.8.8')).toBe(false);
      expect(isPrivateIP('1.1.1.1')).toBe(false);
      expect(isPrivateIP('172.15.0.0')).toBe(false);
      expect(isPrivateIP('172.32.0.0')).toBe(false);
      expect(isPrivateIP('192.167.0.0')).toBe(false);
      expect(isPrivateIP('193.168.0.0')).toBe(false);
    });
  });
});

describe('SubnetCalculator - calculateSubnetInfo', () => {
  it('should calculate subnet info for /24 network', () => {
    const result = calculateSubnetInfo('192.168.1.0', 24);

    expect(result).toMatchObject({
      networkAddress: '192.168.1.0',
      broadcastAddress: '192.168.1.255',
      firstUsable: '192.168.1.1',
      lastUsable: '192.168.1.254',
      cidr: 24,
      mask: '255.255.255.0',
      usableHosts: 254,
      totalHosts: 256,
      isPrivate: true,
      ipClass: 'C',
    });
  });

  it('should calculate subnet info for /30 network', () => {
    const result = calculateSubnetInfo('192.168.1.0', 30);

    expect(result).toMatchObject({
      networkAddress: '192.168.1.0',
      broadcastAddress: '192.168.1.3',
      firstUsable: '192.168.1.1',
      lastUsable: '192.168.1.2',
      usableHosts: 2,
      totalHosts: 4,
    });
  });

  it('should calculate subnet info for /16 network', () => {
    const result = calculateSubnetInfo('172.16.0.0', 16);

    expect(result).toMatchObject({
      networkAddress: '172.16.0.0',
      broadcastAddress: '172.16.255.255',
      firstUsable: '172.16.0.1',
      lastUsable: '172.16.255.254',
      cidr: 16,
      mask: '255.255.0.0',
      usableHosts: 65534,
      totalHosts: 65536,
      isPrivate: true,
      ipClass: 'B',
    });
  });

  it('should calculate subnet info for /8 network', () => {
    const result = calculateSubnetInfo('10.0.0.0', 8);

    expect(result).toMatchObject({
      networkAddress: '10.0.0.0',
      broadcastAddress: '10.255.255.255',
      cidr: 8,
      mask: '255.0.0.0',
      usableHosts: 16777214,
      totalHosts: 16777216,
      isPrivate: true,
      ipClass: 'A',
    });
  });

  it('should accept subnet mask instead of CIDR', () => {
    const result = calculateSubnetInfo('192.168.1.0', '255.255.255.0');

    expect(result.cidr).toBe(24);
    expect(result.mask).toBe('255.255.255.0');
  });

  it('should calculate wildcard mask correctly', () => {
    expect(calculateSubnetInfo('192.168.1.0', 24).wildcardMask).toBe('0.0.0.255');
    expect(calculateSubnetInfo('192.168.0.0', 16).wildcardMask).toBe('0.0.255.255');
    expect(calculateSubnetInfo('10.0.0.0', 8).wildcardMask).toBe('0.255.255.255');
  });

  it('should handle public IP addresses', () => {
    const result = calculateSubnetInfo('8.8.8.0', 24);
    expect(result.isPrivate).toBe(false);
  });
});

describe('SubnetCalculator - calculateSubnetting', () => {
  it('should divide /24 network into /26 subnets', () => {
    const result = calculateSubnetting('192.168.1.0/24', 26);

    expect(result.numberOfSubnets).toBe(4);
    expect(result.subnets).toHaveLength(4);

    expect(result.subnets[0]).toMatchObject({
      network: '192.168.1.0',
      broadcast: '192.168.1.63',
      cidr: 26,
      hosts: 62,
    });

    expect(result.subnets[1]).toMatchObject({
      network: '192.168.1.64',
      broadcast: '192.168.1.127',
    });

    expect(result.subnets[2]).toMatchObject({
      network: '192.168.1.128',
      broadcast: '192.168.1.191',
    });

    expect(result.subnets[3]).toMatchObject({
      network: '192.168.1.192',
      broadcast: '192.168.1.255',
    });
  });

  it('should divide /24 network into /25 subnets', () => {
    const result = calculateSubnetting('192.168.1.0/24', 25);

    expect(result.numberOfSubnets).toBe(2);
    expect(result.subnets[0].network).toBe('192.168.1.0');
    expect(result.subnets[0].hosts).toBe(126);
    expect(result.subnets[1].network).toBe('192.168.1.128');
  });

  it('should divide /16 network into /24 subnets', () => {
    const result = calculateSubnetting('172.16.0.0/16', 24);

    expect(result.numberOfSubnets).toBe(256);
    expect(result.subnets[0].network).toBe('172.16.0.0');
    expect(result.subnets[255].network).toBe('172.16.255.0');
  });

  it('should return error for invalid new CIDR', () => {
    const result = calculateSubnetting('192.168.1.0/24', 23);
    expect(result.error).toBeDefined();
  });

  it('should return error for CIDR larger than 32', () => {
    const result = calculateSubnetting('192.168.1.0/24', 33);
    expect(result.error).toBeDefined();
  });
});

describe('SubnetCalculator - calculateSupernetting', () => {
  it('should summarize consecutive /24 networks', () => {
    const result = calculateSupernetting([
      '192.168.0.0/24',
      '192.168.1.0/24',
      '192.168.2.0/24',
      '192.168.3.0/24',
    ]);

    expect(result.result).toBe('192.168.0.0/22');
    expect(result.cidr).toBe(22);
    expect(result.count).toBe(4);
  });

  it('should summarize two consecutive /24 networks', () => {
    const result = calculateSupernetting([
      '192.168.0.0/24',
      '192.168.1.0/24',
    ]);

    expect(result.result).toBe('192.168.0.0/23');
    expect(result.cidr).toBe(23);
  });

  it('should summarize /16 networks', () => {
    const result = calculateSupernetting([
      '172.16.0.0/16',
      '172.17.0.0/16',
      '172.18.0.0/16',
      '172.19.0.0/16',
    ]);

    expect(result.cidr).toBe(14);
  });

  it('should supernet non-consecutive networks (includes gaps)', () => {
    const result = calculateSupernetting([
      '192.168.0.0/24',
      '192.168.2.0/24',
    ]);

    // Non-consecutive networks can still be supernetted (route summarization)
    // Result will include the gap (192.168.1.0/24)
    expect(result.cidr).toBeLessThanOrEqual(22); // Should be /22 or smaller to contain both
    expect(result.error).toBeUndefined();
  });

  it('should return error for empty input', () => {
    const result = calculateSupernetting([]);
    expect(result.error).toBeDefined();
  });

  it('should return error for single network', () => {
    const result = calculateSupernetting(['192.168.0.0/24']);
    expect(result.error).toBeDefined();
  });
});

describe('SubnetCalculator - calculateVLSM', () => {
  it('should allocate subnets based on host requirements', () => {
    const result = calculateVLSM('10.0.0.0/16', [
      { hosts: 100, name: 'Engineering' },
      { hosts: 50, name: 'Sales' },
      { hosts: 25, name: 'Support' },
    ]);

    expect(result.allocations).toHaveLength(3);

    // Engineering needs 100 hosts -> /25 (126 usable)
    expect(result.allocations[0]).toMatchObject({
      name: 'Engineering',
      requestedHosts: 100,
      usableHosts: 126,
      cidr: 25,
    });

    // Sales needs 50 hosts -> /26 (62 usable)
    expect(result.allocations[1]).toMatchObject({
      name: 'Sales',
      requestedHosts: 50,
      usableHosts: 62,
      cidr: 26,
    });

    // Support needs 25 hosts -> /27 (30 usable)
    expect(result.allocations[2]).toMatchObject({
      name: 'Support',
      requestedHosts: 25,
      usableHosts: 30,
      cidr: 27,
    });
  });

  it('should allocate subnets in descending order', () => {
    const result = calculateVLSM('192.168.1.0/24', [
      { hosts: 10, name: 'Small' },
      { hosts: 50, name: 'Large' },
      { hosts: 25, name: 'Medium' },
    ]);

    // Should be sorted: Large (50), Medium (25), Small (10)
    expect(result.allocations[0].name).toBe('Large');
    expect(result.allocations[1].name).toBe('Medium');
    expect(result.allocations[2].name).toBe('Small');
  });

  it('should allocate non-overlapping subnets', () => {
    const result = calculateVLSM('192.168.1.0/24', [
      { hosts: 60, name: 'Subnet A' },
      { hosts: 30, name: 'Subnet B' },
      { hosts: 30, name: 'Subnet C' },
    ]);

    // Verify no overlaps
    const networks = result.allocations.map(a => a.network);
    expect(new Set(networks).size).toBe(networks.length);
  });

  it('should return error if requirements exceed available space', () => {
    const result = calculateVLSM('192.168.1.0/24', [
      { hosts: 300, name: 'Too Large' },
    ]);

    expect(result.error).toBeDefined();
  });

  it('should handle edge cases with small subnets', () => {
    const result = calculateVLSM('192.168.1.0/24', [
      { hosts: 2, name: 'Point-to-Point' },
    ]);

    expect(result.allocations[0].cidr).toBe(31); // /31 has 2 usable hosts (RFC 3021 point-to-point)
  });

  it('should return error for invalid parent network', () => {
    const result = calculateVLSM('invalid', [
      { hosts: 10, name: 'Test' },
    ]);

    expect(result.error).toBeDefined();
  });

  it('should return error for empty requirements', () => {
    const result = calculateVLSM('192.168.1.0/24', []);
    expect(result.error).toBeDefined();
  });
});

describe('SubnetCalculator - Edge Cases', () => {
  it('should handle /32 subnet (single host)', () => {
    const result = calculateSubnetInfo('192.168.1.1', 32);

    expect(result.usableHosts).toBe(1);
    expect(result.networkAddress).toBe('192.168.1.1');
    expect(result.broadcastAddress).toBe('192.168.1.1');
  });

  it('should handle /31 subnet (point-to-point)', () => {
    const result = calculateSubnetInfo('192.168.1.0', 31);

    expect(result.usableHosts).toBe(2);
    expect(result.totalHosts).toBe(2);
  });

  it('should handle /0 subnet (entire internet)', () => {
    const result = calculateSubnetInfo('0.0.0.0', 0);

    expect(result.mask).toBe('0.0.0.0');
    expect(result.totalHosts).toBe(4294967296); // 2^32
  });
});