import {AlertCircle, AlertTriangle, X} from 'lucide-react';
import {useSettings} from '../../context/SettingsContext';
import {useNetwork} from '../../context/NetworkContext';

function ConnectionNotification() {
  const {currentTheme} = useSettings();
  const {connectionError, connectionWarning, clearConnectionMessages} = useNetwork();

  if (!connectionError && !connectionWarning) {
    return null;
  }

  const isError = !!connectionError;
  const message = connectionError || connectionWarning;

  return (
    <div
      className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl"
      style={{
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border"
        style={{
          backgroundColor: currentTheme.surface,
          borderColor: isError ? '#ef4444' : '#f59e0b',
        }}
      >
        <div className="flex-shrink-0 mt-0.5">
          {isError ? (
            <AlertCircle size={20} style={{color: '#ef4444'}} />
          ) : (
            <AlertTriangle size={20} style={{color: '#f59e0b'}} />
          )}
        </div>
        <div className="flex-1">
          <div
            className="font-semibold text-sm mb-1"
            style={{color: isError ? '#ef4444' : '#f59e0b'}}
          >
            {isError ? 'Connection Failed' : 'Connection Warning'}
          </div>
          <div className="text-sm" style={{color: currentTheme.text}}>
            {message}
          </div>
        </div>
        <button
          onClick={clearConnectionMessages}
          className="flex-shrink-0 p-1 rounded transition-colors"
          style={{color: currentTheme.textSecondary}}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = currentTheme.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default ConnectionNotification;