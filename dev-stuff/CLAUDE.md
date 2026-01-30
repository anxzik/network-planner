# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

 A platform-agnostic network planning application with comprehensive IP assignment, subnet calculation, and network visualization capabilities. Built with React 19, Vite, and ReactFlow for interactive network topology design.

### Core Features

1. **Network Visualization**: Top-down view of network topology using ReactFlow
2. **Device Library**: Comprehensive catalog of networking equipment
   - SOHO switches, routers, and appliances
   - Enterprise-grade equipment
   - Modern platforms: SDN controllers, Cloud Networking components
3. **IP Management Tools**
   - IP assignment and tracking
   - Subnet calculators
   - Supernetting tools
   - Automated IP/subnet configuration based on network requirements
4. **Device Configuration**: Per-node data management
   - FQDN (Fully Qualified Domain Name)
   - Name/Alias
   - Subnet mask
   - IPv4 address
   - IPv6 address
   - Gateway
   - DNS 1 and DNS 2
   - Notes field
5. **Port Visualization**: Front panel view showing interface usage for each device
6. **Network Planning Wizard**: Calculate optimal IP and subnet configuration from:
   - Network size
   - Uplink speed (1Gbps, 10Gbps, etc.)
   - Expected total hosts

## Development Commands

### Running the Application
```bash
npm run dev          # Start development server with HMR
npm run preview      # Preview production build locally
```

### Building
```bash
npm run build        # Create production build in dist/
```

### Linting
```bash
npm run lint         # Run ESLint on all .js and .jsx files
```

## Technology Stack

- **React 19.2.0** - UI framework with latest features
- **Vite 7.2.5** - Build tool and dev server
- **ReactFlow 11.11.4** - Node-based graph visualization library (key dependency for network planning)
- **Expo 54.0.31** - Present in dependencies (usage to be determined)

## Project Structure

### Current Structure
```
network-planner/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point with StrictMode
│   ├── App.css          # App-specific styles
│   ├── index.css        # Global styles
│   └── assets/          # Static assets (images, SVGs)
├── public/              # Public static files
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── eslint.config.js     # ESLint flat config setup
└── package.json
```

### Recommended Structure for Implementation
```
network-planner/
├── src/
│   ├── components/
│   │   ├── Canvas/              # ReactFlow canvas components
│   │   ├── DeviceLibrary/       # Device palette/browser
│   │   ├── NodeConfig/          # Configuration panel
│   │   ├── IPTools/             # Subnet calculators, wizards
│   │   ├── PortView/            # Front panel visualization
│   │   └── nodes/               # Custom ReactFlow node types
│   ├── data/
│   │   └── devices.js           # Device library catalog
│   ├── utils/
│   │   ├── ipCalculations.js   # IP/subnet math utilities
│   │   ├── validators.js        # Input validation
│   │   └── export.js            # Topology export/import
│   ├── hooks/                   # Custom React hooks
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── device-icons/            # SVG/PNG device icons
└── [config files]
```

## Code Architecture

### Application Structure

The application should be organized into these main areas:

1. **Network Topology Canvas** (ReactFlow-based)
   - Custom node components for each device type
   - Edge components for network connections
   - Interactive drag-and-drop interface
   - Zoom and pan controls

2. **Device Library/Palette**
   - Categorized equipment browser (SOHO, Enterprise, SDN, Cloud)
   - Device specifications and port layouts
   - Drag-to-canvas functionality

3. **Node Configuration Panel**
   - Form for editing device properties (FQDN, IPs, DNS, etc.)
   - Port assignment interface
   - Visual front panel showing port usage

4. **IP Planning Tools**
   - Subnet calculator component
   - Supernet calculator
   - IP address assignment automation
   - Network planning wizard with capacity inputs

5. **Data Model**
   - Network topology state (nodes, edges, positions)
   - Device configurations (per-node data)
   - IP address allocations
   - Port usage tracking

### ReactFlow Integration

- Use custom node types for different device categories
- Each node type should render device icon + label
- Node data should include: device specs, IP config, port status
- Edges represent network connections with metadata (speed, protocol)

### State Management

Consider state management strategy for:
- Network topology data
- Device library catalog
- IP address pools and assignments
- User configurations and preferences

### UI/UX Principles

- **Responsive Design**: Must work on various screen sizes
- **Sleek Interface**: Modern, clean visual design
- **Top-down View**: Network represented from bird's-eye perspective
- **Intuitive Controls**: Clear drag-drop, selection, and editing patterns

### Build Configuration
- Uses `@vitejs/plugin-react` with Babel for Fast Refresh
- ES modules enabled (`"type": "module"` in package.json)
- Output directory: `dist/` (ignored by ESLint)

## ESLint Configuration

The project uses ESLint's flat config format with:
- JavaScript ES2020 features
- React Hooks plugin with recommended rules
- React Refresh plugin for Vite
- Custom rule: `no-unused-vars` allows uppercase/underscore prefixed variables to be unused
- Browser globals enabled
- JSX support enabled

## Implementation Considerations

### IP Calculations
- Subnet mask to CIDR notation conversions
- IPv4 and IPv6 address validation
- Subnet overlap detection
- Host capacity calculations
- VLSM (Variable Length Subnet Masking) support

### Device Data Model
Each network device node should track:
- Device metadata (type, model, manufacturer)
- Port configuration (count, speed, usage status)
- Layer 2/3 properties
- IP configurations (IPv4/IPv6, gateway, DNS)
- Physical connections (which ports connect to which devices)

### Network Types to Support
- **SOHO**: Home routers, small switches, access points
- **Enterprise**: Core switches, distribution switches, enterprise routers, firewalls
- **SDN**: Controllers, virtual switches, orchestrators
- **Cloud**: VPCs, cloud routers, load balancers, gateways

### Platform Agnostic Considerations
- Client-side only (no backend required for core functionality)
- Export/import topology configurations (JSON format)
- Print-friendly network diagrams
- Potentially support multiple output formats (PNG, SVG, PDF)

## Development Notes

- Project uses JavaScript (not TypeScript)
- No test framework currently configured
- React Compiler intentionally disabled for dev/build performance
- Focus on responsive, intuitive UI/UX
- ReactFlow documentation: https://reactflow.dev/