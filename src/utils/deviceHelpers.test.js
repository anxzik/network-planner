import {describe, expect, it} from 'vitest';
import * as LucideIcons from 'lucide-react';
import {getDeviceIcon} from './deviceHelpers';

describe('getDeviceIcon', () => {
  it('maps a device role to its icon', () => {
    expect(getDeviceIcon('router')).toBe(LucideIcons.Router);
    expect(getDeviceIcon('firewall')).toBe(LucideIcons.Shield);
    expect(getDeviceIcon('server')).toBe(LucideIcons.Server);
  });

  it('maps distinct roles onto a shared icon where they are visually alike', () => {
    expect(getDeviceIcon('switch')).toBe(getDeviceIcon('network'));
    expect(getDeviceIcon('modem')).toBe(getDeviceIcon('router'));
    expect(getDeviceIcon('vpn')).toBe(getDeviceIcon('firewall'));
  });

  it('accepts raw lucide names alongside role names', () => {
    expect(getDeviceIcon('wifi')).toBe(getDeviceIcon('accesspoint'));
    expect(getDeviceIcon('hard-drive')).toBe(getDeviceIcon('storage'));
    expect(getDeviceIcon('cloud')).toBe(getDeviceIcon('nfv'));
  });

  it('falls back to Box for an unknown name', () => {
    expect(getDeviceIcon('does-not-exist')).toBe(LucideIcons.Box);
  });

  it('falls back to Box for missing input', () => {
    expect(getDeviceIcon(undefined)).toBe(LucideIcons.Box);
    expect(getDeviceIcon(null)).toBe(LucideIcons.Box);
    expect(getDeviceIcon('')).toBe(LucideIcons.Box);
  });

  it('is case-sensitive', () => {
    expect(getDeviceIcon('Router')).toBe(LucideIcons.Box);
  });

  it('never returns undefined for any mapped name', () => {
    const names = [
      'router', 'switch', 'network', 'accesspoint', 'wifi', 'storage',
      'hard-drive', 'server', 'modem', 'firewall', 'shield', 'shield-check',
      'shield-alert', 'loadbalancer', 'vpn', 'wanoptimizer', 'zap', 'security',
      'controller', 'cpu', 'virtualswitch', 'boxes', 'virtualrouter', 'nfv',
      'cloud', 'monitoring', 'activity', 'automation', 'settings', 'workflow',
      'vpc', 'gateway', 'git-branch', 'globe', 'arrow-left-right', 'cdn',
    ];
    for (const name of names) {
      expect(getDeviceIcon(name), `icon for "${name}"`).toBeDefined();
    }
  });
});
