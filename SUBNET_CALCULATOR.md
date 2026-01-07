# IP Subnet Calculator Feature

## Overview

The IP Subnet Calculator is a comprehensive networking tool integrated into Network Planner that provides advanced subnet calculations, CIDR notation support, and network planning features including supernetting and VLSM allocation.

## Features

### 1. **Basic Subnet Calculator**
Calculate detailed information about any IP address and subnet mask combination.

**Inputs:**
- IP Address (e.g., 192.168.1.0)
- Subnet Mask (255.255.255.0) OR CIDR notation (/24)

**Outputs:**
- CIDR Notation (e.g., 192.168.1.0/24)
- Subnet Mask
- Wildcard Mask (inverse of subnet mask)
- Network Address
- Broadcast Address
- First Usable IP
- Last Usable IP
- Number of Usable Hosts
- Total Hosts
- IP Class (A, B, C, D, E)
- IP Type (Private RFC 1918 or Public)
- IP Range

### 2. **Supernetting (Route Summarization)**
Combine multiple subnets into a larger network address. Useful for:
- Route aggregation
- Reducing routing table entries
- Network summarization in routing protocols (OSPF, BGP)

**Example:**
```
Subnets:
- 192.168.0.0/24
- 192.168.1.0/24

Result:
- Supernet: 192.168.0.0/23
- CIDR: 23
- Summarized 2 subnets
```

### 3. **Subnetting (Network Division)**
Divide a network into smaller subnets. Useful for:
- Planning network segments
- Creating VLANs
- Allocating addresses to departments

**Example:**
```
Parent Network: 192.168.0.0/24
Divide into /26 subnets:

Result:
- 192.168.0.0/26 (64 hosts, 62 usable)
- 192.168.0.64/26 (64 hosts, 62 usable)
- 192.168.0.128/26 (64 hosts, 62 usable)
- 192.168.0.192/26 (64 hosts, 62 usable)
```

### 4. **VLSM (Variable Length Subnet Mask)**
Allocate subnets based on specific host requirements. Efficient for:
- Complex network designs
- Minimizing wasted IP addresses
- Department/team specific allocations

**Example:**
```
Parent Network: 10.0.0.0/16

Requirements:
- Department A: 50 hosts → 10.0.0.0/26 (62 usable)
- Department B: 30 hosts → 10.0.1.0/27 (30 usable)
- Department C: 10 hosts → 10.0.2.0/28 (14 usable)
```

## Usage

### Accessing the Calculator

1. Open Network Planner
2. Click the **Calculator** tab in the top navigation
3. Enter your IP address and subnet mask/CIDR

### Basic Calculation

1. **Enter IP Address**: Type a valid IPv4 address (e.g., 192.168.1.0)
2. **Select Input Format**:
   - **Subnet Mask**: Enter in dotted decimal (255.255.255.0)
   - **CIDR Notation**: Enter prefix length (0-32)
3. **Click Calculate**: View all subnet details
4. **Copy Values**: Click the copy button next to any field to copy to clipboard

### Supernetting

1. Expand the **Supernetting** section
2. Enter multiple subnets in CIDR notation (one per line)
3. Click **Calculate Supernet**
4. View the resulting supernet address and CIDR

### Subnetting

1. Calculate a basic subnet first
2. Expand the **Subnetting** section
3. Enter a new CIDR prefix (must be larger than original)
4. Click **Calculate Subnets**
5. View all resulting subnets and their details

### VLSM Allocation

1. Calculate a basic subnet first
2. Expand the **VLSM** section
3. Add requirements by entering:
   - **Subnet Name**: Descriptive name (e.g., "Engineering Department")
   - **Number of Hosts**: Required hosts for that subnet
4. Click **Calculate VLSM Allocation**
5. View optimized subnet allocations

## Technical Details

### IP Classes

- **Class A**: 1.0.0.0 to 126.255.255.255 (First octet: 1-126)
- **Class B**: 128.0.0.0 to 191.255.255.255 (First octet: 128-191)
- **Class C**: 192.0.0.0 to 223.255.255.255 (First octet: 192-223)
- **Class D**: 224.0.0.0 to 239.255.255.255 (Multicast)
- **Class E**: 240.0.0.0 to 255.255.255.255 (Reserved)

### Private IP Ranges (RFC 1918)

- **10.0.0.0/8**: 10.0.0.0 to 10.255.255.255
- **172.16.0.0/12**: 172.16.0.0 to 172.31.255.255
- **192.168.0.0/16**: 192.168.0.0 to 192.168.255.255
- **127.0.0.0/8**: Loopback (Local)
- **169.254.0.0/16**: Link-local (APIPA)

### CIDR Reference

| CIDR | Subnet Mask | Hosts | Broadcast | Size |
|------|-------------|-------|-----------|------|
| /24  | 255.255.255.0 | 254 | ✓ | 256 |
| /25  | 255.255.255.128 | 126 | ✓ | 128 |
| /26  | 255.255.255.192 | 62 | ✓ | 64 |
| /27  | 255.255.255.224 | 30 | ✓ | 32 |
| /28  | 255.255.255.240 | 14 | ✓ | 16 |
| /29  | 255.255.255.248 | 6 | ✓ | 8 |
| /30  | 255.255.255.252 | 2 | ✓ | 4 |
| /31  | 255.255.255.254 | 2* | - | 2 |
| /32  | 255.255.255.255 | 1* | - | 1 |

*Special cases: /31 is used for point-to-point links, /32 is a single host

## API Reference

### Core Functions

#### `calculateSubnetInfo(ip, maskOrCidr)`
Comprehensive subnet calculation.

```javascript
import { calculateSubnetInfo } from './utils/subnetCalculator';

const result = calculateSubnetInfo('192.168.1.0', '255.255.255.0');
// or
const result = calculateSubnetInfo('192.168.1.0', 24);

console.log(result);
// {
//   ip: '192.168.1.0',
//   cidr: 24,
//   mask: '255.255.255.0',
//   networkAddress: '192.168.1.0',
//   broadcastAddress: '192.168.1.255',
//   firstUsable: '192.168.1.1',
//   lastUsable: '192.168.1.254',
//   usableHosts: 254,
//   totalHosts: 256,
//   ipClass: 'C',
//   isPrivate: true,
//   wildcardMask: '0.0.0.255',
//   ipRange: '192.168.1.1 - 192.168.1.254',
//   cidrNotation: '192.168.1.0/24'
// }
```

#### `calculateSupernetting(subnets)`
Summarize multiple subnets into a larger network.

```javascript
const result = calculateSupernetting([
  '192.168.0.0/24',
  '192.168.1.0/24'
]);

console.log(result);
// {
//   result: '192.168.0.0/23',
//   cidr: 23,
//   mask: '255.255.254.0',
//   networkAddress: '192.168.0.0',
//   subnets: ['192.168.0.0/24', '192.168.1.0/24'],
//   count: 2
// }
```

#### `calculateSubnetting(cidrNotation, newCidr)`
Divide a network into smaller subnets.

```javascript
const result = calculateSubnetting('192.168.0.0/24', 26);

console.log(result.subnets);
// [
//   { cidrNotation: '192.168.0.0/26', network: '192.168.0.0', broadcast: '192.168.0.63', mask: '255.255.255.192', cidr: 26, hosts: 62, index: 0 },
//   { cidrNotation: '192.168.0.64/26', network: '192.168.0.64', broadcast: '192.168.0.127', mask: '255.255.255.192', cidr: 26, hosts: 62, index: 1 },
//   { cidrNotation: '192.168.0.128/26', network: '192.168.0.128', broadcast: '192.168.0.191', mask: '255.255.255.192', cidr: 26, hosts: 62, index: 2 },
//   { cidrNotation: '192.168.0.192/26', network: '192.168.0.192', broadcast: '192.168.0.255', mask: '255.255.255.192', cidr: 26, hosts: 62, index: 3 }
// ]
```

#### `calculateVLSM(cidrNotation, requirements)`
Allocate subnets based on host requirements.

```javascript
const result = calculateVLSM('10.0.0.0/16', [
  { hosts: 50, name: 'Department A' },
  { hosts: 30, name: 'Department B' },
  { hosts: 10, name: 'Department C' }
]);

console.log(result.allocations);
// [
//   { name: 'Department A', requestedHosts: 50, cidrNotation: '10.0.0.0/26', network: '10.0.0.0', broadcast: '10.0.0.63', mask: '255.255.255.192', cidr: 26, usableHosts: 62 },
//   { name: 'Department B', requestedHosts: 30, cidrNotation: '10.0.1.0/27', network: '10.0.1.0', broadcast: '10.0.1.31', mask: '255.255.255.224', cidr: 27, usableHosts: 30 },
//   { name: 'Department C', requestedHosts: 10, cidrNotation: '10.0.2.0/28', network: '10.0.2.0', broadcast: '10.0.2.15', mask: '255.255.255.240', cidr: 28, usableHosts: 14 }
// ]
```

## Common Use Cases

### 1. Network Planning
Use the calculator to plan IP addressing schemes for your network infrastructure.

### 2. VLAN Design
Subnet a large network into smaller VLANs for different departments or network segments.

### 3. Route Summarization
Use supernetting to reduce the number of routes in your routing tables.

### 4. Documentation
Generate detailed subnet information for network documentation and planning.

### 5. Troubleshooting
Verify IP addresses, subnet masks, and network boundaries during troubleshooting.

## Tips & Best Practices

1. **Always plan before allocating**: Use the calculator to plan your IP scheme before implementation
2. **Document decisions**: Keep records of why certain subnetting decisions were made
3. **Leave room for growth**: Don't allocate all available subnets; reserve some for future expansion
4. **Use VLSM efficiently**: Allocate exactly what's needed to minimize wasted addresses
5. **Follow standards**: Use standard private IP ranges for internal networks
6. **Reserve gateway IPs**: Remember to account for gateway addresses when planning subnets

## Troubleshooting

### Invalid IP Address
- Ensure all octets are between 0-255
- Format: XXX.XXX.XXX.XXX

### Invalid Subnet Mask
- Mask must have contiguous 1s followed by 0s
- Example valid masks: 255.255.255.0, 255.255.255.192
- Example invalid masks: 255.255.240.255 (non-contiguous)

### CIDR Out of Range
- CIDR values must be between 0 and 32
- /0 = entire IPv4 space
- /32 = single host

### Cannot Supernet
- Subnets must be contiguous in the address space
- Adjacent or overlapping subnets can typically be supernetting
- Non-adjacent subnets cannot be summarized into a single prefix

## Performance Considerations

- VLSM allocation with many requirements may take longer
- Subnetting into very small subnets (/30, /31) limits the number of usable hosts
- The calculator supports the full IPv4 address space (/0 to /32)

