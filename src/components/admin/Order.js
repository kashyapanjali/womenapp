import { useEffect, useState, useCallback } from "react";
import "./Order.css";
import { BASE_URL, ADMIN_ORDERS_API, ADMIN_UPDATE_ORDER_STATUS_API } from "../../api/api";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BASE_URL}${ADMIN_ORDERS_API}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to load orders');
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${BASE_URL}${ADMIN_UPDATE_ORDER_STATUS_API(orderId)}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
      await fetchOrders();
    } catch (e) {
      alert(e.message || 'Failed to update');
    }
  };

  if (loading) {
    return <div className="order-container"><h2 className="order-title">Order List</h2><p>Loading...</p></div>;
  }
  if (error) {
    return <div className="order-container"><h2 className="order-title">Order List</h2><p className="error">{error}</p></div>;
  }

  return (
    <div className="order-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="order-title">Order List</h2>
        <button className="btn btn-view" onClick={fetchOrders}>Refresh</button>
      </div>
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Status</th>
            <th>Total</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>#{String(order._id).slice(-6)}</td>
              <td>{order.user?.name || '-'}</td>
              <td>{order.user?.email || '-'}</td>
              <td>{order.status}</td>
              <td>₹{Number(order.totalPrice || 0).toFixed(2)}</td>
              <td>{order.dateOrder ? new Date(order.dateOrder).toLocaleDateString() : '-'}</td>
              <td>
                <select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)}>
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
