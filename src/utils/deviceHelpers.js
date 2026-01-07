import {deviceCategories} from '../data/devices';
import * as LucideIcons from 'lucide-react';

// Get category color
export function getCategoryColor(category) {
  return deviceCategories[category]?.color || '#6B7280';
}

// Get category label
export function getCategoryLabel(category) {
  return deviceCategories[category]?.label || category;
}

// Map device icon names to Lucide icon components
export function getDeviceIcon(iconName) {
  const iconMap = {
    router: LucideIcons.Router,
    switch: LucideIcons.Network,
    network: LucideIcons.Network,
    accesspoint: LucideIcons.Wifi,
    wifi: LucideIcons.Wifi,
    storage: LucideIcons.HardDrive,
    'hard-drive': LucideIcons.HardDrive,
    server: LucideIcons.Server,
    modem: LucideIcons.Router,
    firewall: LucideIcons.Shield,
    shield: LucideIcons.Shield,
    'shield-check': LucideIcons.ShieldCheck,
    'shield-alert': LucideIcons.ShieldAlert,
    loadbalancer: LucideIcons.Server,
    vpn: LucideIcons.Shield,
    wanoptimizer: LucideIcons.Zap,
    zap: LucideIcons.Zap,
    security: LucideIcons.ShieldCheck,
    controller: LucideIcons.Cpu,
    cpu: LucideIcons.Cpu,
    virtualswitch: LucideIcons.Box,
    boxes: LucideIcons.Boxes,
    virtualrouter: LucideIcons.Router,
    nfv: LucideIcons.Cloud,
    cloud: LucideIcons.Cloud,
    monitoring: LucideIcons.Activity,
    activity: LucideIcons.Activity,
    automation: LucideIcons.Settings,
    settings: LucideIcons.Settings,
    workflow: LucideIcons.Workflow,
    vpc: LucideIcons.Cloud,
    gateway: LucideIcons.GitBranch,
    'git-branch': LucideIcons.GitBranch,
    globe: LucideIcons.Globe,
    'arrow-left-right': LucideIcons.ArrowLeftRight,
    cdn: LucideIcons.Zap,
  };

  return iconMap[iconName] || LucideIcons.Box;
}

// Format port count for display
export function formatPortCount(ports) {
  if (!ports) return 'N/A';

  const portTypes = [];
  if (ports.ethernet) portTypes.push(`${ports.ethernet.count}× ${ports.ethernet.speed} ETH`);
  if (ports.sfpPlus) portTypes.push(`${ports.sfpPlus.count}× ${ports.sfpPlus.speed} SFP+`);
  if (ports.qsfp) portTypes.push(`${ports.qsfp.count}× ${ports.qsfp.speed} QSFP`);
  if (ports.qsfp28) portTypes.push(`${ports.qsfp28.count}× ${ports.qsfp28.speed} QSFP28`);

  return portTypes.join(', ') || 'Virtual';
}

// Format device specs for card preview
export function formatDeviceSpecs(device) {
  const specs = [];

  // Add layer info
  if (device.specifications.layer) {
    specs.push(`Layer ${device.specifications.layer}`);
  }

  // Add throughput
  if (device.specifications.throughput) {
    specs.push(device.specifications.throughput);
  }

  // Add key feature
  if (device.specifications.features && device.specifications.features.length > 0) {
    specs.push(device.specifications.features[0]);
  }

  return specs.join(' • ');
}

// Check if device is virtual
export function isVirtualDevice(device) {
  return device.specifications.virtual === true;
}
