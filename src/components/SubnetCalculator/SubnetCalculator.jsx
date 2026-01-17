import {useCallback, useEffect, useState} from 'react';
import {AlertCircle, Check, ChevronDown, ClipboardList, Copy, Zap} from 'lucide-react';
import {
    calculateSubnetInfo,
    calculateSubnetting,
    calculateSupernetting,
    calculateVLSM,
} from '../../utils/subnetCalculator';
import {isValidIPv4, isValidSubnetMask} from '../../utils/ipValidation';
import {loadData, saveData} from '../../utils/storage';
import {useScratchpad} from '../../context/ScratchpadContext';

function SubnetCalculator() {
  const { addCalculation } = useScratchpad();

  // Main calculator state
  const [ip, setIP] = useState(() => loadData('calc_ip', '192.168.1.0'));
  const [mask, setMask] = useState(() => loadData('calc_mask', '255.255.255.0'));
  const [usesCIDR, setUsesCIDR] = useState(() => loadData('calc_usesCIDR', false));
  const [cidrValue, setCIDRValue] = useState(() => loadData('calc_cidrValue', '24'));

  // Results
  const [subnetInfo, setSubnetInfo] = useState(null);
  const [error, setError] = useState(null);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState(() => loadData('calc_expanded', {
    basicInfo: true,
    supernetting: false,
    subnetting: false,
    vlsm: false,
  }));

  // Supernetting state
  const [supernettingInputs, setSupernettingInputs] = useState(() => loadData('calc_supernet_inputs', ['192.168.0.0/24', '192.168.1.0/24']));
  const [supernettingResult, setSupernettingResult] = useState(null);

  // Subnetting state
  const [subnettingCIDR, setSubnettingCIDR] = useState(() => loadData('calc_subnetting_cidr', '26'));
  const [subnettingResult, setSubnettingResult] = useState(null);

  // VLSM state
  const [vlsmRequirements, setVlsmRequirements] = useState(() => loadData('calc_vlsm_reqs', [
    { hosts: 50, name: 'Department A' },
    { hosts: 30, name: 'Department B' },
    { hosts: 10, name: 'Department C' },
  ]));
  const [vlsmResult, setVlsmResult] = useState(null);

  // Copy to clipboard
  const [copiedText, setCopiedText] = useState(null);

  // Persist inputs on change
  useEffect(() => { saveData('calc_ip', ip); }, [ip]);
  useEffect(() => { saveData('calc_mask', mask); }, [mask]);
  useEffect(() => { saveData('calc_usesCIDR', usesCIDR); }, [usesCIDR]);
  useEffect(() => { saveData('calc_cidrValue', cidrValue); }, [cidrValue]);
  useEffect(() => { saveData('calc_expanded', expandedSections); }, [expandedSections]);
  useEffect(() => { saveData('calc_supernet_inputs', supernettingInputs); }, [supernettingInputs]);
  useEffect(() => { saveData('calc_subnetting_cidr', subnettingCIDR); }, [subnettingCIDR]);
  useEffect(() => { saveData('calc_vlsm_reqs', vlsmRequirements); }, [vlsmRequirements]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  }, []);

  // Calculate subnet information
  const handleCalculate = useCallback(() => {
    setError(null);
    setSubnetInfo(null);

    let calculatedIP = ip;
    let calculatedMask = mask;

    if (usesCIDR) {
      if (!isValidIPv4(ip)) {
        setError('Invalid IP address');
        return;
      }
      const cidr = parseInt(cidrValue, 10);
      if (cidr < 0 || cidr > 32) {
        setError('CIDR must be between 0 and 32');
        return;
      }
      calculatedMask = cidr;
    } else {
      if (!isValidIPv4(ip)) {
        setError('Invalid IP address');
        return;
      }
      if (!isValidSubnetMask(mask)) {
        setError('Invalid subnet mask');
        return;
      }
    }

    const result = calculateSubnetInfo(calculatedIP, calculatedMask);
    if (result) {
      setSubnetInfo(result);
    } else {
      setError('Failed to calculate subnet information');
    }
  }, [ip, mask, usesCIDR, cidrValue]);

  // Handle supernetting calculation
  const handleSupernetting = useCallback(() => {
    const validInputs = supernettingInputs.filter(s => s.trim());
    const result = calculateSupernetting(validInputs);
    setSupernettingResult(result);
  }, [supernettingInputs]);

  // Handle subnetting calculation
  const handleSubnetting = useCallback(() => {
    if (!subnetInfo) {
      setError('Calculate subnet info first');
      return;
    }
    const newCidr = parseInt(subnettingCIDR, 10);
    const result = calculateSubnetting(subnetInfo.cidrNotation, newCidr);
    setSubnettingResult(result);
  }, [subnetInfo, subnettingCIDR]);

  // Handle VLSM calculation
  const handleVLSM = useCallback(() => {
    if (!subnetInfo) {
      setError('Calculate subnet info first');
      return;
    }
    const validRequirements = vlsmRequirements.filter(r => r.hosts > 0);
    const result = calculateVLSM(subnetInfo.cidrNotation, validRequirements);
    setVlsmResult(result);
  }, [subnetInfo, vlsmRequirements]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateSupernettingInput = (index, value) => {
    const newInputs = [...supernettingInputs];
    newInputs[index] = value;
    setSupernettingInputs(newInputs);
  };

  const addSupernettingInput = () => {
    setSupernettingInputs([...supernettingInputs, '']);
  };

  const removeSupernettingInput = (index) => {
    setSupernettingInputs(supernettingInputs.filter((_, i) => i !== index));
  };

  const updateVLSMRequirement = (index, field, value) => {
    const newReqs = [...vlsmRequirements];
    newReqs[index] = { ...newReqs[index], [field]: field === 'hosts' ? parseInt(value, 10) : value };
    setVlsmRequirements(newReqs);
  };

  const addVLSMRequirement = () => {
    setVlsmRequirements([...vlsmRequirements, { hosts: 10, name: `Subnet ${vlsmRequirements.length + 1}` }]);
  };

  const removeVLSMRequirement = (index) => {
    setVlsmRequirements(vlsmRequirements.filter((_, i) => i !== index));
  };

  // Save to Scratchpad handlers
  const saveSubnetToScratchpad = useCallback(() => {
    if (!subnetInfo) return;
    addCalculation({
      type: 'subnet',
      title: subnetInfo.cidrNotation,
      input: { ip, mask: usesCIDR ? cidrValue : mask, cidr: subnetInfo.cidr },
      output: {
        cidrNotation: subnetInfo.cidrNotation,
        mask: subnetInfo.mask,
        networkAddress: subnetInfo.networkAddress,
        broadcastAddress: subnetInfo.broadcastAddress,
        firstUsable: subnetInfo.firstUsable,
        lastUsable: subnetInfo.lastUsable,
        usableHosts: subnetInfo.usableHosts,
        totalHosts: subnetInfo.totalHosts,
        ipClass: subnetInfo.ipClass,
        ipRange: subnetInfo.ipRange,
      },
    });
  }, [addCalculation, ip, mask, usesCIDR, cidrValue, subnetInfo]);

  const saveSubnettingToScratchpad = useCallback(() => {
    if (!subnettingResult || subnettingResult.error) return;
    addCalculation({
      type: 'subnetting',
      title: `${subnetInfo?.cidrNotation} → /${subnettingCIDR}`,
      input: { parentNetwork: subnetInfo?.cidrNotation, newCidr: subnettingCIDR },
      output: {
        numberOfSubnets: subnettingResult.numberOfSubnets,
        subnets: subnettingResult.subnets,
      },
    });
  }, [addCalculation, subnetInfo, subnettingCIDR, subnettingResult]);

  const saveSupernettingToScratchpad = useCallback(() => {
    if (!supernettingResult || supernettingResult.error) return;
    addCalculation({
      type: 'supernetting',
      title: supernettingResult.result,
      input: { subnets: supernettingInputs.filter(s => s.trim()) },
      output: {
        result: supernettingResult.result,
        cidr: supernettingResult.cidr,
        mask: supernettingResult.mask,
        count: supernettingResult.count,
      },
    });
  }, [addCalculation, supernettingInputs, supernettingResult]);

  const saveVLSMToScratchpad = useCallback(() => {
    if (!vlsmResult || vlsmResult.error) return;
    addCalculation({
      type: 'vlsm',
      title: `VLSM: ${vlsmResult.parentNetwork}`,
      input: { parentNetwork: subnetInfo?.cidrNotation, requirements: vlsmRequirements },
      output: {
        parentNetwork: vlsmResult.parentNetwork,
        allocations: vlsmResult.allocations,
      },
    });
  }, [addCalculation, subnetInfo, vlsmRequirements, vlsmResult]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IP Subnet Calculator</h1>
        <p className="text-gray-600 text-sm mt-1">Calculate subnet masks, CIDR notation, supernetting & subnetting</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Calculator Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('basicInfo')}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold flex items-center justify-between hover:from-blue-600 hover:to-blue-700 transition"
        >
          <span>Basic Subnet Calculator</span>
          <ChevronDown size={20} className={`transition-transform ${expandedSections.basicInfo ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.basicInfo && (
          <div className="p-4 space-y-4">
            {/* IP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIP(e.target.value)}
                placeholder="e.g., 192.168.1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Mask Input */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!usesCIDR}
                    onChange={() => setUsesCIDR(false)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Subnet Mask</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={usesCIDR}
                    onChange={() => setUsesCIDR(true)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">CIDR Notation</span>
                </label>
              </div>

              {!usesCIDR ? (
                <input
                  type="text"
                  value={mask}
                  onChange={(e) => setMask(e.target.value)}
                  placeholder="e.g., 255.255.255.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <input
                  type="number"
                  value={cidrValue}
                  onChange={(e) => setCIDRValue(e.target.value)}
                  min="0"
                  max="32"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Calculate
            </button>

            {/* Results */}
            {subnetInfo && (
              <div className="mt-6 space-y-3 pt-4 border-t border-gray-200">
                {/* Save to Scratchpad button */}
                <div className="flex justify-end">
                  <button
                    onClick={saveSubnetToScratchpad}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                  >
                    <ClipboardList size={16} />
                    Save to Scratchpad
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Info Item */}
                  {[
                    { label: 'CIDR Notation', value: subnetInfo.cidrNotation },
                    { label: 'Subnet Mask', value: subnetInfo.mask },
                    { label: 'Wildcard Mask', value: subnetInfo.wildcardMask },
                    { label: 'Network Address', value: subnetInfo.networkAddress },
                    { label: 'Broadcast Address', value: subnetInfo.broadcastAddress },
                    { label: 'First Usable IP', value: subnetInfo.firstUsable },
                    { label: 'Last Usable IP', value: subnetInfo.lastUsable },
                    { label: 'Usable Hosts', value: subnetInfo.usableHosts },
                    { label: 'Total Hosts', value: subnetInfo.totalHosts },
                    { label: 'IP Class', value: subnetInfo.ipClass },
                    { label: 'IP Type', value: subnetInfo.isPrivate ? 'Private (RFC 1918)' : 'Public' },
                    { label: 'IP Range', value: subnetInfo.ipRange },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600 font-medium">{item.label}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-sm font-mono font-semibold text-gray-900">{item.value}</p>
                        <button
                          onClick={() => copyToClipboard(item.value.toString())}
                          className="p-1 hover:bg-gray-200 rounded transition"
                          title="Copy to clipboard"
                        >
                          {copiedText === item.value.toString() ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Supernetting Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('supernetting')}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold flex items-center justify-between hover:from-purple-600 hover:to-purple-700 transition"
        >
          <span className="flex items-center gap-2">
            <Zap size={18} />
            Supernetting (Route Summarization)
          </span>
          <ChevronDown size={20} className={`transition-transform ${expandedSections.supernetting ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.supernetting && (
          <div className="p-4 space-y-4">
            <p className="text-sm text-gray-600">Combine multiple subnets into a larger network</p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Subnets (CIDR notation)</label>
              {supernettingInputs.map((input, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => updateSupernettingInput(idx, e.target.value)}
                    placeholder="e.g., 192.168.0.0/24"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  {supernettingInputs.length > 2 && (
                    <button
                      onClick={() => removeSupernettingInput(idx)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addSupernettingInput}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                + Add subnet
              </button>
            </div>

            <button
              onClick={handleSupernetting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              Calculate Supernet
            </button>

            {supernettingResult && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                {supernettingResult.error ? (
                  <p className="text-red-600 text-sm">{supernettingResult.error}</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Supernet:</span> {supernettingResult.result}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">CIDR:</span> /{supernettingResult.cidr}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Mask:</span> {supernettingResult.mask}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Summarized Subnets:</span> {supernettingResult.count}
                    </p>
                    <div className="pt-2 border-t border-purple-200">
                      <button
                        onClick={saveSupernettingToScratchpad}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium text-purple-600 hover:bg-purple-100 transition"
                      >
                        <ClipboardList size={16} />
                        Save to Scratchpad
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subnetting Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('subnetting')}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold flex items-center justify-between hover:from-green-600 hover:to-green-700 transition"
          >
            <span className="flex items-center gap-2">
              <Zap size={18} />
              Subnetting (Divide Network)
            </span>
            <ChevronDown size={20} className={`transition-transform ${expandedSections.subnetting ? 'rotate-180' : ''}`} />
          </button>

          {expandedSections.subnetting && (
            <div className="p-4 space-y-4">
              {subnetInfo ? (
                <>
                  <p className="text-sm text-gray-600">Divide {subnetInfo.cidrNotation} into smaller subnets</p>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New CIDR Prefix (must be &gt; {subnetInfo.cidr})</label>
                    <input
                      type="number"
                      value={subnettingCIDR}
                      onChange={(e) => setSubnettingCIDR(e.target.value)}
                      min={subnetInfo.cidr + 1}
                      max="32"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will create {Math.pow(2, parseInt(subnettingCIDR, 10) - subnetInfo.cidr)} subnets
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    Please calculate a subnet in the "Basic Subnet Calculator" section first
                  </p>
                </div>
              )}

              <button
                onClick={handleSubnetting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Calculate Subnets
              </button>

              {subnettingResult && (
                <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                  {subnettingResult.error ? (
                    <p className="text-red-600 text-sm">{subnettingResult.error}</p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">
                          {subnettingResult.numberOfSubnets} Subnets
                        </p>
                        <button
                          onClick={saveSubnettingToScratchpad}
                          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-green-600 hover:bg-green-50 transition"
                        >
                          <ClipboardList size={14} />
                          Save to Scratchpad
                        </button>
                      </div>
                      {subnettingResult.subnets.map((subnet, idx) => (
                        <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                          <p className="font-mono font-semibold text-gray-900">{subnet.cidrNotation}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {subnet.network} - {subnet.broadcast} ({subnet.hosts} usable hosts)
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      {/* VLSM Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection('vlsm')}
          className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex items-center justify-between hover:from-orange-600 hover:to-orange-700 transition"
        >
          <span className="flex items-center gap-2">
            <Zap size={18} />
            VLSM (Variable Length Subnet Mask)
          </span>
          <ChevronDown size={20} className={`transition-transform ${expandedSections.vlsm ? 'rotate-180' : ''}`} />
        </button>

        {expandedSections.vlsm && (
          <div className="p-4 space-y-4">
            {subnetInfo ? (
              <>
                <p className="text-sm text-gray-600">Allocate subnets based on host requirements</p>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                {vlsmRequirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={req.name}
                      onChange={(e) => updateVLSMRequirement(idx, 'name', e.target.value)}
                      placeholder="Subnet name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="number"
                      value={req.hosts}
                      onChange={(e) => updateVLSMRequirement(idx, 'hosts', e.target.value)}
                      placeholder="Hosts"
                      min="1"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                    {vlsmRequirements.length > 1 && (
                      <button
                        onClick={() => removeVLSMRequirement(idx)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addVLSMRequirement}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  + Add requirement
                </button>
              </div>

              <button
                onClick={handleVLSM}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Calculate VLSM Allocation
              </button>

                {vlsmResult && (
                  <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                    {vlsmResult.error ? (
                      <p className="text-red-600 text-sm">{vlsmResult.error}</p>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Parent Network:</span> {vlsmResult.parentNetwork}
                          </p>
                          <button
                            onClick={saveVLSMToScratchpad}
                            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-orange-600 hover:bg-orange-50 transition"
                          >
                            <ClipboardList size={14} />
                            Save to Scratchpad
                          </button>
                        </div>
                        <div className="space-y-2">
                          {vlsmResult.allocations.map((alloc, idx) => (
                            <div key={idx} className="bg-gray-50 rounded p-3">
                              <p className="font-medium text-gray-900 text-sm">{alloc.name}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-mono">{alloc.cidrNotation}</span>
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                Requested: {alloc.requestedHosts} hosts → Allocated: {alloc.usableHosts} hosts
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">
                  Please calculate a subnet in the "Basic Subnet Calculator" section first
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SubnetCalculator;

