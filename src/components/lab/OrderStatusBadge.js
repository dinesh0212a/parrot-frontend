import { Component } from 'react';

class OrderStatusBadge extends Component {
  getStatusConfig(status) {
    const configs = {
      pending:              { color: '#f39c12', bg: '#fff3cd', icon: '⏳', label: 'Pending Approval' },
      confirmed:            { color: '#3498db', bg: '#d6eaf8', icon: '✅', label: 'Confirmed' },
      preparing:            { color: '#9b59b6', bg: '#e8daef', icon: '👨‍🍳', label: 'Preparing' },
      ready:                { color: '#1abc9c', bg: '#d5f5e3', icon: '📦', label: 'Food Ready' },
      assigned:             { color: '#16a085', bg: '#d1f2eb', icon: '🏍️', label: 'Delivery Assigned' },
      out_for_delivery:     { color: '#ff6b35', bg: '#fff0e6', icon: '🚀', label: 'Out for Delivery' },
      delivered:            { color: '#27ae60', bg: '#d5f5e3', icon: '🎉', label: 'Delivered' },
      rejected_admin:       { color: '#e74c3c', bg: '#fde8e8', icon: '❌', label: 'Rejected by Admin' },
      rejected_restaurant:  { color: '#c0392b', bg: '#fde8e8', icon: '🚫', label: 'Rejected by Restaurant' },
    };
    return configs[status] || { color: '#888', bg: '#f5f5f5', icon: '❓', label: status };
  }

  render() {
    const { status, size = 'normal', showIcon = true } = this.props;
    const cfg = this.getStatusConfig(status);
    const padding = size === 'large' ? '8px 20px' : size === 'small' ? '3px 10px' : '5px 14px';
    const fontSize = size === 'large' ? 14 : size === 'small' ? 11 : 12;

    return (
      <span style={{
        background: cfg.bg,
        color: cfg.color,
        padding,
        borderRadius: 20,
        fontSize,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        border: `1px solid ${cfg.color}30`,
        fontFamily: 'Poppins, sans-serif',
      }}>
        {showIcon && <span>{cfg.icon}</span>}
        {cfg.label}
      </span>
    );
  }
}

export default OrderStatusBadge;
