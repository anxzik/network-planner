# IP Subnet Calculator - Quick Start Guide

## 🚀 Getting Started

### Access the Calculator
1. Click the **Calculator** tab in the Network Planner header (next to Topology and List tabs)
2. The Subnet Calculator interface will load with expandable sections

## 📊 Main Features

### 1️⃣ Basic Subnet Calculator (Blue Section)
**Purpose**: Calculate comprehensive subnet information

**Steps**:
1. Enter an IP address (e.g., `192.168.1.0`)
2. Choose input format:
   - **Subnet Mask**: e.g., `255.255.255.0`
   - **CIDR Notation**: e.g., `24`
3. Click **Calculate**
4. View detailed results with copy-to-clipboard buttons

**Example Output**:
```
IP Address:       192.168.1.0
CIDR Notation:    192.168.1.0/24
Subnet Mask:      255.255.255.0
Wildcard Mask:    0.0.0.255
Network Address:  192.168.1.0
Broadcast:        192.168.1.255
First Usable IP:  192.168.1.1
Last Usable IP:   192.168.1.254
Usable Hosts:     254
Total Hosts:      256
IP Type:          Private (RFC 1918)
IP Range:         192.168.1.1 - 192.168.1.254
```

---

### 2️⃣ Supernetting (Purple Section)
**Purpose**: Combine multiple subnets into a larger network (Route Summarization)

**Steps**:
1. Click to expand the **Supernetting** section
2. Enter multiple subnets in CIDR notation (one per line):
   - `192.168.0.0/24`
   - `192.168.1.0/24`
3. Click **Add subnet** to add more (optional)
4. Click **Calculate Supernet**
5. View the resulting supernet address

**When to Use**:
- Reducing routing table entries
- BGP route aggregation
- Combining adjacent networks

**Example**:
```
Input:  192.168.0.0/24, 192.168.1.0/24
Output: 192.168.0.0/23
Result: 2 subnets combined into 1
```

---

### 3️⃣ Subnetting (Green Section)
**Purpose**: Divide a network into smaller subnets

**Requirements**: Must calculate basic subnet first

**Steps**:
1. Calculate a subnet using the Basic Calculator
2. Expand the **Subnetting** section
3. Enter a new CIDR prefix (must be larger than original)
4. View the suggested number of subnets to be created
5. Click **Calculate Subnets**
6. View all resulting subnets

**Example**:
```
Parent:  192.168.0.0/24
New CIDR: /26 (creates 4 subnets)

Results:
- 192.168.0.0/26    (62 hosts)
- 192.168.0.64/26   (62 hosts)
- 192.168.0.128/26  (62 hosts)
- 192.168.0.192/26  (62 hosts)
```

---

### 4️⃣ VLSM Allocation (Orange Section)
**Purpose**: Allocate subnets based on specific host requirements

**Requirements**: Must calculate basic subnet first

**Steps**:
1. Calculate a subnet using the Basic Calculator
2. Expand the **VLSM** section
3. Add requirements:
   - **Subnet Name**: e.g., "Engineering Department"
   - **Number of Hosts**: e.g., `50`
4. Click **Add requirement** for more subnets
5. Click **Calculate VLSM Allocation**
6. View optimized subnet allocations

**Example**:
```
Parent Network: 10.0.0.0/16

Requirements:
- Engineering: 50 hosts
- Sales: 30 hosts
- Support: 10 hosts

Allocations:
- 10.0.0.0/26   → Engineering (62 usable)
- 10.0.1.0/27   → Sales (30 usable)
- 10.0.2.0/28   → Support (14 usable)
```

---

## 🎯 Common Tasks

### Task 1: Planning a Company Network
```
1. Start: 192.168.0.0/16 (65,536 IPs)
2. Calculate basic info first
3. Go to Subnetting
4. Set CIDR to /24 (creates 256 subnets)
5. Gives you 256 subnets with 254 hosts each
```

### Task 2: Combining Networks for BGP
```
1. Expand Supernetting
2. Add your branch office networks:
   - 203.0.113.0/24
   - 203.0.113.1/24
   - 203.0.113.2/24
3. Calculate Supernet
4. Use result in BGP route aggregation
```

### Task 3: Allocating Department Networks
```
1. Start: 10.0.0.0/16
2. Expand VLSM
3. Add departments:
   - Accounting: 100 hosts
   - Marketing: 50 hosts
   - Engineering: 200 hosts
4. Calculate VLSM
5. Use allocations for network setup
```

---

## 💡 Pro Tips

1. **Copy Everything**: Every field has a copy button - use it!
2. **Default Values**: Pre-filled with 192.168.1.0/24 - great for testing
3. **CIDR Reference**: 
   - /24 = 254 hosts (Common)
   - /25 = 126 hosts
   - /26 = 62 hosts (Small office)
   - /27 = 30 hosts
   - /28 = 14 hosts
   - /30 = 2 hosts (Router-to-router links)

4. **Private vs Public**:
   - Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
   - Use these for internal networks
   - All others are public

5. **Special Cases**:
   - /31: Only 2 IPs, used for point-to-point links
   - /32: Single host, used for loopback addresses

---

## ⚠️ Validation Rules

### Valid IP Addresses
- ✅ 192.168.1.0
- ✅ 10.0.0.0
- ✅ 8.8.8.8
- ❌ 256.1.1.1 (octet > 255)
- ❌ 192.168.1 (incomplete)

### Valid Subnet Masks
- ✅ 255.255.255.0
- ✅ 255.255.255.192
- ❌ 255.255.240.255 (non-contiguous)
- ❌ 256.255.255.0 (invalid octet)

### Valid CIDR Values
- ✅ 0-32 (0 = entire IPv4, 32 = single host)
- ❌ -1, 33, or 100

---

## 📋 Reference Tables

### CIDR to Hosts Conversion
| CIDR | Hosts | Usable | Mask |
|------|-------|--------|------|
| /24  | 256   | 254    | 255.255.255.0 |
| /25  | 128   | 126    | 255.255.255.128 |
| /26  | 64    | 62     | 255.255.255.192 |
| /27  | 32    | 30     | 255.255.255.224 |
| /28  | 16    | 14     | 255.255.255.240 |
| /29  | 8     | 6      | 255.255.255.248 |
| /30  | 4     | 2      | 255.255.255.252 |

### IP Classes
| Class | Range | First Octet | Example |
|-------|-------|-------------|---------|
| A | 1-126 | 1-126 | 10.0.0.0 |
| B | 128-191 | 128-191 | 172.16.0.0 |
| C | 192-223 | 192-223 | 192.168.0.0 |
| D | 224-239 | 224-239 | 224.0.0.0 (Multicast) |
| E | 240-255 | 240-255 | 240.0.0.0 (Reserved) |

---

## 🔧 Troubleshooting

**Issue**: Cannot calculate VLSM
- **Solution**: Calculate basic subnet first in the blue section

**Issue**: Supernetting fails with "Cannot supernet these subnets"
- **Solution**: Subnets must be contiguous. Try adjacent subnets only.

**Issue**: Subnetting shows 0 subnets
- **Solution**: New CIDR must be larger (higher number) than the current CIDR

**Issue**: Invalid subnet mask error
- **Solution**: Ensure mask has contiguous 1s (e.g., 255.255.255.0 is valid, 255.255.240.255 is not)

---

## 📚 Additional Resources

See `SUBNET_CALCULATOR.md` for detailed API documentation and technical specifications.

