import React, { useEffect, useState } from "react";
import { BASE_URL, USER_ORDERS_API, ORDER_DETAILS_API, UPI_PAYMENT_STATUS_API } from "../api/api";
import ProductStatus from "./ProductStatus";
import "./Checkout.css";

function Orders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [statusLookup, setStatusLookup] = useState({});
  const [showPaymentStatus, setShowPaymentStatus] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user?._id || user?.id;
    } catch (e) {
      return null;
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const userId = getUserId();
      if (!userId) {
        setError("Please sign in to view orders.");
        setLoading(false);
        return;
      }
      const res = await fetch(`${BASE_URL}${USER_ORDERS_API(userId)}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : [];
      setOrders(list);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExpand = async (orderId) => {
    setExpandedId(prev => (prev === orderId ? null : orderId));
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      const res = await fetch(`${BASE_URL}${UPI_PAYMENT_STATUS_API(orderId)}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch payment status');
      const data = await res.json();
      setStatusLookup(prev => ({ ...prev, [orderId]: data }));
    } catch (e) {
      alert(e.message || 'Failed to fetch payment status');
    }
  };

  const showDetailedPaymentStatus = (orderId) => {
    setSelectedOrderId(orderId);
    setShowPaymentStatus(true);
  };

  const closePaymentStatus = () => {
    setShowPaymentStatus(false);
    setSelectedOrderId(null);
  };

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
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>My Orders</h2>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>
        <p style={{ padding: 20 }}>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>My Orders</h2>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>
        <p style={{ padding: 20, color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>My Orders</h2>
          <button className="close-btn" onClick={onBack}>✕</button>
        </div>

        {orders.length === 0 ? (
          <p style={{ padding: 20 }}>You have no orders yet.</p>
        ) : (
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>
            {orders.map((order) => {
              const orderId = order._id || order.id;
              const isOpen = expandedId === orderId;
              const payment = statusLookup[orderId];
              return (
                <div key={orderId} style={{ border: '1px solid #eee', borderRadius: 8, background: '#fff', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: 12, gap: 12 }}>
                    <div style={{ fontWeight: 700 }}>#{String(orderId).slice(-6)}</div>
                    <div style={{ marginLeft: 'auto', fontWeight: 600 }}>₹{Number(order.totalPrice || 0).toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', padding: '0 12px 12px 12px', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>Status: <strong style={{ color: getStatusColor(order.status) }}>{order.status}</strong></span>
                    <span>Placed: {order.dateOrder ? new Date(order.dateOrder).toLocaleString() : '-'}</span>
                    <button className="secondary-btn" onClick={() => toggleExpand(orderId)} style={{ marginLeft: 'auto' }}>
                      {isOpen ? 'Hide' : 'View'} Details
                    </button>
                    <button className="primary-btn" onClick={() => checkPaymentStatus(orderId)}>Refresh Payment</button>
                    <button 
                      className="primary-btn" 
                      onClick={() => showDetailedPaymentStatus(orderId)}
                      style={{ backgroundColor: '#17a2b8' }}
                    >
                      Payment Details
                    </button>
                  </div>
                  {payment && (
                    <div style={{ padding: '0 12px 12px 12px', color: '#444', background: '#f8f9fa', borderRadius: 6, margin: '0 12px 12px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '1.2rem' }}>{getStatusIcon(payment.status)}</span>
                        <span>Payment: <strong style={{ color: getStatusColor(payment.status) }}>{payment.status}</strong></span>
                      </div>
                      {payment.paymentDetails && (
                        <div style={{ fontSize: 13, display: 'grid', gap: 4 }}>
                          <div>Txn: {payment.paymentDetails.transactionId}</div>
                          <div>Amount: ₹{Number(payment.paymentDetails.amount || 0).toFixed(2)}</div>
                          <div>Date: {payment.paymentDetails.paymentDate ? new Date(payment.paymentDetails.paymentDate).toLocaleString() : '-'}</div>
                          {payment.paymentDetails.upiDetails && (
                            <>
                              <div>UPI App: {payment.paymentDetails.upiDetails.app}</div>
                              <div>UPI ID: {payment.paymentDetails.upiDetails.upiId}</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {isOpen && (
                    <div style={{ padding: '0 12px 12px 12px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>Items</div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {(order.orderItems || []).map((oi) => {
                          const p = oi.product || {};
                          return (
                            <div key={oi._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                              <img alt={p.name} src={p.image || 'https://placehold.co/60x60'} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600 }}>{p.name}</div>
                                <div style={{ fontSize: 13, color: '#555' }}>Qty: {oi.quantity} • ₹{Number(p.price || 0).toFixed(2)}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Status Modal */}
      {showPaymentStatus && selectedOrderId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: 15,
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <ProductStatus 
              orderId={selectedOrderId} 
              onClose={closePaymentStatus}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Orders;


