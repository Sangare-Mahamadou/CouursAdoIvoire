import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const icons = {
  error: XCircle,
  success: CheckCircle,
  info: Info,
  warning: AlertCircle,
};

export default function AlertMessage({ type = 'info', title, children }) {
  const Icon = icons[type] || Info;

  return (
    <div className={`app-alert app-alert-${type}`} role="alert">
      <Icon size={22} className="app-alert-icon" />
      <div>
        {title && <strong>{title}</strong>}
        <p>{children}</p>
      </div>
    </div>
  );
}

