irst # IP Subnet Calculator - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Network Planner Application                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    App.jsx (Main)                        │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │           Navigation Tabs (4 views)                │ │   │
│  │  │  [Topology] [List] [Calculator] [Settings]         │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │  Active View Content Area                          │ │   │
│  │  │  ├─ Topology View (existing)                       │ │   │
│  │  │  ├─ List View (existing)                           │ │   │
│  │  │  ├─ Calculator View (NEW) ◄─────┐                │ │   │
│  │  │  └─ Settings (existing)          │                │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │  SubnetCalculator.jsx   │ (NEW Component)
                 │   (React Component)     │
                 └─────────────────────────┘
                    │         │
        ┌───────────┴─────────┼──────────────┬─────────────┐
        │                     │              │             │
        ▼                     ▼              ▼             ▼
    ┌────────────┐    ┌──────────────┐ ┌──────────┐ ┌──────────┐
    │   Basic    │    │Supernetting  │ │Subnetting│ │  VLSM    │
    │Calculator  │    │(Summarize)   │ │(Divide)  │ │Allocation│
    │ (Blue)     │    │ (Purple)     │ │ (Green)  │ │(Orange)  │
    └────────────┘    └──────────────┘ └──────────┘ └──────────┘
        │                   │              │             │
        └───────────────────┴──────────────┴─────────────┘
                              │
                              ▼
                ┌──────────────────────────────┐
                │  subnetCalculator.js (Utils) │ (NEW Utilities)
                │   (Pure JavaScript Logic)    │
                └──────────────────────────────┘
                    │
        ┌───────────┴────────────────┬──────────────────────┐
        │                            │                      │
        ▼                            ▼                      ▼
    ┌────────────────┐      ┌────────────────┐     ┌──────────────┐
    │Core Functions  │      │IP Utilities    │     │Network Tools │
    ├────────────────┤      ├────────────────┤     ├──────────────┤
    │• Calculate     │      │• Increment IP  │     │• VLSM Alloc  │
    │  SubnetInfo    │      │• Decrement IP  │     │• Supernetting│
    │• Parse CIDR    │      │• Get IP Class  │     │• Subnetting  │
    │• IP to Binary  │      │• Is Private    │     │• Validation  │
    └────────────────┘      └────────────────┘     └──────────────┘
        │
        ▼
    ┌────────────────────────────┐
    │  ipValidation.js (existing)│
    │  • Validation functions    │
    │  • IP format checks        │
    │  • Mask conversion         │
    └────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        User Input                                 │
│  [IP Address] + [Subnet Mask OR CIDR] + [Operation Type]         │
└──────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴────────────┐
                    │                      │
                    ▼                      ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │   Input Validation   │  │  Format Selection    │
        │  (ipValidation.js)   │  │  (Mask vs CIDR)      │
        └──────────────────────┘  └──────────────────────┘
                    │                      │
                    └──────────┬───────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Normalize to Standard Format           │
        │  If CIDR → Convert to Mask              │
        │  If Mask → Convert to CIDR              │
        └─────────────────────────────────────────┘
                              │
                    ┌─────────┴────────────┐
                    │                      │
                    ▼                      ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │   Calculate Subnet   │  │   Generate Binary    │
        │   Information        │  │   Representation     │
        │  • Network Address   │  │  (for analysis)      │
        │  • Broadcast Address │  └──────────────────────┘
        │  • Usable IPs        │
        │  • Host Count        │
        │  • IP Class          │
        │  • Private/Public    │
        └──────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────┐
        │  Apply Advanced Operations (if needed)   │
        │  ├─ Supernetting (combine networks)     │
        │  ├─ Subnetting (divide networks)        │
        │  └─ VLSM (allocate by requirements)     │
        └─────────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────┐
        │  Format Results for Display             │
        │  ├─ Generate CIDR notation              │
        │  ├─ Create subnet tables                │
        │  └─ Highlight key information           │
        └─────────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────────────────────────┐
        │  Display Results                        │
        │  ├─ All calculated values               │
        │  ├─ Copy-to-clipboard buttons           │
        │  └─ Additional options                  │
        └─────────────────────────────────────────┘
```

## Component Hierarchy

```
SubnetCalculator (Main Component)
│
├── State Management
│   ├── ip, mask, cidrValue
│   ├── usesCIDR (toggle)
│   ├── subnetInfo (results)
│   ├── expandedSections (accordion)
│   ├── supernettingInputs[], supernettingResult
│   ├── subnettingCIDR, subnettingResult
│   ├── vlsmRequirements[], vlsmResult
│   └── copiedText (for feedback)
│
├── Sections
│   ├── Header
│   │   ├── Title
│   │   └── Description
│   │
│   ├── Error Display
│   │   └── AlertCircle Icon + Message
│   │
│   ├── Basic Calculator Section
│   │   ├── IP Input
│   │   ├── Mask/CIDR Toggle
│   │   ├── Calculate Button
│   │   └── Results Grid (12 items)
│   │
│   ├── Supernetting Section
│   │   ├── Instructions
│   │   ├── Input Fields (dynamic)
│   │   ├── Add/Remove Buttons
│   │   ├── Calculate Button
│   │   └── Results Display
│   │
│   ├── Subnetting Section (conditional)
│   │   ├── Instructions
│   │   ├── CIDR Input
│   │   ├── Subnet Count Display
│   │   ├── Calculate Button
│   │   └── Scrollable Results List
│   │
│   └── VLSM Section (conditional)
│       ├── Instructions
│       ├── Requirement Inputs (dynamic)
│       ├── Add/Remove Buttons
│       ├── Calculate Button
│       └── Allocation Results
│
└── Helper Functions
    ├── handleCalculate()
    ├── handleSupernetting()
    ├── handleSubnetting()
    ├── handleVLSM()
    ├── toggleSection()
    ├── copyToClipboard()
    ├── updateSupernettingInput()
    ├── updateVLSMRequirement()
    └── addInput/removeInput functions
```

## Function Architecture

```
subnetCalculator.js (Utilities Module)
│
├── Input Processing
│   ├── parseCIDR(cidrNotation)
│   │   └─ Extracts IP and prefix from CIDR
│   │
│   └── Validation (uses ipValidation.js)
│       ├─ isValidIPv4()
│       └─ isValidSubnetMask()
│
├── Core Calculation Engine
│   ├── calculateSubnetInfo(ip, maskOrCidr)
│   │   ├─ Determine mask format
│   │   ├─ Calculate network address (bitwise AND)
│   │   ├─ Calculate broadcast address (bitwise OR)
│   │   ├─ Determine usable host range
│   │   ├─ Count total and usable hosts
│   │   ├─ Determine IP class
│   │   ├─ Detect private vs public
│   │   ├─ Calculate wildcard mask
│   │   └─ Return comprehensive info object
│   │
│   ├── IP Manipulation
│   │   ├─ incrementIP(ip)
│   │   │   └─ Convert to 32-bit number, add 1, convert back
│   │   │
│   │   └─ decrementIP(ip)
│   │       └─ Convert to 32-bit number, subtract 1, convert back
│   │
│   └── IP Classification
│       ├─ getIPClass(ip)
│       │   └─ Check first octet value
│       │
│       └─ isPrivateIP(ip)
│           └─ Check against RFC 1918 ranges
│
├── Supernetting Engine
│   └── calculateSupernetting(subnets[])
│       ├─ Parse all CIDR inputs
│       ├─ Convert IPs to binary
│       ├─ Find common prefix length
│       ├─ Validate contiguity
│       ├─ Find smallest encompassing network
│       └─ Return supernet CIDR and details
│
├── Subnetting Engine
│   └── calculateSubnetting(cidrNotation, newCidr)
│       ├─ Parse parent network
│       ├─ Validate new CIDR > original
│       ├─ Calculate subnet count
│       ├─ Calculate hosts per subnet
│       ├─ Generate all subnets
│       ├─ Validate within parent bounds
│       └─ Return subnet array
│
├── VLSM Engine
│   └── calculateVLSM(cidrNotation, requirements[])
│       ├─ Sort requirements by size (descending)
│       ├─ For each requirement:
│       │   ├─ Calculate CIDR needed
│       │   ├─ Allocate subnet
│       │   ├─ Verify within parent network
│       │   └─ Move to next available space
│       └─ Return allocation array
│
├── Utility Functions
│   ├─ ipToBinary(ip)
│   │   └─ Convert IP to 32-bit binary string
│   │
│   ├─ ipToNumber(ip)
│   │   └─ Convert IP to 32-bit unsigned integer
│   │
│   ├─ isIPInRange(ip, rangeStart, rangeEnd)
│   │   └─ Check if IP falls within range
│   │
│   ├─ calculateWildcardMask(mask)
│   │   └─ Invert all bits of subnet mask
│   │
│   └─ maskToCIDR/cidrToMask (from ipValidation.js)
│       └─ Format conversion
│
└── Error Handling
    ├─ Input validation checks
    ├─ Format validation
    ├─ Range boundary checks
    └─ Contiguity verification
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                 SubnetCalculator Component                   │
│                                                               │
│  Primary State (Basic Calculator)                            │
│  ├─ ip: string                                               │
│  ├─ mask: string                                             │
│  ├─ cidrValue: string                                        │
│  ├─ usesCIDR: boolean                                        │
│  ├─ subnetInfo: object | null                                │
│  └─ error: string | null                                     │
│                                                               │
│  UI State (Accordion)                                        │
│  └─ expandedSections: {                                      │
│     ├─ basicInfo: boolean                                    │
│     ├─ supernetting: boolean                                 │
│     ├─ subnetting: boolean                                   │
│     └─ vlsm: boolean                                         │
│  }                                                           │
│                                                               │
│  Supernetting State                                          │
│  ├─ supernettingInputs: string[]                            │
│  └─ supernettingResult: object | null                       │
│                                                               │
│  Subnetting State                                            │
│  ├─ subnettingCIDR: string                                  │
│  └─ subnettingResult: object | null                         │
│                                                               │
│  VLSM State                                                  │
│  ├─ vlsmRequirements: [{hosts, name}]                       │
│  └─ vlsmResult: object | null                               │
│                                                               │
│  Interaction State                                           │
│  └─ copiedText: string | null                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         │
         └─► On State Change ──┐
             │                 │
             ▼                 ▼
    [Re-render Component]  [Trigger Callback]
         │
         └─► useCallback optimizations
             ├─ handleCalculate()
             ├─ handleSupernetting()
             ├─ handleSubnetting()
             ├─ handleVLSM()
             ├─ toggleSection()
             ├─ copyToClipboard()
             └─ updateFunctions()
```

## Integration Points

```
Network Planner Architecture
│
├─ Existing Utilities
│  ├─ ipValidation.js ◄──────────────┐
│  │   • isValidIPv4()              │
│  │   • isValidSubnetMask()        │ Used by
│  │   • maskToCIDR()               │ subnetCalculator.js
│  │   • cidrToMask()               │
│  │   • calculateNetworkAddress()  │
│  │   • calculateBroadcastAddress()│
│  │   • calculateUsableHosts()     │
│  └────────────────────────────────┘
│
├─ Existing Components
│  ├─ App.jsx
│  │  ├─ Imports: SubnetCalculator
│  │  ├─ Routes: Calculator tab
│  │  └─ Styles: currentTheme
│  │
│  ├─ SettingsContext.jsx
│  │   └─ Provides: theme colors
│  │
│  └─ Other components (independent)
│
└─ New Components
   └─ SubnetCalculator.jsx
      ├─ Uses: subnetCalculator.js utilities
      ├─ Uses: ipValidation.js
      ├─ Imports: lucide-react icons
      ├─ Styles: Tailwind CSS
      └─ State: React hooks (useState, useCallback)
```

## Class Diagram (If Future OOP Refactoring Needed)

```
┌─────────────────────────────┐
│      Subnet                 │
├─────────────────────────────┤
│ - ip: string                │
│ - cidr: number              │
│ - mask: string              │
├─────────────────────────────┤
│ + getNetworkAddress()       │
│ + getBroadcastAddress()     │
│ + getFirstUsableIP()        │
│ + getLastUsableIP()         │
│ + getUsableHostCount()      │
│ + getTotalHostCount()       │
│ + getIPClass()              │
│ + isPrivate()               │
│ + toCIDRNotation()          │
│ + toStringFormat()          │
└─────────────────────────────┘
         △
         │ inherits
         │
┌─────────────────────────────┐
│   SupernetCalculator        │
├─────────────────────────────┤
│ - subnets: Subnet[]         │
├─────────────────────────────┤
│ + summarize()               │
│ + validateContiguity()      │
│ + findCommonPrefix()        │
└─────────────────────────────┘

┌─────────────────────────────┐
│   SubnetDivider             │
├─────────────────────────────┤
│ - parentSubnet: Subnet      │
│ - targetCIDR: number        │
├─────────────────────────────┤
│ + divide()                  │
│ + generateSubnets()         │
│ + validateBoundaries()      │
└─────────────────────────────┘

┌─────────────────────────────┐
│   VLSMAllocator             │
├─────────────────────────────┤
│ - parentSubnet: Subnet      │
│ - requirements: Req[]       │
├─────────────────────────────┤
│ + allocate()                │
│ + optimizeAllocation()      │
│ + validateAllocation()      │
└─────────────────────────────┘
```

## Performance Characteristics

```
Operation               Time Complexity    Space Complexity    Notes
─────────────────────────────────────────────────────────────────
parseIPv4()             O(1)              O(1)               Regex match
calculateSubnetInfo()   O(1)              O(1)               Fixed 32-bit ops
incrementIP()           O(1)              O(1)               Arithmetic ops
decrementIP()           O(1)              O(1)               Arithmetic ops
ipToBinary()            O(1)              O(1)               Fixed length
calculateSupernet()     O(n)              O(n)               n = subnet count
calculateSubnetting()   O(2^m)            O(2^m)             m = CIDR difference
calculateVLSM()         O(n log n)        O(n)               Sorting + allocation
─────────────────────────────────────────────────────────────────
Rendering (Component)   O(n)              O(n)               n = result items
UI Update               Immediate         Min                useCallback optimized
```

## Security Considerations

```
✓ Input Validation
  ├─ IP format validation (regex)
  ├─ CIDR range validation (0-32)
  ├─ Subnet mask contiguity check
  └─ Boundary validation

✓ No External Dependencies
  ├─ Pure JavaScript calculations
  ├─ No eval() or dynamic code execution
  └─ No network requests

✓ Error Handling
  ├─ Graceful error messages
  ├─ Input sanitization
  └─ Safe type conversions

✓ XSS Protection
  ├─ React escaping (automatic)
  ├─ No innerHTML usage
  └─ Safe clipboard API usage
```

---

This architecture ensures:
- ✅ Separation of concerns (UI vs Logic)
- ✅ Reusability (utilities can be used elsewhere)
- ✅ Testability (pure functions, easy to unit test)
- ✅ Maintainability (clear structure, well-documented)
- ✅ Performance (O(1) for most operations)
- ✅ Scalability (can handle edge cases)

