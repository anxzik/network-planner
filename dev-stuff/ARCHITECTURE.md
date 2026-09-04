# Network Planner - Architecture & Design

## System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Electron Application                                  │
│                                                                              │
│  ┌────────────────────┐    ┌─────────────────────────────────────────────┐  │
│  │   Main Process     │    │           Renderer Process                  │  │
│  │   (main.ts)        │    │           (React Application)               │  │
│  │                    │    │                                             │  │
│  │  - Window Mgmt     │    │  ┌─────────────────────────────────────┐   │  │
│  │  - Native APIs     │◄───┤  │           App.jsx (Main)            │   │  │
│  │  - IPC Handling    │    │  │                                     │   │  │
│  └────────────────────┘    │  │  ┌─────────────────────────────┐   │   │  │
│           │                │  │  │     Navigation Tabs          │   │   │  │
│           ▼                │  │  │  [Topology] [List] [Calc]    │   │   │  │
│  ┌────────────────────┐    │  │  └─────────────────────────────┘   │   │  │
│  │  Preload Script    │    │  │                                     │   │  │
│  │  (preload.ts)      │    │  │  ┌─────────────────────────────┐   │   │  │
│  │                    │    │  │  │     Active View Content      │   │   │  │
│  │  - Context Bridge  │    │  │  │  ├─ Topology View           │   │   │  │
│  │  - Secure APIs     │    │  │  │  ├─ List View               │   │   │  │
│  └────────────────────┘    │  │  │  └─ Calculator View         │   │   │  │
│                            │  │  └─────────────────────────────┘   │   │  │
│                            │  │                                     │   │  │
│                            │  │  ┌─────────────────────────────┐   │   │  │
│                            │  │  │     Scratchpad Panel        │   │   │  │
│                            │  │  └─────────────────────────────┘   │   │  │
│                            │  └─────────────────────────────────────┘   │  │
│                            └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            App.jsx                                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         Header                                         │ │
│  │  [Logo] [Topology|List|Calculator] [Physical|Logical] [Stats] [Icons] │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Main Content Area                                 │ │
│  │                                                                        │ │
│  │  TOPOLOGY VIEW:                                                        │ │
│  │  ┌──────────┬─────────────────────────────┬─────────────────────────┐ │ │
│  │  │ VLAN     │    Device     │             │    Node Config Panel    │ │ │
│  │  │ Config   │    Library    │   Network   │    (on selection)       │ │ │
│  │  │ Panel    │    Sidebar    │   Canvas    │                         │ │ │
│  │  │          │               │  (ReactFlow)│                         │ │ │
│  │  └──────────┴───────────────┴─────────────┴─────────────────────────┘ │ │
│  │                                                                        │ │
│  │  LIST VIEW:                                                            │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │              ListView Component                                 │  │ │
│  │  │   - TopologyDeviceList                                          │  │ │
│  │  │   - NetworkObjectForm                                           │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  │                                                                        │ │
│  │  CALCULATOR VIEW:                                                      │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │              SubnetCalculator Component                         │  │ │
│  │  │   - Basic Calculator                                            │  │ │
│  │  │   - Supernetting                                                │  │ │
│  │  │   - Subnetting                                                  │  │ │
│  │  │   - VLSM Allocation                                             │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Scratchpad Panel (Resizable)                       │ │
│  │   [Calculations Tab] [Notes Tab]                                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        React Context Providers                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     NetworkContext                                   │   │
│  │                                                                      │   │
│  │  State:                       Actions:                               │   │
│  │  ├─ nodes: Node[]             ├─ addNode()                          │   │
│  │  ├─ edges: Edge[]             ├─ updateNode()                       │   │
│  │  ├─ vlans: VLAN[]             ├─ deleteNode()                       │   │
│  │  ├─ selectedNode: Node|null   ├─ addEdge()                          │   │
│  │  └─ viewMode: 'physical'|     ├─ updateEdge()                       │   │
│  │              'logical'        ├─ deleteEdge()                       │   │
│  │                               ├─ addVlan()                          │   │
│  │                               ├─ updateVlan()                       │   │
│  │                               ├─ deleteVlan()                       │   │
│  │                               └─ setViewMode()                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    SettingsContext                                   │   │
│  │                                                                      │   │
│  │  State:                       Actions:                               │   │
│  │  ├─ currentTheme: Theme       ├─ setTheme()                         │   │
│  │  ├─ isSettingsOpen: boolean   ├─ openSettings()                     │   │
│  │  ├─ canvasSettings: Object    ├─ closeSettings()                    │   │
│  │  └─ uiSettings: Object        └─ updateSettings()                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                   ScratchpadContext                                  │   │
│  │                                                                      │   │
│  │  State:                       Actions:                               │   │
│  │  ├─ isOpen: boolean           ├─ toggleScratchpad()                 │   │
│  │  ├─ panelHeight: number       ├─ setPanelHeight()                   │   │
│  │  ├─ notes: string             ├─ updateNotes()                      │   │
│  │  └─ calculations: Calc[]      ├─ addCalculation()                   │   │
│  │                               ├─ deleteCalculation()                │   │
│  │                               └─ clearAllCalculations()             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                           User Interactions                               │
│                                                                           │
│  Device Library     Canvas           Config Panel      Calculator        │
│  [Drag Device] → [Drop on Canvas] → [Select Node] → [Edit Properties]   │
│       │                │                  │                │             │
│       ▼                ▼                  ▼                ▼             │
└──────────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         NetworkContext                                    │
│                                                                           │
│    addNode()      updateNode()     updateEdge()     addVlan()            │
│       │               │                │                │                │
│       └───────────────┴────────────────┴────────────────┘                │
│                              │                                            │
│                              ▼                                            │
│                       State Update                                        │
│                              │                                            │
│                              ▼                                            │
│                       Re-render UI                                        │
│                              │                                            │
│                              ▼                                            │
│                    Persist to localStorage                                │
└──────────────────────────────────────────────────────────────────────────┘
```

## Subnet Calculator Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                    SubnetCalculator.jsx (React Component)                 │
│                                                                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Basic Calculator│  │  Supernetting   │  │   Subnetting    │          │
│  │     (Blue)      │  │    (Purple)     │  │    (Green)      │          │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
│           │                    │                    │                    │
│           └────────────────────┼────────────────────┘                    │
│                                │                                         │
│  ┌─────────────────────────────┼─────────────────────────────────────┐  │
│  │                   VLSM Allocation (Orange)                        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    subnetCalculator.js (Utilities)                        │
│                                                                           │
│  Core Functions:              Network Operations:     Utilities:          │
│  ├─ calculateSubnetInfo()     ├─ calculateSupernet()  ├─ ipToBinary()    │
│  ├─ parseCIDR()               ├─ calculateSubnets()   ├─ ipToNumber()    │
│  ├─ incrementIP()             └─ calculateVLSM()      ├─ getIPClass()    │
│  └─ decrementIP()                                     └─ isPrivateIP()   │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       ipValidation.js (Validation)                        │
│                                                                           │
│  ├─ isValidIPv4()          ├─ maskToCIDR()          ├─ calculateNetwork()│
│  ├─ isValidSubnetMask()    ├─ cidrToMask()          └─ calculateBroadcast│
│  └─ isValidCIDR()          └─ validateCIDRNotation()                     │
└──────────────────────────────────────────────────────────────────────────┘
```

## VLAN Management Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      VLAN Configuration System                            │
│                                                                           │
│  ┌────────────────────┐    ┌────────────────────┐    ┌────────────────┐ │
│  │  VlanConfigPanel   │ ←→ │     VlanCard       │ ←→ │   VlanEditor   │ │
│  │                    │    │                    │    │                │ │
│  │  - VLAN List       │    │  - Display VLAN    │    │  - Create VLAN │ │
│  │  - Search/Filter   │    │  - Edit/Delete     │    │  - Edit VLAN   │ │
│  │  - Create Button   │    │  - Port Count      │    │  - Validation  │ │
│  └────────────────────┘    └────────────────────┘    └────────────────┘ │
│           │                         │                        │           │
│           └─────────────────────────┼────────────────────────┘           │
│                                     │                                    │
│                                     ▼                                    │
│                            NetworkContext                                │
│                         (vlans state array)                              │
│                                     │                                    │
│                                     ▼                                    │
│                            vlanFactory.js                                │
│                      (VLAN creation utilities)                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## Port Selection Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                      Port Selection System                                │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    PortSelectorModal                               │ │
│  │                                                                    │ │
│  │  ┌────────────────────┐    ┌────────────────────┐                 │ │
│  │  │    PortPanel       │    │    PortPanel       │                 │ │
│  │  │   (Source Device)  │    │  (Target Device)   │                 │ │
│  │  │                    │    │                    │                 │ │
│  │  │  - Port Grid       │    │  - Port Grid       │                 │ │
│  │  │  - Port Status     │◄──►│  - Port Status     │                 │ │
│  │  │  - VLAN Tags       │    │  - VLAN Tags       │                 │ │
│  │  └────────────────────┘    └────────────────────┘                 │ │
│  │                                                                    │ │
│  │  ┌────────────────────────────────────────────────────────────┐   │ │
│  │  │              PortConnectionSummary                         │   │ │
│  │  │   - Selected Ports Display                                 │   │ │
│  │  │   - Connection Validation                                  │   │ │
│  │  │   - Confirm/Cancel Actions                                 │   │ │
│  │  └────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                     │                                    │
│                                     ▼                                    │
│                         portFactory.js                                   │
│                    (Port initialization & updates)                       │
└──────────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```text
App.jsx
├── Header
│   ├── Logo + Title
│   ├── View Tabs (Topology | List | Calculator)
│   ├── View Mode Toggle (Physical | Logical) [Topology only]
│   ├── Stats (Devices, Connections, VLANs)
│   ├── VLAN Manager Button [Topology only]
│   ├── Scratchpad Toggle Button
│   └── Settings Button
│
├── Main Content
│   ├── [Topology View]
│   │   ├── VlanConfigPanel
│   │   │   ├── VlanCard (multiple)
│   │   │   └── VlanEditor (modal)
│   │   ├── DeviceLibrary
│   │   │   ├── DeviceCategory (multiple)
│   │   │   └── DeviceCard (multiple)
│   │   ├── NetworkCanvas (ReactFlow)
│   │   │   └── DeviceNode (custom node type)
│   │   └── NodeConfigPanel (on selection)
│   │       └── PortConfigRow (multiple)
│   │
│   ├── [List View]
│   │   └── ListView
│   │       ├── TopologyDeviceList
│   │       └── NetworkObjectForm
│   │
│   └── [Calculator View]
│       └── SubnetCalculator
│
├── Scratchpad
│   └── CalculationCard (multiple)
│
├── SettingsModal
│   ├── CanvasSettings
│   ├── UISettings
│   └── DeviceLibrarySettings
│
└── PortSelectorModal (on connection)
    ├── PortPanel (source)
    ├── PortPanel (target)
    └── PortConnectionSummary
```

## Utility Modules

```text
src/utils/
├── subnetCalculator.js     # IP subnet calculation engine
│   ├── calculateSubnetInfo()
│   ├── calculateSupernetting()
│   ├── calculateSubnetting()
│   └── calculateVLSM()
│
├── ipValidation.js         # IP address validation
│   ├── isValidIPv4()
│   ├── isValidSubnetMask()
│   ├── maskToCIDR() / cidrToMask()
│   └── calculateNetworkAddress() / calculateBroadcastAddress()
│
├── connectionValidation.js # Network connection rules
│   └── validateConnection()
│
├── vlanFactory.js          # VLAN creation & management
│   ├── createVlan()
│   ├── isDefaultVlan()
│   └── getNextVlanId()
│
├── portFactory.js          # Port initialization
│   ├── createPortsForDevice()
│   └── updatePortConnection()
│
├── nodeFactory.js          # ReactFlow node creation
│   └── createNodeFromDevice()
│
├── deviceHelpers.js        # Device data utilities
│   └── getDeviceById()
│
└── storage.js              # localStorage persistence
    ├── saveTopology()
    ├── loadTopology()
    └── saveSettings()
```

## Build Architecture

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                        Electron Forge Build System                        │
│                                                                           │
│  forge.config.ts                                                          │
│  ├── VitePlugin                                                           │
│  │   ├── Main Process Build (vite.main.config.mts)                       │
│  │   │   └── Entry: src/main.ts                                          │
│  │   ├── Preload Build (vite.preload.config.mts)                         │
│  │   │   └── Entry: src/preload.ts                                       │
│  │   └── Renderer Build (vite.renderer.config.mts)                       │
│  │       └── Entry: index.html → src/main.jsx                            │
│  │                                                                        │
│  ├── Makers                                                               │
│  │   ├── MakerSquirrel  → Windows (.exe installer)                       │
│  │   ├── MakerZIP       → macOS (.app in .zip)                           │
│  │   ├── MakerDeb       → Linux (.deb package)                           │
│  │   └── MakerRpm       → Linux (.rpm package)                           │
│  │                                                                        │
│  └── FusesPlugin (Security)                                               │
│      ├── Cookie Encryption: Enabled                                       │
│      ├── ASAR Integrity: Enabled                                          │
│      └── Node Options: Disabled                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## Performance Characteristics

| Operation | Time Complexity | Space Complexity | Notes |
|-----------|-----------------|------------------|-------|
| Add Node | O(1) | O(1) | Direct state update |
| Update Node | O(1) | O(1) | Object reference update |
| Delete Node | O(n) | O(1) | Edge cleanup required |
| Add/Update Edge | O(1) | O(1) | Direct state update |
| Calculate Subnet | O(1) | O(1) | Fixed 32-bit operations |
| Calculate VLSM | O(n log n) | O(n) | Sorting + allocation |
| Calculate Subnets | O(2^m) | O(2^m) | m = CIDR difference |
| VLAN Search/Filter | O(n) | O(n) | Linear filter |
| localStorage Save | O(n) | O(n) | JSON serialization |

## Security Considerations

- **Electron Security**
  - Context isolation enabled
  - Node integration disabled in renderer
  - Preload script for secure IPC
  - ASAR integrity validation

- **Input Validation**
  - IP format validation (regex)
  - CIDR range validation (0-32)
  - Subnet mask contiguity check
  - XSS prevention via React escaping

- **Data Storage**
  - Client-side only (localStorage)
  - No external API calls
  - No sensitive data transmission

---

This architecture ensures:

- Separation of concerns (UI, state, utilities)
- Clear component hierarchy
- Efficient state management with React Context
- Cross-platform desktop distribution
- Comprehensive IP/network calculations
- Flexible VLAN and port management
