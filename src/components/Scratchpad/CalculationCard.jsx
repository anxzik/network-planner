import {useState} from 'react';
import {Check, ChevronDown, ChevronUp, Copy, Trash2} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';

function CalculationCard({ calculation, onDelete }) {
  const { currentTheme } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'subnet': return '#3B82F6';
      case 'subnetting': return '#10B981';
      case 'supernetting': return '#8B5CF6';
      case 'vlsm': return '#F59E0B';
      default: return currentTheme.textSecondary;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'subnet': return 'Subnet Info';
      case 'subnetting': return 'Subnetting';
      case 'supernetting': return 'Supernetting';
      case 'vlsm': return 'VLSM';
      default: return type;
    }
  };

  const renderOutput = () => {
    const { output, type } = calculation;
    if (!output) return null;

    switch (type) {
      case 'subnet':
        return (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(output).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-1.5 rounded" style={{ backgroundColor: currentTheme.background }}>
                <span style={{ color: currentTheme.textSecondary }}>{key}:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono" style={{ color: currentTheme.text }}>{String(value)}</span>
                  <button
                    onClick={() => copyToClipboard(String(value), key)}
                    className="p-0.5 rounded hover:bg-gray-200"
                    title="Copy"
                  >
                    {copiedField === key ? (
                      <Check size={10} className="text-green-500" />
                    ) : (
                      <Copy size={10} style={{ color: currentTheme.textSecondary }} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'subnetting':
        return (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
              {output.numberOfSubnets} subnets created
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {output.subnets?.map((subnet, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded text-xs" style={{ backgroundColor: currentTheme.background }}>
                  <span className="font-mono" style={{ color: currentTheme.text }}>{subnet.cidrNotation}</span>
                  <button
                    onClick={() => copyToClipboard(subnet.cidrNotation, `subnet-${idx}`)}
                    className="p-0.5 rounded hover:bg-gray-200"
                    title="Copy"
                  >
                    {copiedField === `subnet-${idx}` ? (
                      <Check size={10} className="text-green-500" />
                    ) : (
                      <Copy size={10} style={{ color: currentTheme.textSecondary }} />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const allSubnets = output.subnets?.map(s => s.cidrNotation).join('\n');
                copyToClipboard(allSubnets, 'all-subnets');
              }}
              className="text-xs px-2 py-1 rounded"
              style={{ backgroundColor: currentTheme.primary + '20', color: currentTheme.primary }}
            >
              {copiedField === 'all-subnets' ? 'Copied!' : 'Copy all subnets'}
            </button>
          </div>
        );

      case 'supernetting':
        return (
          <div className="space-y-2 text-xs">
            <div className="p-2 rounded" style={{ backgroundColor: currentTheme.background }}>
              <p style={{ color: currentTheme.textSecondary }}>Supernet:</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold" style={{ color: currentTheme.text }}>{output.result}</span>
                <button
                  onClick={() => copyToClipboard(output.result, 'supernet')}
                  className="p-0.5 rounded hover:bg-gray-200"
                >
                  {copiedField === 'supernet' ? (
                    <Check size={10} className="text-green-500" />
                  ) : (
                    <Copy size={10} style={{ color: currentTheme.textSecondary }} />
                  )}
                </button>
              </div>
            </div>
            <p style={{ color: currentTheme.textSecondary }}>
              Mask: {output.mask} | Summarized: {output.count} networks
            </p>
          </div>
        );

      case 'vlsm':
        return (
          <div className="space-y-2">
            <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
              Parent: {output.parentNetwork}
            </p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {output.allocations?.map((alloc, idx) => (
                <div key={idx} className="p-1.5 rounded text-xs" style={{ backgroundColor: currentTheme.background }}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium" style={{ color: currentTheme.text }}>{alloc.name}</span>
                    <button
                      onClick={() => copyToClipboard(alloc.cidrNotation, `vlsm-${idx}`)}
                      className="p-0.5 rounded hover:bg-gray-200"
                    >
                      {copiedField === `vlsm-${idx}` ? (
                        <Check size={10} className="text-green-500" />
                      ) : (
                        <Copy size={10} style={{ color: currentTheme.textSecondary }} />
                      )}
                    </button>
                  </div>
                  <span className="font-mono" style={{ color: currentTheme.textSecondary }}>
                    {alloc.cidrNotation} ({alloc.usableHosts} hosts)
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <pre className="text-xs overflow-auto p-2 rounded" style={{ backgroundColor: currentTheme.background, color: currentTheme.text }}>
            {JSON.stringify(output, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div
      className="border rounded-lg overflow-hidden"
      style={{ borderColor: currentTheme.border }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        style={{ backgroundColor: currentTheme.surface }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: getTypeColor(calculation.type) + '20', color: getTypeColor(calculation.type) }}
          >
            {getTypeLabel(calculation.type)}
          </span>
          <span className="text-sm font-medium" style={{ color: currentTheme.text }}>
            {calculation.title || calculation.input?.ip || 'Calculation'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: currentTheme.textSecondary }}>
            {formatDate(calculation.timestamp)}
          </span>
          {expanded ? (
            <ChevronUp size={16} style={{ color: currentTheme.textSecondary }} />
          ) : (
            <ChevronDown size={16} style={{ color: currentTheme.textSecondary }} />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-3 py-2 border-t" style={{ borderColor: currentTheme.border }}>
          {/* Input Summary */}
          {calculation.input && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1" style={{ color: currentTheme.textSecondary }}>Input:</p>
              <p className="text-xs font-mono" style={{ color: currentTheme.text }}>
                {calculation.input.ip && `${calculation.input.ip}`}
                {calculation.input.mask && `/${calculation.input.mask}`}
                {calculation.input.cidr && ` (CIDR: /${calculation.input.cidr})`}
              </p>
            </div>
          )}

          {/* Output */}
          <div className="mb-3">
            <p className="text-xs font-medium mb-1" style={{ color: currentTheme.textSecondary }}>Result:</p>
            {renderOutput()}
          </div>

          {/* Notes */}
          {calculation.notes && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1" style={{ color: currentTheme.textSecondary }}>Notes:</p>
              <p className="text-xs" style={{ color: currentTheme.text }}>{calculation.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t" style={{ borderColor: currentTheme.border }}>
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(calculation, null, 2);
                copyToClipboard(jsonStr, 'json');
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs"
              style={{ color: currentTheme.textSecondary }}
            >
              {copiedField === 'json' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              Export JSON
            </button>
            <button
              onClick={() => onDelete(calculation.id)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-red-500 hover:bg-red-50"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalculationCard;
