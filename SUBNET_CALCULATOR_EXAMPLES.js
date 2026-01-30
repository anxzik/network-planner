/**
 * IP Subnet Calculator - Usage Examples
 *
 * This file demonstrates how to use the subnet calculator utilities
 * in your own code.
 */
let calculateSubnetInfo, calculateSubnetting, calculateSupernetting, calculateVLSM, decrementIP, getIPClass,
    incrementIP, isPrivateIP, parseCIDR;
({
    calculateSubnetInfo,
    calculateSubnetting,
    calculateSupernetting,
    calculateVLSM,
    decrementIP,
    getIPClass,
    incrementIP,
    isPrivateIP,
    parseCIDR,
} = await import('./src/utils/subnetCalculator.js'));

// ============================================================================
// EXAMPLE 1: Basic Subnet Calculation
// ============================================================================

console.log('=== EXAMPLE 1: Basic Subnet Calculation ===');

const basicInfo = calculateSubnetInfo('192.168.1.0', 24);
console.log('Subnet Information for 192.168.1.0/24:');
console.log({
  network: basicInfo.networkAddress,
  broadcast: basicInfo.broadcastAddress,
  firstIP: basicInfo.firstUsable,
  lastIP: basicInfo.lastUsable,
  usableHosts: basicInfo.usableHosts,
  cidr: basicInfo.cidr,
  isPrivate: basicInfo.isPrivate,
});
// Output:
// {
//   network: '192.168.1.0',
//   broadcast: '192.168.1.255',
//   firstIP: '192.168.1.1',
//   lastIP: '192.168.1.254',
//   usableHosts: 254,
//   cidr: 24,
//   isPrivate: true
// }

// ============================================================================
// EXAMPLE 2: Using Subnet Mask Format
// ============================================================================

console.log('\n=== EXAMPLE 2: Using Subnet Mask Format ===');

const maskInfo = calculateSubnetInfo('10.0.0.0', '255.255.255.0');
console.log('Same calculation with subnet mask:');
console.log(`CIDR: /${maskInfo.cidr}`);
console.log(`Wildcard Mask: ${maskInfo.wildcardMask}`);

// ============================================================================
// EXAMPLE 3: Supernetting (Route Summarization)
// ============================================================================

console.log('\n=== EXAMPLE 3: Supernetting ===');

const supernet = calculateSupernetting([
  '192.168.0.0/24',
  '192.168.1.0/24',
  '192.168.2.0/24',
  '192.168.3.0/24',
]);

console.log('Supernetting 4 consecutive /24 networks:');
console.log({
  result: supernet.result,
  cidr: supernet.cidr,
  subnets: supernet.count,
});
// Output: { result: '192.168.0.0/22', cidr: 22, subnets: 4 }

// ============================================================================
// EXAMPLE 4: Subnetting (Dividing Networks)
// ============================================================================

console.log('\n=== EXAMPLE 4: Subnetting ===');

const subnets = calculateSubnetting('192.168.0.0/24', 26);

console.log('Dividing 192.168.0.0/24 into /26 networks:');
console.log(`Number of subnets: ${subnets.numberOfSubnets}`);
console.log('First 2 subnets:');
console.log(subnets.subnets.slice(0, 2).map(s => ({
  network: s.network,
  broadcast: s.broadcast,
  hosts: s.hosts,
  cidr: `/${s.cidr}`,
})));

// Output:
// {
//   network: '192.168.0.0',
//   broadcast: '192.168.0.63',
//   hosts: 62,
//   cidr: '/26'
// },
// {
//   network: '192.168.0.64',
//   broadcast: '192.168.0.127',
//   hosts: 62,
//   cidr: '/26'
// }

// ============================================================================
// EXAMPLE 5: VLSM (Variable Length Subnet Mask) Allocation
// ============================================================================

console.log('\n=== EXAMPLE 5: VLSM Allocation ===');

const vlsmResult = calculateVLSM('10.0.0.0/16', [
  { hosts: 100, name: 'Engineering' },
  { hosts: 50, name: 'Sales' },
  { hosts: 25, name: 'Support' },
  { hosts: 10, name: 'Management' },
]);

console.log('VLSM allocation for different departments:');
vlsmResult.allocations.forEach(alloc => {
  console.log({
    name: alloc.name,
    network: alloc.cidrNotation,
    requested: alloc.requestedHosts,
    allocated: alloc.usableHosts,
  });
});

// Output:
// { name: 'Engineering', network: '10.0.0.0/25', requested: 100, allocated: 126 },
// { name: 'Sales', network: '10.0.1.0/26', requested: 50, allocated: 62 },
// { name: 'Support', network: '10.0.2.0/27', requested: 25, allocated: 30 },
// { name: 'Management', network: '10.0.3.0/28', requested: 10, allocated: 14 }

// ============================================================================
// EXAMPLE 6: Parsing CIDR Notation
// ============================================================================

console.log('\n=== EXAMPLE 6: CIDR Parsing ===');

const parsed = parseCIDR('192.168.1.0/24');
console.log('Parsed CIDR:');
console.log({ ip: parsed.ip, cidr: parsed.cidr });
// Output: { ip: '192.168.1.0', cidr: 24 }

// ============================================================================
// EXAMPLE 7: IP Address Utilities
// ============================================================================

console.log('\n=== EXAMPLE 7: IP Address Utilities ===');

const ip = '192.168.1.50';

console.log('IP Utilities:');
console.log({
  originalIP: ip,
  nextIP: incrementIP(ip),
  previousIP: decrementIP(ip),
  ipClass: getIPClass(ip),
  isPrivate: isPrivateIP(ip),
});

// Output:
// {
//   originalIP: '192.168.1.50',
//   nextIP: '192.168.1.51',
//   previousIP: '192.168.1.49',
//   ipClass: 'C',
//   isPrivate: true
// }

// ============================================================================
// EXAMPLE 8: Complex Network Planning Scenario
// ============================================================================

console.log('\n=== EXAMPLE 8: Complex Network Planning ===');

// Scenario: We have 10.0.0.0/16 and need to plan network for 3 office locations

const mainNetwork = calculateSubnetInfo('10.0.0.0', 16);
console.log('Main Network:', mainNetwork.cidrNotation);

// Each office needs different sizes
const officeAllocations = calculateVLSM('10.0.0.0/16', [
  { hosts: 250, name: 'New York Office' },
  { hosts: 100, name: 'London Office' },
  { hosts: 50, name: 'Tokyo Office' },
]);

console.log('\nOffice Network Allocation:');
officeAllocations.allocations.forEach(office => {
  const details = calculateSubnetInfo(
    office.network,
    office.cidr
  );
  
  console.log(`\n${office.name}:`);
  console.log(`  Network: ${office.cidrNotation}`);
  console.log(`  IP Range: ${details.firstUsable} - ${details.lastUsable}`);
  console.log(`  Usable Hosts: ${details.usableHosts}`);
  console.log(`  Gateway: ${details.firstUsable}`);
  console.log(`  Broadcast: ${details.broadcastAddress}`);
});

// ============================================================================
// EXAMPLE 9: Network Verification
// ============================================================================

console.log('\n=== EXAMPLE 9: Network Verification ===');

const networkToVerify = calculateSubnetInfo('192.168.0.0', 24);

const testIPs = [
  '192.168.0.0',      // Network address
  '192.168.0.1',      // First usable
  '192.168.0.128',    // Middle address
  '192.168.0.254',    // Last usable
  '192.168.0.255',    // Broadcast
];

console.log('Verification for 192.168.0.0/24:');

const firstInt = ipToInt(networkToVerify.firstUsable);
const lastInt = ipToInt(networkToVerify.lastUsable);

testIPs.forEach(ip => {
  const val = ipToInt(ip);
  const isValid = val >= firstInt && val <= lastInt;
  console.log(`${ip}: ${isValid ? 'VALID' : 'INVALID'}`);
});

// ============================================================================
// EXAMPLE 10: Practical Use Case - Data Center Network Design
// ============================================================================

console.log('\n=== EXAMPLE 10: Data Center Network Design ===');

const dataCenter = calculateSubnetInfo('172.16.0.0', 12); // Large network
console.log(`Total space: ${dataCenter.cidrNotation}`);
console.log(`Total IPs: ${dataCenter.totalHosts}`);

// Divide into smaller segments
const segments = calculateSubnetting('172.16.0.0/12', 16);
console.log(`\nDivided into ${segments.numberOfSubnets} /16 networks`);
console.log('Available segments for allocation:');
segments.subnets.slice(0, 3).forEach(seg => {
  console.log(`  ${seg.cidrNotation} (${seg.hosts} usable hosts)`);
});

// Further divide one segment for departments
const segment1Vlsm = calculateVLSM(segments.subnets[0].cidrNotation, [
  { hosts: 2000, name: 'Production Servers' },
  { hosts: 1000, name: 'Development Servers' },
  { hosts: 500, name: 'Testing Servers' },
  { hosts: 200, name: 'Management' },
  { hosts: 100, name: 'Monitoring' },
]);

console.log('\nFurther segmentation of first /16:');
segment1Vlsm.allocations.forEach(dept => {
  console.log(`  ${dept.name}: ${dept.cidrNotation}`);
});

// ============================================================================
// EXPORT UTILITIES FOR USE IN REACT COMPONENTS
// ============================================================================

// Example React Hook Usage:
/*
import { useState } from 'react';
import { calculateSubnetInfo } from './utils/subnetCalculator';

function MyComponent() {
  const [ip, setIP] = useState('192.168.0.0');
  const [cidr, setCIDR] = useState('24');
  const [result, setResult] = useState(null);

  const handleCalculate = () => {
    const info = calculateSubnetInfo(ip, parseInt(cidr, 10));
    setResult(info);
  };

  return (
    <div>
      <input value={ip} onChange={(e) => setIP(e.target.value)} />
      <input value={cidr} onChange={(e) => setCIDR(e.target.value)} />
      <button onClick={handleCalculate}>Calculate</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
*/

console.log('\n✅ All examples completed successfully!');

// Helper: convert dotted IP to 32-bit integer for correct numeric comparisons
function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) >>> 0) + (parseInt(octet, 10) >>> 0), 0) >>> 0;
}
