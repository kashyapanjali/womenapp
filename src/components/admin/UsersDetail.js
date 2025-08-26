import "./UsersDetail.css";

export default function UsersDetail() {
  const customer = {
    id: 1,
    name: "Anjali Kashyap",
    email: "anjali@example.com",
    phone: "+91-9876543210",
    address: "Bhubaneswar, Odisha, India",
    orders: [
      { id: 101, status: "Shipped", amount: "₹1200" },
      { id: 102, status: "Pending", amount: "₹500" },
    ],
  };

  return (
    <div className="customer-container">
      <div className="customer-card">
        <h2 className="customer-title">Customer Info</h2>
        <p><strong>Name:</strong> {customer.name}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Phone:</strong> {customer.phone}</p>
        <p><strong>Address:</strong> {customer.address}</p>
      </div>

      <div className="customer-card">
        <h2 className="customer-title">Orders</h2>
        <table className="customer-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.status}</td>
                <td>{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
