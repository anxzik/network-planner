# Network Planner

A cross-platform desktop application for designing and planning network topologies. Built with Electron, React, and ReactFlow.

## Features

- **Interactive Topology Canvas** - Drag-and-drop network devices onto a visual canvas
- **Device Library** - Comprehensive catalog of SOHO, Enterprise, SDN, and Cloud equipment
- **VLAN Management** - Create, edit, and assign VLANs to device ports
- **Port Configuration** - Visual port selection with status indicators
- **IP Subnet Calculator** - Calculate subnets, supernets, and VLSM allocations
- **Scratchpad** - Save calculations and notes for reference
- **Multiple Views** - Topology, List, and Calculator views
- **Physical/Logical Modes** - Switch between connection types
- **Theme Support** - Customizable UI themes
- **Local Persistence** - Data saved to localStorage

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Package for distribution
npm run make
```

## Requirements

- Node.js 18+
- npm 9+

## Technology Stack

- **Electron 40** - Desktop application framework
- **React 19** - UI framework
- **ReactFlow 11** - Graph visualization
- **Tailwind CSS 4** - Styling
- **Vite 5** - Build tool
- **Electron Forge** - Build and packaging

## Documentation

See the `dev-stuff/` directory for detailed documentation:

- `CLAUDE.md` - Development guide
- `ARCHITECTURE.md` - System architecture
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `SUBNET_CALCULATOR.md` - Calculator documentation
- `SUBNET_CALCULATOR_QUICKSTART.md` - Calculator quick start

## License

MIT
