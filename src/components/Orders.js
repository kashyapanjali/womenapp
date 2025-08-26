import React, { useEffect, useState } from "react";
import { BASE_URL, USER_ORDERS_API, ORDER_DETAILS_API, UPI_PAYMENT_STATUS_API } from "../api/api";
import "./Checkout.css";

function Orders({ onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [statusLookup, setStatusLookup] = useState({});

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
      setOrders(Array.isArray(data) ? data : []);
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
                <div style={{ display: 'flex', padding: '0 12px 12px 12px', gap: 12, alignItems: 'center' }}>
                  <span>Status: <strong>{order.status}</strong></span>
                  <span>Placed: {order.dateOrder ? new Date(order.dateOrder).toLocaleString() : '-'}</span>
                  <button className="secondary-btn" onClick={() => toggleExpand(orderId)} style={{ marginLeft: 'auto' }}>
                    {isOpen ? 'Hide' : 'View'} Details
                  </button>
                  <button className="primary-btn" onClick={() => checkPaymentStatus(orderId)}>Payment Status</button>
                </div>
                {payment && (
                  <div style={{ padding: '0 12px 12px 12px', color: '#444' }}>
                    <div>Payment: <strong>{payment.status}</strong></div>
                    {payment.paymentDetails && (
                      <div style={{ fontSize: 13 }}>
                        <div>Txn: {payment.paymentDetails.transactionId}</div>
                        <div>Amount: ₹{Number(payment.paymentDetails.amount || 0).toFixed(2)}</div>
                        <div>Date: {payment.paymentDetails.paymentDate ? new Date(payment.paymentDetails.paymentDate).toLocaleString() : '-'}</div>
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
  );
}

export default Orders;


