import React from 'react'
import "../AdminDashboard.css"

export default function AdminUser({users, handleDeleteUser}) {
  return (
   <div>
      <h1 className="page-title">All Users</h1>

      <div className="admin-card-container">
        {users.map((item, index) => (
          <div key={index} className="admin-card">
            <h3 className="admin-name">{item.name}</h3>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Phone:</b> {item.phone}</p>
            <p><b>Role:</b> {item.role}</p>
            <p><b>ID:</b> {item._id}</p>
            <p><b>CreatedAt:</b> {item.createdAt}</p>
            <div className='delete-btn'>
              <button onClick={() => handleDeleteUser(item._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
