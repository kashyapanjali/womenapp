import React, { useState, useEffect } from "react";
import { BASE_URL, UPI_PAYMENT_STATUS_API } from "../api/api";
import "./ProductStatus.css";

function ProductStatus({ orderId, onClose }) {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const fetchPaymentStatus = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BASE_URL}${UPI_PAYMENT_STATUS_API(orderId)}`, {
        headers: getAuthHeaders()
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch payment status');
      }
      const data = await res.json();
      setPaymentStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch payment status');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchPaymentStatus();
    }
  }, [orderId, fetchPaymentStatus]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#28a745';
      case 'pending':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'failed':
        return '❌';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-header">
          <h3>Payment Status</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="loading">Loading payment status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-status-container">
        <div className="payment-status-header">
          <h3>Payment Status</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="error">Error: {error}</div>
        <button onClick={fetchPaymentStatus} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <div className="payment-status-header">
        <h3>Payment Status</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>
      
      <div className="payment-status-content">
        <div className="status-summary">
          <div className="status-icon" style={{ color: getStatusColor(paymentStatus?.status) }}>
            {getStatusIcon(paymentStatus?.status)}
          </div>
          <div className="status-details">
            <h4>Order #{String(orderId).slice(-6)}</h4>
            <p className="status" style={{ color: getStatusColor(paymentStatus?.status) }}>
              {paymentStatus?.status?.toUpperCase() || 'UNKNOWN'}
            </p>
            <p className="amount">₹{Number(paymentStatus?.totalAmount || 0).toFixed(2)}</p>
          </div>
        </div>

        {paymentStatus?.paymentDetails && (
          <div className="payment-details">
            <h4>Payment Details</h4>
            <div className="detail-row">
              <span>Transaction ID:</span>
              <span>{paymentStatus.paymentDetails.transactionId}</span>
            </div>
            <div className="detail-row">
              <span>Payment Date:</span>
              <span>
                {paymentStatus.paymentDetails.paymentDate 
                  ? new Date(paymentStatus.paymentDetails.paymentDate).toLocaleString()
                  : 'N/A'
                }
              </span>
            </div>
            <div className="detail-row">
              <span>Amount:</span>
              <span>₹{Number(paymentStatus.paymentDetails.amount || 0).toFixed(2)}</span>
            </div>
            <div className="detail-row">
              <span>Currency:</span>
              <span>{paymentStatus.paymentDetails.currency || 'INR'}</span>
            </div>
            
            {paymentStatus.paymentDetails.upiDetails && (
              <>
                <div className="detail-row">
                  <span>UPI App:</span>
                  <span>{paymentStatus.paymentDetails.upiDetails.app || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>UPI ID:</span>
                  <span>{paymentStatus.paymentDetails.upiDetails.upiId || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="order-date">
          <p>Order Date: {paymentStatus?.dateOrder ? new Date(paymentStatus.dateOrder).toLocaleString() : 'N/A'}</p>
        </div>
      </div>

      <div className="payment-status-actions">
        <button onClick={fetchPaymentStatus} className="refresh-btn">Refresh Status</button>
        <button onClick={onClose} className="close-status-btn">Close</button>
      </div>
    </div>
  );
}

export default ProductStatus;
