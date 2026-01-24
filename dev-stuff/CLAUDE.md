# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A cross-platform network planning desktop application built with **Electron**, **React 19**, and **ReactFlow**. Provides comprehensive IP assignment, subnet calculation, VLAN management, and interactive network visualization capabilities.

### Core Features

1. **Network Visualization**: Interactive topology canvas using ReactFlow
   - Physical view: Shows physical network connections
   - Logical view: Shows logical topology with IP addressing
   - Drag-and-drop device placement
   - Custom node types for each device category

2. **Device Library**: Comprehensive catalog of networking equipment
   - SOHO switches, routers, and appliances
   - Enterprise-grade equipment (core/distribution switches, routers, firewalls)
   - SDN controllers and virtual switches
   - Cloud networking components (VPCs, load balancers)

3. **VLAN Management**
   - Create, edit, and delete VLANs
   - Assign VLANs to device ports
   - Visual VLAN indicators on topology
   - VLAN search and filtering

4. **Port Configuration**
   - Port selector modal for connecting devices
   - Port assignment interface per device
   - Visual port status indicators
   - Connection summary display

5. **IP Management Tools**
   - Full-featured subnet calculator with four sections:
     - Basic Calculator (IP/mask to subnet details)
     - Supernetting (route summarization)
     - Subnetting (network division)
     - VLSM allocation (variable length subnet masks)
   - Copy-to-clipboard for all calculated values

6. **Device Configuration**: Per-node data management
   - FQDN (Fully Qualified Domain Name)
   - Name/Alias
   - Subnet mask
   - IPv4 address
   - IPv6 address
   - Gateway
   - DNS 1 and DNS 2
   - Notes field

7. **Scratchpad**
   - Save subnet calculations for later reference
   - Notes section with auto-save
   - Resizable panel
   - Clear and delete individual calculations

8. **List View**
   - Tabular view of all network devices
   - Network object forms for detailed editing
   - Alternative to topology view for data management

## Development Commands

### Running the Application

```bash
npm start              # Start Electron app in development mode
npm run lint           # Run ESLint
```

### Building / Packaging

```bash
npm run package        # Package app for current platform
npm run make           # Create distributable installers
npm run publish        # Publish to configured targets
```

## Technology Stack

- **Electron 40.0.0** - Desktop application framework
- **Electron Forge 7.11.1** - Build tooling and packaging
- **React 19.2.3** - UI framework
- **ReactFlow 11.11.4** - Node-based graph visualization
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Vite 5.4.21** - Build tool (via Electron Forge plugin)
- **Lucide React** - Icon library
- **TypeScript** - For Electron main/preload processes

## Project Structure

```text
network-planner/
├── src/
│   ├── main.ts                      # Electron main process
│   ├── preload.ts                   # Electron preload script
│   ├── renderer.ts                  # Renderer entry point
│   ├── main.jsx                     # React entry point
│   ├── App.jsx                      # Main application component
│   ├── App.css                      # App-specific styles
│   ├── index.css                    # Global styles (Tailwind)
│   ├── components/
│   │   ├── Canvas/
│   │   │   ├── NetworkCanvas.jsx    # ReactFlow canvas wrapper
│   │   │   ├── Controls.jsx         # Canvas zoom/pan controls
│   │   │   └── ConnectionNotification.jsx
│   │   ├── DeviceLibrary/
│   │   │   ├── DeviceLibrary.jsx    # Device palette sidebar
│   │   │   ├── DeviceCard.jsx       # Individual device card
│   │   │   └── DeviceCategory.jsx   # Category accordion
│   │   ├── ListView/
│   │   │   ├── ListView.jsx         # Tabular device view
│   │   │   ├── TopologyDeviceList.jsx
│   │   │   └── NetworkObjectForm.jsx
│   │   ├── NodeConfig/
│   │   │   ├── NodeConfigPanel.jsx  # Device configuration panel
│   │   │   └── PortConfigRow.jsx    # Port configuration row
│   │   ├── PortSelector/
│   │   │   ├── PortSelectorModal.jsx  # Port selection modal
│   │   │   ├── PortPanel.jsx          # Port display panel
│   │   │   └── PortConnectionSummary.jsx
│   │   ├── Scratchpad/
│   │   │   ├── Scratchpad.jsx       # Scratchpad panel
│   │   │   ├── CalculationCard.jsx  # Saved calculation display
│   │   │   └── index.js
│   │   ├── Settings/
│   │   │   ├── SettingsModal.jsx    # Settings modal
│   │   │   ├── CanvasSettings.jsx   # Canvas configuration
│   │   │   ├── UISettings.jsx       # UI preferences
│   │   │   └── DeviceLibrarySettings.jsx
│   │   ├── SubnetCalculator/
│   │   │   └── SubnetCalculator.jsx # IP subnet calculator
│   │   ├── VlanConfig/
│   │   │   ├── VlanConfigPanel.jsx  # VLAN management panel
│   │   │   ├── VlanCard.jsx         # VLAN display card
│   │   │   └── VlanEditor.jsx       # VLAN create/edit modal
│   │   └── nodes/
│   │       ├── DeviceNode.jsx       # Custom ReactFlow node
│   │       └── index.js
│   ├── context/
│   │   ├── NetworkContext.jsx       # Network topology state
│   │   ├── SettingsContext.jsx      # App settings and themes
│   │   └── ScratchpadContext.jsx    # Scratchpad state
│   ├── data/
│   │   └── devices.js               # Device library catalog
│   └── utils/
│       ├── subnetCalculator.js      # IP/subnet calculation utilities
│       ├── ipValidation.js          # IP format validation
│       ├── connectionValidation.js  # Connection rule validation
│       ├── vlanFactory.js           # VLAN creation utilities
│       ├── portFactory.js           # Port initialization utilities
│       ├── nodeFactory.js           # Node creation utilities
│       ├── deviceHelpers.js         # Device data helpers
│       └── storage.js               # Local storage utilities
├── public/                          # Static assets
├── index.html                       # HTML entry point
├── forge.config.ts                  # Electron Forge configuration
├── vite.main.config.mts             # Vite config for main process
├── vite.preload.config.mts          # Vite config for preload
├── vite.renderer.config.mts         # Vite config for renderer
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── eslint.config.js                 # ESLint configuration
└── package.json
```

## Code Architecture

### Application Views

The application has three main views accessible via tabs:

1. **Topology View** (default)
   - ReactFlow canvas for network visualization
   - Device library sidebar (collapsible)
   - VLAN management panel (toggleable)
   - Node configuration panel (on device select)

2. **List View**
   - Tabular display of all devices
   - Network object editing forms
   - Alternative data management interface

3. **Calculator View**
   - Standalone subnet calculator
   - Four calculation modes (Basic, Supernet, Subnet, VLSM)

### State Management

Uses React Context for global state:

- **NetworkContext**: Topology data (nodes, edges), VLANs, view mode
- **SettingsContext**: Theme, UI preferences, settings modal state
- **ScratchpadContext**: Saved calculations, notes, panel state

### ReactFlow Integration

- Custom `DeviceNode` component renders all device types
- Edges represent physical network connections
- Node data includes: device specs, IP config, port status, VLAN assignments
- Supports drag-from-library device creation

### Electron Architecture

- **Main Process** (`main.ts`): Window management, native APIs
- **Preload Script** (`preload.ts`): Secure context bridge
- **Renderer Process**: React application

### UI/UX Principles

- **Theme System**: Supports multiple color themes via SettingsContext
- **Responsive Panels**: Resizable scratchpad, collapsible sidebars
- **Keyboard Shortcuts**: Delete key removes selected nodes
- **Copy-to-Clipboard**: Available throughout the application

## Build Configuration

### Electron Forge

- Uses VitePlugin for bundling
- Makers configured for: Squirrel (Windows), ZIP (macOS), DEB/RPM (Linux)
- ASAR packaging enabled
- Security fuses configured (cookie encryption, no node options)

### Vite

- Three separate configs: main, preload, renderer
- React plugin with Babel for Fast Refresh
- Tailwind CSS via PostCSS

### TypeScript

- Used for Electron main/preload (strict mode)
- React components use JSX (JavaScript)

## Implementation Notes

### IP Calculations

- Full IPv4 support with CIDR notation
- Subnet mask validation (contiguous bits)
- Private IP range detection (RFC 1918)
- IP class classification (A, B, C, D, E)
- Wildcard mask calculation

### Device Data Model

Each network device node tracks:

- Device metadata (type, model, manufacturer, category)
- Port configuration (count, speed, type, VLAN assignments)
- IP configurations (IPv4/IPv6, gateway, DNS, subnet)
- Physical connections (port-to-port mappings)
- Custom properties (FQDN, alias, notes)

### VLAN System

- Default VLAN 1 (cannot be deleted)
- Custom VLANs with ID, name, description, color
- Port-to-VLAN assignments (tagged/untagged)
- Visual indicators on topology

### Local Storage

- Topology data persists in localStorage
- Settings and preferences persisted
- Scratchpad notes auto-saved

## Development Notes

- JavaScript (JSX) for React components
- TypeScript for Electron processes only
- No test framework currently configured
- ReactFlow documentation: <https://reactflow.dev/>
- Electron Forge documentation: <https://www.electronforge.io/>
