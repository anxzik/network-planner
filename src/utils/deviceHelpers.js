import * as LucideIcons from 'lucide-react';

// Map device icon names to Lucide icon components
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

// The standard symbol vocabulary, for pickers (FR-016).
export const STANDARD_ICON_NAMES = Object.keys(iconMap);

export function getDeviceIcon(iconName) {
  return iconMap[iconName] || LucideIcons.Box;
}
