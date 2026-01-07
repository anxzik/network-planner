// Device category definitions
export const deviceCategories = {
  Generic: {
    name: 'Generic',
    label: 'Generic Devices',
    color: '#6B7280',
    subcategories: ['Routers', 'Switches', 'Hubs', 'Modems', 'Access Points', 'Firewalls']
  },
  GenericLogical: {
    name: 'GenericLogical',
    label: 'Logical Components',
    color: '#8B5CF6',
    subcategories: ['VLANs', 'Subnets', 'Routing Protocols', 'Network Segments']
  },
  Cisco: {
    name: 'Cisco',
    label: 'Cisco Systems',
    color: '#049FD9',
    subcategories: ['Catalyst Switches', 'ISR Routers', 'ASA Firewalls', 'Nexus', 'Meraki']
  },
  Ubiquiti: {
    name: 'Ubiquiti',
    label: 'Ubiquiti Networks',
    color: '#0559C9',
    subcategories: ['UniFi Switches', 'Dream Machines', 'Access Points', 'EdgeRouters']
  },
  PaloAlto: {
    name: 'PaloAlto',
    label: 'Palo Alto Networks',
    color: '#FA582D',
    subcategories: ['PA-Series', 'Prisma', 'Panorama']
  },
  Dell: {
    name: 'Dell',
    label: 'Dell Networking',
    color: '#007DB8',
    subcategories: ['PowerSwitch', 'PowerConnect', 'Networking']
  },
  SOHO: {
    name: 'SOHO',
    label: 'Small Office / Home',
    color: '#4F46E5',
    subcategories: ['Routers', 'Switches', 'Access Points', 'Storage']
  },
  Enterprise: {
    name: 'Enterprise',
    label: 'Enterprise Equipment',
    color: '#DC2626',
    subcategories: ['Core', 'Distribution', 'Security']
  },
  SDN: {
    name: 'SDN',
    label: 'SDN / Virtual',
    color: '#059669',
    subcategories: ['Controllers', 'Virtual', 'Automation']
  },
  Cloud: {
    name: 'Cloud',
    label: 'Cloud Services',
    color: '#0284C7',
    subcategories: ['VPC', 'Load Balancers', 'Gateways', 'Security']
  }
};

// ==================== GENERIC PHYSICAL DEVICES ====================
export const devices = [
  // Generic Routers
  {
    id: 'gen-router-001',
    category: 'Generic',
    type: 'router',
    name: 'Router',
    manufacturer: 'Generic',
    model: 'Standard Router',
    description: 'Basic Layer 3 router for network routing',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 4, speed: '1Gbps' } },
      features: ['NAT', 'DHCP', 'Static Routing', 'Firewall'],
      layer: 3
    },
    icon: 'router',
    color: '#6B7280',
  },
  {
    id: 'gen-router-002',
    category: 'Generic',
    type: 'router',
    name: 'Core Router',
    manufacturer: 'Generic',
    model: 'Enterprise Router',
    description: 'High-performance routing for enterprise networks',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '10Gbps' } },
      features: ['BGP', 'OSPF', 'MPLS', 'QoS'],
      layer: 3
    },
    icon: 'router',
    color: '#6B7280',
  },

  // Generic Switches
  {
    id: 'gen-switch-001',
    category: 'Generic',
    type: 'switch',
    name: 'Switch',
    manufacturer: 'Generic',
    model: 'Standard Switch',
    description: 'Layer 2 unmanaged switch',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps' } },
      features: ['Auto-MDI/MDIX', 'Store-and-Forward'],
      layer: 2
    },
    icon: 'network',
    color: '#6B7280',
  },
  {
    id: 'gen-switch-002',
    category: 'Generic',
    type: 'switch',
    name: 'Managed Switch',
    manufacturer: 'Generic',
    model: 'L2 Managed',
    description: 'Layer 2 managed switch with VLANs',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 24, speed: '1Gbps' } },
      features: ['VLANs', 'QoS', 'SNMP', 'Port Mirroring'],
      layer: 2
    },
    icon: 'network',
    color: '#6B7280',
  },
  {
    id: 'gen-switch-003',
    category: 'Generic',
    type: 'switch',
    name: 'Layer 3 Switch',
    manufacturer: 'Generic',
    model: 'L3 Switch',
    description: 'Multilayer switch with routing capabilities',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps' }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['Layer 3 Routing', 'OSPF', 'VLANs', 'ACLs'],
      layer: 3
    },
    icon: 'server',
    color: '#6B7280',
  },
  {
    id: 'gen-switch-004',
    category: 'Generic',
    type: 'switch',
    name: 'Fiber Switch',
    manufacturer: 'Generic',
    model: 'SFP Switch',
    description: 'Fiber optic switch with SFP ports',
    viewType: 'physical',
    specifications: {
      ports: { sfp: { count: 24, speed: '1Gbps' } },
      features: ['Fiber Connectivity', 'Long Distance', 'Low Latency'],
      layer: 2
    },
    icon: 'network',
    color: '#6B7280',
  },

  // Generic Hubs
  {
    id: 'gen-hub-001',
    category: 'Generic',
    type: 'hub',
    name: 'Hub',
    manufacturer: 'Generic',
    model: 'Ethernet Hub',
    description: 'Legacy Layer 1 hub - broadcasts to all ports',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '100Mbps' } },
      features: ['Half-Duplex', 'Collision Domain'],
      layer: 1
    },
    icon: 'circle',
    color: '#6B7280',
  },

  // Generic Modems
  {
    id: 'gen-modem-001',
    category: 'Generic',
    type: 'modem',
    name: 'Cable Modem',
    manufacturer: 'Generic',
    model: 'DOCSIS 3.1',
    description: 'Cable modem for broadband internet',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 1, speed: '1Gbps' }, coax: { count: 1 } },
      features: ['DOCSIS 3.1', 'High-Speed Internet'],
      layer: 2
    },
    icon: 'router',
    color: '#6B7280',
  },
  {
    id: 'gen-modem-002',
    category: 'Generic',
    type: 'modem',
    name: 'DSL Modem',
    manufacturer: 'Generic',
    model: 'VDSL2',
    description: 'DSL modem for phone line internet',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 1, speed: '1Gbps' }, rj11: { count: 1 } },
      features: ['VDSL2', 'ADSL2+'],
      layer: 2
    },
    icon: 'router',
    color: '#6B7280',
  },
  {
    id: 'gen-modem-003',
    category: 'Generic',
    type: 'modem',
    name: 'Fiber Modem (ONT)',
    manufacturer: 'Generic',
    model: 'GPON ONT',
    description: 'Optical Network Terminal for fiber internet',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 4, speed: '1Gbps' }, fiber: { count: 1 } },
      features: ['GPON', 'Fiber to Home'],
      layer: 2
    },
    icon: 'zap',
    color: '#6B7280',
  },

  // Generic Firewalls
  {
    id: 'gen-firewall-001',
    category: 'Generic',
    type: 'firewall',
    name: 'Firewall',
    manufacturer: 'Generic',
    model: 'Stateful Firewall',
    description: 'Basic stateful packet inspection firewall',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 6, speed: '1Gbps' } },
      features: ['Stateful Inspection', 'NAT', 'VPN', 'ACLs'],
      layer: 4
    },
    icon: 'shield',
    color: '#6B7280',
  },

  // ==================== GENERIC LOGICAL COMPONENTS ====================
  {
    id: 'log-vlan-001',
    category: 'GenericLogical',
    type: 'vlan',
    name: 'VLAN',
    manufacturer: 'Logical',
    model: 'Virtual LAN',
    description: 'Virtual LAN for network segmentation',
    viewType: 'logical',
    specifications: {
      features: ['Layer 2 Segmentation', 'Broadcast Domain'],
      layer: 2,
      virtual: true
    },
    icon: 'git-branch',
    color: '#8B5CF6',
  },
  {
    id: 'log-subnet-001',
    category: 'GenericLogical',
    type: 'subnet',
    name: 'Subnet',
    manufacturer: 'Logical',
    model: 'IP Subnet',
    description: 'IP subnet for logical network division',
    viewType: 'logical',
    specifications: {
      features: ['IP Address Range', 'Network/Broadcast'],
      layer: 3,
      virtual: true
    },
    icon: 'box',
    color: '#8B5CF6',
  },
  {
    id: 'log-route-001',
    category: 'GenericLogical',
    type: 'routing',
    name: 'Routing Protocol',
    manufacturer: 'Logical',
    model: 'Dynamic Routing',
    description: 'Dynamic routing protocol (OSPF/BGP/EIGRP)',
    viewType: 'logical',
    specifications: {
      features: ['Path Selection', 'Route Advertisement'],
      layer: 3,
      virtual: true
    },
    icon: 'route',
    color: '#8B5CF6',
  },

  // ==================== CISCO DEVICES ====================
  // Cisco Catalyst Switches
  {
    id: 'cisco-cat-2960',
    category: 'Cisco',
    type: 'switch',
    name: 'Catalyst 2960',
    manufacturer: 'Cisco',
    model: 'Catalyst 2960-X',
    description: 'L2 Access Switch - 24/48 ports, PoE+, FlexStack',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfpPlus: { count: 2, speed: '10Gbps' } },
      features: ['FlexStack', 'PoE+ 370W', 'VLANs', 'QoS'],
      layer: 2,
      throughput: '176Gbps'
    },
    icon: 'network',
    color: '#049FD9',
  },
  {
    id: 'cisco-cat-3560',
    category: 'Cisco',
    type: 'switch',
    name: 'Catalyst 3560',
    manufacturer: 'Cisco',
    model: 'Catalyst 3560-X',
    description: 'L3 Switch - OSPF/EIGRP routing, Stacking, 24/48 ports',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['Layer 3 Routing', 'OSPF', 'EIGRP', 'StackWise-480', 'PoE+ 740W'],
      layer: 3,
      throughput: '176Gbps'
    },
    icon: 'server',
    color: '#049FD9',
  },
  {
    id: 'cisco-cat-3750',
    category: 'Cisco',
    type: 'switch',
    name: 'Catalyst 3750',
    manufacturer: 'Cisco',
    model: 'Catalyst 3750-X',
    description: 'L3 Stackable Switch - Enterprise access/distribution',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['StackWise Plus', 'Layer 3', 'OSPF/EIGRP/BGP', 'PoE+ 1150W'],
      layer: 3,
      throughput: '176Gbps'
    },
    icon: 'server',
    color: '#049FD9',
  },
  {
    id: 'cisco-cat-3850',
    category: 'Cisco',
    type: 'switch',
    name: 'Catalyst 3850',
    manufacturer: 'Cisco',
    model: 'Catalyst 3850',
    description: 'L3 Stackable Switch - 1/10G, StackPower, UADP',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['StackWise-480', 'UADP ASIC', 'Full Layer 3', 'PoE+ 1100W'],
      layer: 3,
      throughput: '480Gbps'
    },
    icon: 'server',
    color: '#049FD9',
  },
  {
    id: 'cisco-cat-9300',
    category: 'Cisco',
    type: 'switch',
    name: 'Catalyst 9300',
    manufacturer: 'Cisco',
    model: 'Catalyst 9300',
    description: 'Next-gen L3 Switch - DNA, StackWise Virtual, 24/48 ports',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['Cisco DNA', 'StackWise Virtual', 'UADP 3.0', 'PoE++ 1100W'],
      layer: 3,
      throughput: '440Gbps'
    },
    icon: 'server',
    color: '#049FD9',
  },
  {
    id: 'cisco-cat-9500',
    category: 'Cisco',
    type: 'switch',
    name: 'Catalyst 9500',
    manufacturer: 'Cisco',
    model: 'Catalyst 9500',
    description: 'Core/Aggregation Switch - 40/100G uplinks, modular',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '10Gbps' }, qsfp28: { count: 8, speed: '100Gbps' } },
      features: ['Modular', 'Cisco DNA', 'MACsec', 'Redundant Supervisors'],
      layer: 3,
      throughput: '12.8Tbps'
    },
    icon: 'server',
    color: '#049FD9',
  },

  // Cisco Nexus (Data Center)
  {
    id: 'cisco-nexus-5000',
    category: 'Cisco',
    type: 'switch',
    name: 'Nexus 5000',
    manufacturer: 'Cisco',
    model: 'Nexus 5548P',
    description: 'Top-of-Rack Switch - FCoE, 10G SFP+, FEX support',
    viewType: 'physical',
    specifications: {
      ports: { sfpPlus: { count: 48, speed: '10Gbps' } },
      features: ['FCoE', 'FEX', 'vPC', 'Low Latency'],
      layer: 3,
      throughput: '960Gbps'
    },
    icon: 'server',
    color: '#049FD9',
  },
  {
    id: 'cisco-nexus-7000',
    category: 'Cisco',
    type: 'switch',
    name: 'Nexus 7000',
    manufacturer: 'Cisco',
    model: 'Nexus 7700',
    description: 'Modular Data Center Core - Multi-Tbps, Redundancy',
    viewType: 'physical',
    specifications: {
      ports: { slots: { count: 10, type: 'Line Card' } },
      features: ['Modular', 'vPC', 'OTV', 'FabricPath', 'N+1 Redundancy'],
      layer: 3,
      throughput: '15Tbps'
    },
    icon: 'server',
    color: '#049FD9',
  },
  {
    id: 'cisco-nexus-9000',
    category: 'Cisco',
    type: 'switch',
    name: 'Nexus 9000',
    manufacturer: 'Cisco',
    model: 'Nexus 9300',
    description: 'Next-gen DC Switch - ACI ready, 10/25/40/100G',
    viewType: 'physical',
    specifications: {
      ports: { sfp28: { count: 48, speed: '25Gbps' }, qsfp28: { count: 8, speed: '100Gbps' } },
      features: ['ACI', 'VXLAN', 'CloudScale ASIC', 'MACsec'],
      layer: 3,
      throughput: '3.6Tbps'
    },
    icon: 'server',
    color: '#049FD9',
  },

  // Cisco ISR Routers
  {
    id: 'cisco-isr-1100',
    category: 'Cisco',
    type: 'router',
    name: 'ISR 1100',
    manufacturer: 'Cisco',
    model: 'ISR 1111-8P',
    description: 'Branch Router - SD-WAN, 8 ports, PoE',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps', poe: true } },
      features: ['SD-WAN', 'IOS XE', 'Secure Boot', 'Cloud-managed'],
      layer: 3,
      throughput: '1Gbps'
    },
    icon: 'router',
    color: '#049FD9',
  },
  {
    id: 'cisco-isr-4000',
    category: 'Cisco',
    type: 'router',
    name: 'ISR 4000',
    manufacturer: 'Cisco',
    model: 'ISR 4431',
    description: 'Enterprise Router - Modular, 4 onboard GE, SFP slots',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 4, speed: '1Gbps' }, slots: { count: 4, type: 'NIM' } },
      features: ['Modular', 'IOS XE', 'DMVPN', 'QoS', 'IPsec'],
      layer: 3,
      throughput: '2Gbps'
    },
    icon: 'router',
    color: '#049FD9',
  },

  // Cisco ASA Firewalls
  {
    id: 'cisco-asa-5506',
    category: 'Cisco',
    type: 'firewall',
    name: 'ASA 5506-X',
    manufacturer: 'Cisco',
    model: 'ASA 5506-X',
    description: 'Small Business Firewall - FirePOWER optional, 8 ports',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps' } },
      features: ['Stateful Firewall', 'VPN', 'IPS (optional)', 'AnyConnect'],
      layer: 7,
      throughput: '750Mbps'
    },
    icon: 'shield',
    color: '#049FD9',
  },
  {
    id: 'cisco-asa-5516',
    category: 'Cisco',
    type: 'firewall',
    name: 'ASA 5516-X',
    manufacturer: 'Cisco',
    model: 'ASA 5516-X',
    description: 'Mid-range Firewall - FirePOWER, 10 ports',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 10, speed: '1Gbps' }, sfp: { count: 2, speed: '10Gbps' } },
      features: ['FirePOWER Services', 'Active/Standby HA', 'VPN', 'IPS'],
      layer: 7,
      throughput: '3Gbps'
    },
    icon: 'shield',
    color: '#049FD9',
  },

  // ==================== UBIQUITI DEVICES ====================
  // UniFi Dream Machines
  {
    id: 'ubnt-udm-pro',
    category: 'Ubiquiti',
    type: 'router',
    name: 'Dream Machine Pro',
    manufacturer: 'Ubiquiti',
    model: 'UDM-Pro',
    description: 'All-in-One - Router, Switch, Controller, IPS/IDS, UniFi Protect',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps' }, sfpPlus: { count: 2, speed: '10Gbps' } },
      features: ['UniFi Controller', 'IPS/IDS', 'DPI', 'VPN', 'VLAN'],
      layer: 3,
      throughput: '3.5Gbps'
    },
    icon: 'router',
    color: '#0559C9',
  },
  {
    id: 'ubnt-udm-se',
    category: 'Ubiquiti',
    type: 'router',
    name: 'Dream Machine SE',
    manufacturer: 'Ubiquiti',
    model: 'UDM-SE',
    description: 'Special Edition - PoE switch, 2.5GbE, WiFi 6',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '2.5Gbps', poe: true } },
      features: ['UniFi Controller', 'WiFi 6', 'IPS/IDS', 'PoE++ 120W'],
      layer: 3,
      throughput: '2.5Gbps'
    },
    icon: 'router',
    color: '#0559C9',
  },

  // UniFi Switches
  {
    id: 'ubnt-usw-lite-8-poe',
    category: 'Ubiquiti',
    type: 'switch',
    name: 'USW Lite 8 PoE',
    manufacturer: 'Ubiquiti',
    model: 'USW-Lite-8-PoE',
    description: 'L2 Switch - 8 ports, PoE+, 52W budget, Compact',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps', poe: true } },
      features: ['PoE+ 52W', 'Fanless', 'VLANs', 'Cloud Management'],
      layer: 2,
      poebudget: '52W'
    },
    icon: 'network',
    color: '#0559C9',
  },
  {
    id: 'ubnt-usw-24-poe',
    category: 'Ubiquiti',
    type: 'switch',
    name: 'USW 24 PoE',
    manufacturer: 'Ubiquiti',
    model: 'USW-24-PoE',
    description: 'L2 Switch - 24 ports, PoE+, 400W budget, 2x SFP+',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 24, speed: '1Gbps', poe: true }, sfpPlus: { count: 2, speed: '10Gbps' } },
      features: ['PoE+ 400W', 'Auto-sensing PoE', 'VLANs', 'Link Aggregation'],
      layer: 2,
      poebudget: '400W'
    },
    icon: 'network',
    color: '#0559C9',
  },
  {
    id: 'ubnt-usw-pro-24-poe',
    category: 'Ubiquiti',
    type: 'switch',
    name: 'USW Pro 24 PoE',
    manufacturer: 'Ubiquiti',
    model: 'USW-Pro-24-PoE',
    description: 'L3 Switch - 24 ports, PoE++, 400W, Layer 3 routing',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 24, speed: '1Gbps', poe: true }, sfpPlus: { count: 2, speed: '10Gbps' } },
      features: ['Layer 3', 'PoE++ 400W', 'Static Routing', 'Display'],
      layer: 3,
      poebudget: '400W'
    },
    icon: 'server',
    color: '#0559C9',
  },
  {
    id: 'ubnt-usw-pro-48-poe',
    category: 'Ubiquiti',
    type: 'switch',
    name: 'USW Pro 48 PoE',
    manufacturer: 'Ubiquiti',
    model: 'USW-Pro-48-PoE',
    description: 'L3 Switch - 48 ports, PoE++, 600W, 4x SFP+',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['Layer 3', 'PoE++ 600W', 'Touchscreen', 'Auto-sensing'],
      layer: 3,
      poebudget: '600W'
    },
    icon: 'server',
    color: '#0559C9',
  },
  {
    id: 'ubnt-usw-aggregation',
    category: 'Ubiquiti',
    type: 'switch',
    name: 'USW Aggregation',
    manufacturer: 'Ubiquiti',
    model: 'USW-Aggregation',
    description: 'L3 Core Switch - 28x 10G SFP+, Layer 3, High throughput',
    viewType: 'physical',
    specifications: {
      ports: { sfpPlus: { count: 28, speed: '10Gbps' } },
      features: ['Layer 3', 'Stacking', 'Link Aggregation', 'OSPF'],
      layer: 3,
      throughput: '560Gbps'
    },
    icon: 'server',
    color: '#0559C9',
  },

  // UniFi Access Points
  {
    id: 'ubnt-u6-lite',
    category: 'Ubiquiti',
    type: 'accesspoint',
    name: 'U6 Lite',
    manufacturer: 'Ubiquiti',
    model: 'U6-Lite',
    description: 'WiFi 6 AP - Dual-band, 1.5Gbps, PoE',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 1, speed: '1Gbps', poe: true } },
      wireless: { standards: ['Wi-Fi 6'], maxSpeed: '1500Mbps' },
      features: ['WiFi 6', 'MU-MIMO', 'OFDMA', 'PoE'],
      layer: 2
    },
    icon: 'wifi',
    color: '#0559C9',
  },
  {
    id: 'ubnt-u6-pro',
    category: 'Ubiquiti',
    type: 'accesspoint',
    name: 'U6 Pro',
    manufacturer: 'Ubiquiti',
    model: 'U6-Pro',
    description: 'WiFi 6 AP - Tri-band, 5.3Gbps, 2.5GbE PoE',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 1, speed: '2.5Gbps', poe: true } },
      wireless: { standards: ['Wi-Fi 6'], maxSpeed: '5300Mbps' },
      features: ['WiFi 6', 'Tri-band', '2.5GbE', 'PoE++'],
      layer: 2
    },
    icon: 'wifi',
    color: '#0559C9',
  },

  // EdgeRouters
  {
    id: 'ubnt-er-x',
    category: 'Ubiquiti',
    type: 'router',
    name: 'EdgeRouter X',
    manufacturer: 'Ubiquiti',
    model: 'ER-X',
    description: 'Entry Router - 5 ports, VLAN, routing, compact',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 5, speed: '1Gbps' } },
      features: ['VLAN', 'Static/Dynamic Routing', 'Hardware Offload'],
      layer: 3,
      throughput: '1Gbps'
    },
    icon: 'router',
    color: '#0559C9',
  },
  {
    id: 'ubnt-er-12',
    category: 'Ubiquiti',
    type: 'router',
    name: 'EdgeRouter 12',
    manufacturer: 'Ubiquiti',
    model: 'ER-12',
    description: 'Enterprise Router - 10 GbE + 2 SFP, rack-mount',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 10, speed: '1Gbps' }, sfp: { count: 2, speed: '10Gbps' } },
      features: ['Advanced Routing', 'BGP', 'OSPF', 'VPN'],
      layer: 3,
      throughput: '3.4Gbps'
    },
    icon: 'router',
    color: '#0559C9',
  },

  // ==================== PALO ALTO DEVICES ====================
  {
    id: 'pa-220',
    category: 'PaloAlto',
    type: 'firewall',
    name: 'PA-220',
    manufacturer: 'Palo Alto',
    model: 'PA-220',
    description: 'NGFW - Small branch, 500Mbps, 8 ports, Threat Prevention',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps' } },
      features: ['App-ID', 'User-ID', 'Content-ID', 'SSL Decryption', 'VPN'],
      layer: 7,
      throughput: '500Mbps'
    },
    icon: 'shield',
    color: '#FA582D',
  },
  {
    id: 'pa-450',
    category: 'PaloAlto',
    type: 'firewall',
    name: 'PA-450',
    manufacturer: 'Palo Alto',
    model: 'PA-450',
    description: 'NGFW - Mid-size branch, 1.5Gbps, 16 ports, SD-WAN',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 16, speed: '1Gbps' } },
      features: ['SD-WAN', 'App-ID', 'Threat Prevention', 'WildFire', 'VPN'],
      layer: 7,
      throughput: '1.5Gbps'
    },
    icon: 'shield',
    color: '#FA582D',
  },
  {
    id: 'pa-850',
    category: 'PaloAlto',
    type: 'firewall',
    name: 'PA-850',
    manufacturer: 'Palo Alto',
    model: 'PA-850',
    description: 'NGFW - Enterprise branch, 2.9Gbps, 16 ports + 4 SFP',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 16, speed: '1Gbps' }, sfp: { count: 4, speed: '10Gbps' } },
      features: ['ML-Powered NGFW', 'Threat Prevention', 'SD-WAN', 'IoT Security'],
      layer: 7,
      throughput: '2.9Gbps'
    },
    icon: 'shield',
    color: '#FA582D',
  },
  {
    id: 'pa-3220',
    category: 'PaloAlto',
    type: 'firewall',
    name: 'PA-3220',
    manufacturer: 'Palo Alto',
    model: 'PA-3220',
    description: 'NGFW - Data center, 7.5Gbps, 16x 1GbE + 4x 10G SFP+',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 16, speed: '1Gbps' }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['Advanced Threat Prevention', 'WildFire', 'DNS Security', 'IoT'],
      layer: 7,
      throughput: '7.5Gbps'
    },
    icon: 'shield',
    color: '#FA582D',
  },
  {
    id: 'pa-5220',
    category: 'PaloAlto',
    type: 'firewall',
    name: 'PA-5220',
    manufacturer: 'Palo Alto',
    model: 'PA-5220',
    description: 'NGFW - High-end, 36Gbps, 16x 10G + 4x 40G, Modular',
    viewType: 'physical',
    specifications: {
      ports: { sfpPlus: { count: 16, speed: '10Gbps' }, qsfp: { count: 4, speed: '40Gbps' } },
      features: ['High Performance', 'Advanced Threat', 'Modular', 'Redundant PSU'],
      layer: 7,
      throughput: '36Gbps'
    },
    icon: 'shield',
    color: '#FA582D',
  },

  // ==================== DELL NETWORKING ====================
  // PowerSwitch Series
  {
    id: 'dell-n1108',
    category: 'Dell',
    type: 'switch',
    name: 'PowerSwitch N1108',
    manufacturer: 'Dell',
    model: 'N1108T-ON',
    description: 'L2 Smart Switch - 8 ports, PoE+, Fanless, Compact',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 8, speed: '1Gbps', poe: true } },
      features: ['PoE+ 65W', 'VLANs', 'QoS', 'Web Management'],
      layer: 2,
      poebudget: '65W'
    },
    icon: 'network',
    color: '#007DB8',
  },
  {
    id: 'dell-n2024',
    category: 'Dell',
    type: 'switch',
    name: 'PowerSwitch N2024',
    manufacturer: 'Dell',
    model: 'N2024',
    description: 'L2 Switch - 24 ports, PoE+, 2x 10G SFP+, 370W',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 24, speed: '1Gbps', poe: true }, sfpPlus: { count: 2, speed: '10Gbps' } },
      features: ['PoE+ 370W', 'VLANs', 'LACP', 'Stacking Ready'],
      layer: 2,
      poebudget: '370W'
    },
    icon: 'network',
    color: '#007DB8',
  },
  {
    id: 'dell-s3100',
    category: 'Dell',
    type: 'switch',
    name: 'PowerSwitch S3100',
    manufacturer: 'Dell',
    model: 'S3148',
    description: 'L3 Switch - 48x 1G, 4x 10G SFP+, Full Layer 3',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps' }, sfpPlus: { count: 4, speed: '10Gbps' } },
      features: ['Full Layer 3', 'OSPF', 'BGP', 'VRF', 'Stacking'],
      layer: 3,
      throughput: '176Gbps'
    },
    icon: 'server',
    color: '#007DB8',
  },
  {
    id: 'dell-s4100',
    category: 'Dell',
    type: 'switch',
    name: 'PowerSwitch S4100',
    manufacturer: 'Dell',
    model: 'S4148T-ON',
    description: 'L3 Switch - 48x 1G PoE+, 6x 10G/25G, 1050W PoE',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 48, speed: '1Gbps', poe: true }, sfp28: { count: 6, speed: '25Gbps' } },
      features: ['PoE++ 1050W', 'Full L3', 'VLT', 'VXLAN', 'ONIE'],
      layer: 3,
      poebudget: '1050W'
    },
    icon: 'server',
    color: '#007DB8',
  },
  {
    id: 'dell-s5200',
    category: 'Dell',
    type: 'switch',
    name: 'PowerSwitch S5200',
    manufacturer: 'Dell',
    model: 'S5248F-ON',
    description: 'L3 ToR Switch - 48x 25G SFP28, 8x 100G QSFP28',
    viewType: 'physical',
    specifications: {
      ports: { sfp28: { count: 48, speed: '25Gbps' }, qsfp28: { count: 8, speed: '100Gbps' } },
      features: ['ONIE', 'VLT', 'VXLAN', 'BGP EVPN', 'Low Latency'],
      layer: 3,
      throughput: '3.2Tbps'
    },
    icon: 'server',
    color: '#007DB8',
  },

  // Keep existing SOHO, Enterprise, SDN, Cloud categories for backward compatibility
  // (keeping a few key devices from the original file)

  // SOHO
  {
    id: 'soho-router-001',
    category: 'SOHO',
    type: 'router',
    name: 'Home Router',
    manufacturer: 'Generic',
    model: 'HR-100',
    description: 'Basic home router with NAT and DHCP',
    viewType: 'physical',
    specifications: {
      ports: { ethernet: { count: 4, speed: '1Gbps' }, wan: { count: 1, speed: '1Gbps' } },
      wireless: { standards: ['802.11ac'], bands: ['2.4GHz', '5GHz'], maxSpeed: '1200Mbps' },
      features: ['NAT', 'DHCP Server', 'Basic Firewall', 'QoS'],
      layer: 3
    },
    icon: 'router',
    color: '#4F46E5',
  },

  // Cloud
  {
    id: 'cloud-vpc-001',
    category: 'Cloud',
    type: 'vpc',
    name: 'Virtual Private Cloud',
    manufacturer: 'Cloud Provider',
    model: 'VPC',
    description: 'Logically isolated cloud network',
    viewType: 'logical',
    specifications: {
      features: ['Subnet Management', 'Route Tables', 'Network ACLs', 'Security Groups'],
      layer: 3,
      virtual: true
    },
    icon: 'cloud',
    color: '#0284C7',
  },
  {
    id: 'cloud-igw-001',
    category: 'Cloud',
    type: 'gateway',
    name: 'Internet Gateway',
    manufacturer: 'Cloud Provider',
    model: 'IGW',
    description: 'Gateway for VPC internet connectivity',
    viewType: 'logical',
    specifications: {
      features: ['Public IP Translation', 'Stateless NAT', 'Redundant', 'Scalable'],
      layer: 3,
      virtual: true
    },
    icon: 'globe',
    color: '#0284C7',
  },

  // SDN
  {
    id: 'sdn-vswitch-001',
    category: 'SDN',
    type: 'virtualswitch',
    name: 'Open vSwitch',
    manufacturer: 'OpenSource',
    model: 'OVS-2.17',
    description: 'Production-quality virtual switch',
    viewType: 'logical',
    specifications: {
      features: ['OpenFlow', 'VXLAN', 'GRE', 'STT', 'DPDK', 'Multi-layer'],
      protocols: ['OpenFlow', 'OVSDB'],
      layer: 2,
      virtual: true
    },
    icon: 'boxes',
    color: '#059669',
  },
];

// Helper functions
export function getDevicesByCategory(category) {
  return devices.filter(device => device.category === category);
}

export function getDevicesByViewType(viewType) {
  return devices.filter(device => device.viewType === viewType || device.viewType === 'both');
}

export function getDevicesByCategoryAndViewType(category, viewType) {
  return devices.filter(device =>
    device.category === category &&
    (device.viewType === viewType || device.viewType === 'both')
  );
}

export function getCategoryInfo(category) {
  return deviceCategories[category] || null;
}

export function getAllCategories() {
  return Object.keys(deviceCategories);
}