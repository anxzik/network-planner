// Device category definitions
export const deviceCategories = {
  SOHO: {
    name: 'SOHO',
    label: 'Small Office / Home Office',
    color: '#4F46E5',
    subcategories: ['Routers', 'Switches', 'Access Points', 'Network Attached Storage', 'Modems']
  },
  Enterprise: {
    name: 'Enterprise',
    label: 'Enterprise Equipment',
    color: '#DC2626',
    subcategories: ['Core Switches', 'Distribution Switches', 'Routers', 'Firewalls', 'Load Balancers', 'Security Appliances']
  },
  SDN: {
    name: 'SDN',
    label: 'SDN / Modern Platforms',
    color: '#059669',
    subcategories: ['Controllers', 'Virtual Network', 'Orchestrators', 'Network Functions']
  },
  Cloud: {
    name: 'Cloud',
    label: 'Cloud Networking',
    color: '#0284C7',
    subcategories: ['VPC Components', 'Load Balancers', 'Gateways', 'CDN', 'Security']
  }
};

// Comprehensive device catalog
export const devices = [
  // ==================== SOHO DEVICES ====================
  {
    id: 'soho-router-001',
    category: 'SOHO',
    type: 'router',
    name: 'Home Router',
    manufacturer: 'Generic',
    model: 'HR-100',
    description: 'Basic home router with NAT and DHCP',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '1Gbps' },
        wan: { count: 1, speed: '1Gbps' }
      },
      wireless: {
        standards: ['802.11ac'],
        bands: ['2.4GHz', '5GHz'],
        maxSpeed: '1200Mbps'
      },
      features: ['NAT', 'DHCP Server', 'Basic Firewall', 'QoS'],
      layer: 3,
      throughput: '900Mbps',
      powerConsumption: '12W'
    },
    icon: 'router',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-router-002',
    category: 'SOHO',
    type: 'router',
    name: 'Gaming Router',
    manufacturer: 'Generic',
    model: 'GR-300',
    description: 'High-performance gaming router with advanced QoS',
    specifications: {
      ports: {
        ethernet: { count: 5, speed: '1Gbps' },
        wan: { count: 1, speed: '2.5Gbps' }
      },
      wireless: {
        standards: ['802.11ax', 'Wi-Fi 6'],
        bands: ['2.4GHz', '5GHz'],
        maxSpeed: '3000Mbps'
      },
      features: ['Gaming QoS', 'DDoS Protection', 'VPN Support', 'MU-MIMO'],
      layer: 3,
      throughput: '2Gbps',
      powerConsumption: '18W'
    },
    icon: 'router',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-router-003',
    category: 'SOHO',
    type: 'router',
    name: 'WiFi 6 Router',
    manufacturer: 'Generic',
    model: 'W6-200',
    description: 'Modern WiFi 6 router for high-density environments',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '1Gbps' },
        wan: { count: 1, speed: '1Gbps' }
      },
      wireless: {
        standards: ['802.11ax', 'Wi-Fi 6'],
        bands: ['2.4GHz', '5GHz'],
        maxSpeed: '1800Mbps'
      },
      features: ['OFDMA', 'MU-MIMO', 'WPA3', 'Parental Controls'],
      layer: 3,
      throughput: '1.5Gbps',
      powerConsumption: '15W'
    },
    icon: 'router',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-switch-001',
    category: 'SOHO',
    type: 'switch',
    name: '5-Port Switch',
    manufacturer: 'Generic',
    model: 'SW-5U',
    description: 'Unmanaged 5-port desktop switch',
    specifications: {
      ports: {
        ethernet: { count: 5, speed: '1Gbps' }
      },
      features: ['Auto-MDI/MDIX', 'Auto-negotiation', 'Plug and Play'],
      layer: 2,
      throughput: '10Gbps',
      powerConsumption: '4W'
    },
    icon: 'network',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-switch-002',
    category: 'SOHO',
    type: 'switch',
    name: '8-Port Switch',
    manufacturer: 'Generic',
    model: 'SW-8U',
    description: 'Unmanaged 8-port desktop switch',
    specifications: {
      ports: {
        ethernet: { count: 8, speed: '1Gbps' }
      },
      features: ['Auto-MDI/MDIX', 'Store and Forward', 'Energy Efficient'],
      layer: 2,
      throughput: '16Gbps',
      powerConsumption: '6W'
    },
    icon: 'network',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-switch-003',
    category: 'SOHO',
    type: 'switch',
    name: '8-Port PoE Switch',
    manufacturer: 'Generic',
    model: 'SW-8P',
    description: 'Managed 8-port PoE+ switch for small offices',
    specifications: {
      ports: {
        ethernet: { count: 8, speed: '1Gbps', poe: true }
      },
      features: ['PoE+ 802.3at', 'VLAN Support', 'QoS', 'Web Management'],
      layer: 2,
      throughput: '16Gbps',
      powerConsumption: '120W',
      poebudget: '65W'
    },
    icon: 'network',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-ap-001',
    category: 'SOHO',
    type: 'accesspoint',
    name: 'WiFi 5 Access Point',
    manufacturer: 'Generic',
    model: 'AP-AC',
    description: 'Dual-band 802.11ac access point',
    specifications: {
      ports: {
        ethernet: { count: 1, speed: '1Gbps', poe: true }
      },
      wireless: {
        standards: ['802.11ac'],
        bands: ['2.4GHz', '5GHz'],
        maxSpeed: '1300Mbps'
      },
      features: ['PoE Powered', 'Ceiling Mount', 'MU-MIMO', 'Band Steering'],
      layer: 2,
      powerConsumption: '12W'
    },
    icon: 'wifi',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-ap-002',
    category: 'SOHO',
    type: 'accesspoint',
    name: 'WiFi 6 Access Point',
    manufacturer: 'Generic',
    model: 'AP-AX',
    description: 'High-performance WiFi 6 access point',
    specifications: {
      ports: {
        ethernet: { count: 1, speed: '2.5Gbps', poe: true }
      },
      wireless: {
        standards: ['802.11ax', 'Wi-Fi 6'],
        bands: ['2.4GHz', '5GHz'],
        maxSpeed: '2400Mbps'
      },
      features: ['PoE+ Powered', 'OFDMA', 'MU-MIMO', 'WPA3'],
      layer: 2,
      powerConsumption: '18W'
    },
    icon: 'wifi',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-ap-003',
    category: 'SOHO',
    type: 'accesspoint',
    name: 'Mesh WiFi Node',
    manufacturer: 'Generic',
    model: 'MESH-01',
    description: 'Wireless mesh network node',
    specifications: {
      ports: {
        ethernet: { count: 2, speed: '1Gbps' }
      },
      wireless: {
        standards: ['802.11ac'],
        bands: ['2.4GHz', '5GHz', '5GHz Backhaul'],
        maxSpeed: '1300Mbps'
      },
      features: ['Self-Healing Mesh', 'Seamless Roaming', 'Smart Placement'],
      layer: 2,
      powerConsumption: '10W'
    },
    icon: 'wifi',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-nas-001',
    category: 'SOHO',
    type: 'storage',
    name: '2-Bay NAS',
    manufacturer: 'Generic',
    model: 'NAS-2B',
    description: 'Network attached storage with RAID support',
    specifications: {
      ports: {
        ethernet: { count: 1, speed: '1Gbps' },
        usb: { count: 2, speed: 'USB 3.0' }
      },
      features: ['RAID 0/1', 'Media Server', 'Cloud Sync', 'Snapshot'],
      storage: {
        bays: 2,
        maxCapacity: '32TB'
      },
      layer: 2,
      powerConsumption: '25W'
    },
    icon: 'hard-drive',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-nas-002',
    category: 'SOHO',
    type: 'storage',
    name: '4-Bay NAS',
    manufacturer: 'Generic',
    model: 'NAS-4B',
    description: 'Advanced NAS with virtualization support',
    specifications: {
      ports: {
        ethernet: { count: 2, speed: '1Gbps' },
        usb: { count: 3, speed: 'USB 3.0' }
      },
      features: ['RAID 0/1/5/6/10', 'VM Support', 'Encryption', 'Hot Swap'],
      storage: {
        bays: 4,
        maxCapacity: '64TB'
      },
      layer: 2,
      powerConsumption: '45W'
    },
    icon: 'server',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-modem-001',
    category: 'SOHO',
    type: 'modem',
    name: 'Cable Modem',
    manufacturer: 'Generic',
    model: 'CM-100',
    description: 'DOCSIS 3.1 cable modem',
    specifications: {
      ports: {
        ethernet: { count: 1, speed: '1Gbps' },
        coax: { count: 1 }
      },
      features: ['DOCSIS 3.1', 'Gigabit Ethernet', 'IPv6 Support'],
      maxSpeed: {
        download: '1Gbps',
        upload: '35Mbps'
      },
      layer: 2,
      powerConsumption: '8W'
    },
    icon: 'router',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },
  {
    id: 'soho-modem-002',
    category: 'SOHO',
    type: 'modem',
    name: 'DSL Modem',
    manufacturer: 'Generic',
    model: 'DSL-50',
    description: 'VDSL2 modem for fiber-to-cabinet',
    specifications: {
      ports: {
        ethernet: { count: 1, speed: '1Gbps' },
        rj11: { count: 1 }
      },
      features: ['VDSL2', 'ADSL2+', 'Vectoring Support'],
      maxSpeed: {
        download: '100Mbps',
        upload: '40Mbps'
      },
      layer: 2,
      powerConsumption: '6W'
    },
    icon: 'router',
    color: '#4F46E5',
    defaultSize: { width: 80, height: 80 }
  },

  // ==================== ENTERPRISE DEVICES ====================
  {
    id: 'ent-core-001',
    category: 'Enterprise',
    type: 'switch',
    name: '48-Port Core Switch',
    manufacturer: 'Generic',
    model: 'CORE-48',
    description: 'Layer 3 core switch with 10G uplinks',
    specifications: {
      ports: {
        ethernet: { count: 48, speed: '1Gbps' },
        sfpPlus: { count: 4, speed: '10Gbps' }
      },
      features: ['Layer 3 Routing', 'OSPF', 'BGP', 'Stacking', 'HSRP/VRRP'],
      layer: 3,
      throughput: '176Gbps',
      powerConsumption: '250W'
    },
    icon: 'server',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-core-002',
    category: 'Enterprise',
    type: 'switch',
    name: 'Chassis Core Switch',
    manufacturer: 'Generic',
    model: 'CORE-CHASSIS',
    description: 'Modular chassis switch for data center core',
    specifications: {
      ports: {
        slots: { count: 8, type: 'Line Card Slots' },
        supervisor: { count: 2, redundancy: true }
      },
      features: ['Hot-Swappable Modules', 'N+1 Power', 'VSS', '100G Capable'],
      layer: 3,
      throughput: '3.2Tbps',
      powerConsumption: '2000W'
    },
    icon: 'server',
    color: '#DC2626',
    defaultSize: { width: 120, height: 120 }
  },
  {
    id: 'ent-dist-001',
    category: 'Enterprise',
    type: 'switch',
    name: '24-Port Distribution Switch',
    manufacturer: 'Generic',
    model: 'DIST-24',
    description: 'Layer 3 distribution switch with PoE+',
    specifications: {
      ports: {
        ethernet: { count: 24, speed: '1Gbps', poe: true },
        sfpPlus: { count: 4, speed: '10Gbps' }
      },
      features: ['Layer 3', 'PoE+ 802.3at', 'Stacking', 'VLANs', 'ACLs'],
      layer: 3,
      throughput: '128Gbps',
      powerConsumption: '450W',
      poebudget: '370W'
    },
    icon: 'network',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-dist-002',
    category: 'Enterprise',
    type: 'switch',
    name: '48-Port PoE+ Switch',
    manufacturer: 'Generic',
    model: 'DIST-48P',
    description: 'High-capacity PoE+ distribution switch',
    specifications: {
      ports: {
        ethernet: { count: 48, speed: '1Gbps', poe: true },
        sfpPlus: { count: 4, speed: '10Gbps' }
      },
      features: ['PoE+ 802.3at', 'Layer 3', 'Stacking', 'QoS', 'LACP'],
      layer: 3,
      throughput: '176Gbps',
      powerConsumption: '900W',
      poebudget: '740W'
    },
    icon: 'network',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-router-001',
    category: 'Enterprise',
    type: 'router',
    name: 'Enterprise Edge Router',
    manufacturer: 'Generic',
    model: 'EDGE-1000',
    description: 'High-performance edge router with advanced routing',
    specifications: {
      ports: {
        ethernet: { count: 8, speed: '1Gbps' },
        sfp: { count: 2, speed: '10Gbps' }
      },
      features: ['BGP', 'OSPF', 'MPLS', 'IPsec VPN', 'QoS', 'NAT'],
      layer: 3,
      throughput: '10Gbps',
      powerConsumption: '180W'
    },
    icon: 'router',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-router-002',
    category: 'Enterprise',
    type: 'router',
    name: 'Border Router',
    manufacturer: 'Generic',
    model: 'BR-5000',
    description: 'Carrier-grade border router for ISP peering',
    specifications: {
      ports: {
        sfpPlus: { count: 12, speed: '10Gbps' },
        qsfp: { count: 4, speed: '40Gbps' }
      },
      features: ['Full BGP Table', 'MPLS', 'IPv6', 'RPKI', 'BFD'],
      layer: 3,
      throughput: '240Gbps',
      powerConsumption: '600W'
    },
    icon: 'router',
    color: '#DC2626',
    defaultSize: { width: 120, height: 120 }
  },
  {
    id: 'ent-fw-001',
    category: 'Enterprise',
    type: 'firewall',
    name: 'Next-Gen Firewall',
    manufacturer: 'Generic',
    model: 'NGFW-3000',
    description: 'Advanced firewall with IPS and application control',
    specifications: {
      ports: {
        ethernet: { count: 8, speed: '1Gbps' },
        sfpPlus: { count: 2, speed: '10Gbps' }
      },
      features: ['IPS/IDS', 'App Control', 'SSL Inspection', 'VPN', 'DLP'],
      layer: 7,
      throughput: '3Gbps',
      powerConsumption: '200W'
    },
    icon: 'shield',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-fw-002',
    category: 'Enterprise',
    type: 'firewall',
    name: 'UTM Appliance',
    manufacturer: 'Generic',
    model: 'UTM-500',
    description: 'Unified threat management appliance',
    specifications: {
      ports: {
        ethernet: { count: 6, speed: '1Gbps' }
      },
      features: ['Firewall', 'VPN', 'Anti-virus', 'Web Filtering', 'Email Security'],
      layer: 7,
      throughput: '1Gbps',
      powerConsumption: '120W'
    },
    icon: 'shield',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-vpn-001',
    category: 'Enterprise',
    type: 'vpn',
    name: 'VPN Concentrator',
    manufacturer: 'Generic',
    model: 'VPN-2000',
    description: 'High-capacity IPsec VPN concentrator',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '1Gbps' }
      },
      features: ['IPsec', 'SSL VPN', '10,000 concurrent tunnels', 'HA Support'],
      layer: 3,
      throughput: '2Gbps',
      powerConsumption: '150W'
    },
    icon: 'shield',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-lb-001',
    category: 'Enterprise',
    type: 'loadbalancer',
    name: 'Application Load Balancer',
    manufacturer: 'Generic',
    model: 'ALB-5000',
    description: 'Layer 7 application load balancer',
    specifications: {
      ports: {
        ethernet: { count: 8, speed: '10Gbps' }
      },
      features: ['Layer 7 LB', 'SSL Offload', 'WAF', 'Health Checks', 'Session Persistence'],
      layer: 7,
      throughput: '20Gbps',
      powerConsumption: '300W'
    },
    icon: 'server',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-lb-002',
    category: 'Enterprise',
    type: 'loadbalancer',
    name: 'Network Load Balancer',
    manufacturer: 'Generic',
    model: 'NLB-8000',
    description: 'High-performance Layer 4 load balancer',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '10Gbps' }
      },
      features: ['Layer 4 LB', 'DSR', 'Connection Pooling', 'HA', 'ECMP'],
      layer: 4,
      throughput: '40Gbps',
      powerConsumption: '250W'
    },
    icon: 'server',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-wan-001',
    category: 'Enterprise',
    type: 'wanoptimizer',
    name: 'WAN Optimizer',
    manufacturer: 'Generic',
    model: 'WO-1000',
    description: 'WAN optimization and acceleration appliance',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '1Gbps' }
      },
      features: ['Deduplication', 'Compression', 'TCP Optimization', 'Caching'],
      layer: 7,
      throughput: '2Gbps',
      powerConsumption: '180W'
    },
    icon: 'zap',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'ent-ids-001',
    category: 'Enterprise',
    type: 'security',
    name: 'IDS/IPS Appliance',
    manufacturer: 'Generic',
    model: 'IPS-3000',
    description: 'Intrusion detection and prevention system',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '10Gbps' }
      },
      features: ['Deep Packet Inspection', 'Threat Intelligence', 'Inline/TAP', 'SIEM Integration'],
      layer: 7,
      throughput: '10Gbps',
      powerConsumption: '220W'
    },
    icon: 'shield-check',
    color: '#DC2626',
    defaultSize: { width: 100, height: 100 }
  },

  // ==================== SDN / MODERN DEVICES ====================
  {
    id: 'sdn-ctrl-001',
    category: 'SDN',
    type: 'controller',
    name: 'SDN Controller',
    manufacturer: 'Generic',
    model: 'SDN-CTRL',
    description: 'Software-defined networking controller',
    specifications: {
      ports: {
        ethernet: { count: 2, speed: '10Gbps' }
      },
      features: ['OpenFlow', 'REST API', 'Network Automation', 'Multi-tenant'],
      protocols: ['OpenFlow 1.3', 'NETCONF', 'RESTCONF'],
      layer: 3,
      powerConsumption: '150W'
    },
    icon: 'cpu',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'sdn-ctrl-002',
    category: 'SDN',
    type: 'controller',
    name: 'Network Orchestrator',
    manufacturer: 'Generic',
    model: 'ORCH-100',
    description: 'Cloud-native network orchestration platform',
    specifications: {
      ports: {
        management: { count: 2, speed: '1Gbps' }
      },
      features: ['Multi-cloud', 'Service Chaining', 'Policy Management', 'Analytics'],
      protocols: ['NETCONF', 'gRPC', 'REST'],
      layer: 3,
      powerConsumption: '200W'
    },
    icon: 'workflow',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'sdn-vswitch-001',
    category: 'SDN',
    type: 'virtualswitch',
    name: 'Open vSwitch',
    manufacturer: 'OpenSource',
    model: 'OVS-2.17',
    description: 'Production-quality virtual switch',
    specifications: {
      features: ['OpenFlow', 'VXLAN', 'GRE', 'STT', 'DPDK', 'Multi-layer'],
      protocols: ['OpenFlow', 'OVSDB'],
      layer: 2,
      virtual: true
    },
    icon: 'boxes',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'sdn-vrouter-001',
    category: 'SDN',
    type: 'virtualrouter',
    name: 'Virtual Router',
    manufacturer: 'Generic',
    model: 'VR-1000',
    description: 'Software-based routing instance',
    specifications: {
      features: ['BGP', 'OSPF', 'MPLS', 'VRF', 'IPsec'],
      protocols: ['BGP', 'OSPF', 'IS-IS'],
      layer: 3,
      virtual: true
    },
    icon: 'router',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'sdn-nfv-001',
    category: 'SDN',
    type: 'nfv',
    name: 'NFV Platform',
    manufacturer: 'Generic',
    model: 'NFV-PLAT',
    description: 'Network functions virtualization platform',
    specifications: {
      ports: {
        ethernet: { count: 4, speed: '10Gbps' }
      },
      features: ['VNF Management', 'Service Chaining', 'MANO', 'vCPU Scaling'],
      layer: 3,
      powerConsumption: '400W'
    },
    icon: 'cloud',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'sdn-whitebox-001',
    category: 'SDN',
    type: 'switch',
    name: 'Whitebox Switch',
    manufacturer: 'Generic',
    model: 'WB-32X100',
    description: 'Bare-metal switch with disaggregated NOS',
    specifications: {
      ports: {
        qsfp28: { count: 32, speed: '100Gbps' }
      },
      features: ['SONiC/FBOSS', 'OpenFlow', 'P4 Runtime', 'ONIE'],
      layer: 3,
      throughput: '6.4Tbps',
      powerConsumption: '550W'
    },
    icon: 'server',
    color: '#059669',
    defaultSize: { width: 120, height: 120 }
  },
  {
    id: 'sdn-flow-001',
    category: 'SDN',
    type: 'monitoring',
    name: 'Flow Collector',
    manufacturer: 'Generic',
    model: 'FLOW-COL',
    description: 'NetFlow/sFlow/IPFIX collector and analyzer',
    specifications: {
      ports: {
        ethernet: { count: 2, speed: '10Gbps' }
      },
      features: ['NetFlow v9', 'sFlow', 'IPFIX', 'DDoS Detection', 'Analytics'],
      layer: 7,
      powerConsumption: '180W'
    },
    icon: 'activity',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'sdn-auto-001',
    category: 'SDN',
    type: 'automation',
    name: 'Network Automation Server',
    manufacturer: 'Generic',
    model: 'AUTO-SRV',
    description: 'Network automation and configuration management',
    specifications: {
      ports: {
        ethernet: { count: 2, speed: '1Gbps' }
      },
      features: ['Ansible', 'Python/NAPALM', 'GitOps', 'CI/CD', 'Backup/Restore'],
      protocols: ['NETCONF', 'SSH', 'RESTCONF', 'gNMI'],
      layer: 7,
      powerConsumption: '120W'
    },
    icon: 'settings',
    color: '#059669',
    defaultSize: { width: 100, height: 100 }
  },

  // ==================== CLOUD DEVICES ====================
  {
    id: 'cloud-vpc-001',
    category: 'Cloud',
    type: 'vpc',
    name: 'Virtual Private Cloud',
    manufacturer: 'Cloud Provider',
    model: 'VPC',
    description: 'Logically isolated cloud network',
    specifications: {
      features: ['Subnet Management', 'Route Tables', 'Network ACLs', 'Security Groups'],
      addressSpace: 'RFC1918',
      layer: 3,
      virtual: true
    },
    icon: 'cloud',
    color: '#0284C7',
    defaultSize: { width: 120, height: 120 }
  },
  {
    id: 'cloud-tgw-001',
    category: 'Cloud',
    type: 'gateway',
    name: 'Transit Gateway',
    manufacturer: 'Cloud Provider',
    model: 'TGW',
    description: 'Hub for connecting VPCs and on-premises networks',
    specifications: {
      features: ['Inter-VPC Routing', 'VPN Attachments', 'Direct Connect', 'Route Tables'],
      throughput: '50Gbps',
      layer: 3,
      virtual: true
    },
    icon: 'git-branch',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-igw-001',
    category: 'Cloud',
    type: 'gateway',
    name: 'Internet Gateway',
    manufacturer: 'Cloud Provider',
    model: 'IGW',
    description: 'Gateway for VPC internet connectivity',
    specifications: {
      features: ['Public IP Translation', 'Stateless NAT', 'Redundant', 'Scalable'],
      layer: 3,
      virtual: true
    },
    icon: 'globe',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-nat-001',
    category: 'Cloud',
    type: 'gateway',
    name: 'NAT Gateway',
    manufacturer: 'Cloud Provider',
    model: 'NATGW',
    description: 'Managed NAT service for private subnets',
    specifications: {
      features: ['Outbound NAT', 'Static IP', 'HA', 'Port Allocation'],
      throughput: '45Gbps',
      layer: 3,
      virtual: true
    },
    icon: 'arrow-left-right',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-alb-001',
    category: 'Cloud',
    type: 'loadbalancer',
    name: 'Application Load Balancer',
    manufacturer: 'Cloud Provider',
    model: 'ALB',
    description: 'Layer 7 load balancer with path-based routing',
    specifications: {
      features: ['HTTP/HTTPS', 'Path Routing', 'Host Routing', 'SSL Termination', 'WAF'],
      layer: 7,
      virtual: true
    },
    icon: 'server',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-nlb-001',
    category: 'Cloud',
    type: 'loadbalancer',
    name: 'Network Load Balancer',
    manufacturer: 'Cloud Provider',
    model: 'NLB',
    description: 'Ultra-low latency Layer 4 load balancer',
    specifications: {
      features: ['TCP/UDP', 'Static IP', 'Preserve Source IP', 'Connection Draining'],
      throughput: 'Millions of RPS',
      layer: 4,
      virtual: true
    },
    icon: 'server',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-glb-001',
    category: 'Cloud',
    type: 'loadbalancer',
    name: 'Global Load Balancer',
    manufacturer: 'Cloud Provider',
    model: 'GLB',
    description: 'Multi-region load balancer with geo-routing',
    specifications: {
      features: ['Global Anycast', 'Geo-routing', 'Health Checks', 'Failover'],
      layer: 7,
      virtual: true
    },
    icon: 'globe',
    color: '#0284C7',
    defaultSize: { width: 120, height: 120 }
  },
  {
    id: 'cloud-cdn-001',
    category: 'Cloud',
    type: 'cdn',
    name: 'CDN Edge Location',
    manufacturer: 'Cloud Provider',
    model: 'CDN-EDGE',
    description: 'Content delivery network edge node',
    specifications: {
      features: ['Edge Caching', 'DDoS Protection', 'SSL/TLS', 'Origin Shield', 'Lambda@Edge'],
      layer: 7,
      virtual: true
    },
    icon: 'zap',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-vpngw-001',
    category: 'Cloud',
    type: 'gateway',
    name: 'VPN Gateway',
    manufacturer: 'Cloud Provider',
    model: 'VPNGW',
    description: 'Site-to-site and client VPN gateway',
    specifications: {
      features: ['IPsec', 'Client VPN', 'BGP', 'Redundant Tunnels', 'Certificate Auth'],
      throughput: '1.25Gbps',
      layer: 3,
      virtual: true
    },
    icon: 'shield',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-fw-001',
    category: 'Cloud',
    type: 'firewall',
    name: 'Cloud Firewall',
    manufacturer: 'Cloud Provider',
    model: 'CFW',
    description: 'Managed stateful firewall service',
    specifications: {
      features: ['Stateful Inspection', 'IPS', 'TLS Inspection', 'Domain Filtering'],
      layer: 7,
      virtual: true
    },
    icon: 'shield',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-waf-001',
    category: 'Cloud',
    type: 'security',
    name: 'Web Application Firewall',
    manufacturer: 'Cloud Provider',
    model: 'WAF',
    description: 'Protect web applications from common attacks',
    specifications: {
      features: ['OWASP Top 10', 'Bot Management', 'Rate Limiting', 'Geo-blocking', 'Custom Rules'],
      layer: 7,
      virtual: true
    },
    icon: 'shield-check',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
  {
    id: 'cloud-ddos-001',
    category: 'Cloud',
    type: 'security',
    name: 'DDoS Protection',
    manufacturer: 'Cloud Provider',
    model: 'DDOS-SHIELD',
    description: 'Always-on DDoS mitigation service',
    specifications: {
      features: ['L3/L4/L7 Protection', 'Automatic Mitigation', 'Traffic Scrubbing', 'Anycast'],
      layer: 7,
      virtual: true
    },
    icon: 'shield-alert',
    color: '#0284C7',
    defaultSize: { width: 100, height: 100 }
  },
];

// Helper function to get devices by category
export function getDevicesByCategory(category) {
  return devices.filter(device => device.category === category);
}

// Helper function to get category info
export function getCategoryInfo(category) {
  return deviceCategories[category] || null;
}

// Helper function to get all categories
export function getAllCategories() {
  return Object.keys(deviceCategories);
}
