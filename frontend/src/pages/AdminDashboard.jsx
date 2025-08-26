// import React, { useEffect, useState } from 'react'
// import axios from 'axios'

// const API_BASE = import.meta.env.VITE_API_BASE
// const API_KEY = import.meta.env.VITE_API_KEY

// export default function AdminDashboard() {
//   const [users, setUsers] = useState([])
//   const [loading, setLoading] = useState(false)

//   // popup states
//   const [showPopup, setShowPopup] = useState(false)
//   const [agentName, setAgentName] = useState('')
//   const [agentEmail, setAgentEmail] = useState('')
//   const [agentPassword, setAgentPassword] = useState('')

//   const token = localStorage.getItem('token')

//   const fetchUsers = async () => {
//     setLoading(true)
//     try {
//       const res = await axios.get(`${API_BASE}/auth/users`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'x-api-key': API_KEY
//         }
//       })
//       setUsers(res.data?.data || [])
//     } catch (err) {
//       console.error('Failed to load users:', err)
//       alert('Could not load users')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const deleteUser = async (id) => {
//     if (!window.confirm('Delete this user?')) return
//     try {
//       await axios.delete(`${API_BASE}/auth/users/${id}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'x-api-key': API_KEY
//         }
//       })
//       fetchUsers()
//     } catch (err) {
//       console.error('Delete failed', err)
//       alert(err?.response?.data?.error || 'Could not delete user')
//     }
//   }

//   const createAgent = async () => {
//     if (!agentName || !agentEmail || !agentPassword) {
//       alert('Please fill in all fields')
//       return
//     }
//     try {
//       await axios.post(`${API_BASE}/auth/register`, {
//         name: agentName,
//         email: agentEmail,
//         password: agentPassword,
//         role: 'agent'
//       }, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'x-api-key': API_KEY
//         }
//       })
//       setAgentName('')
//       setAgentEmail('')
//       setAgentPassword('')
//       setShowPopup(false) // close popup
//       fetchUsers()
//       alert('Agent created successfully ✅')
//     } catch (err) {
//       console.error('Failed to create agent', err)
//       alert(err?.response?.data?.message || 'Failed to create agent')
//     }
//   }

//   const logout = () => {
//     localStorage.clear()
//     window.location.href = '/'
//   }

//   useEffect(() => { fetchUsers() }, [])

//   const pill = (text, tone = 'default') => {
//     const tones = {
//       default: { bg:'#1b2540', color:'#c9d1e7' },
//       green:   { bg:'#1d3b2b', color:'#b5f2c7' },
//       blue:    { bg:'#1a2a55', color:'#cdd7ff' },
//       red:     { bg:'#3b1d1d', color:'#ffb8b8' }
//     }
//     const t = tones[tone] || tones.default
//     return (
//       <span className="tag" style={{ background:t.bg, color:t.color }}>
//         {text}
//       </span>
//     )
//   }

//   return (
//     <div
//       className="container"
//       style={{
//         display:'flex',
//         justifyContent:'center',
//         alignItems:'flex-start',
//         minHeight:'100vh'
//       }}
//     >
//       <div className="card" style={{ width:'100%', maxWidth:960, padding:0, overflow:'hidden' }}>
//         {/* Header */}
//         <div
//           className="header"
//           style={{
//             padding:'18px 22px',
//             borderBottom:'1px solid #223358',
//             marginBottom:0,
//             display:'flex',
//             justifyContent:'space-between',
//             alignItems:'center'
//           }}
//         >
//           <div>
//             <div style={{ fontWeight:700, fontSize:20 }}>Admin Dashboard</div>
//             <div className="small" style={{ marginTop:6 }}>
//               Manage all users and agents
//             </div>
//           </div>
//           <div style={{display:'flex', gap:8}}>
//             <button className="primary" onClick={() => setShowPopup(true)}>➕ Create Agent</button>
//             <button onClick={logout}>Logout</button>
//           </div>
//         </div>

//         {/* === Users Table === */}
//         <div style={{ padding:'18px 22px' }}>
//           {loading && <div className="small">Loading…</div>}

//           {!loading && (
//             <div className="card" style={{ padding:0, borderColor:'#223358', overflow:'hidden' }}>
//               {/* Table Header */}
//               <div
//                 style={{
//                   display:'grid',
//                   gridTemplateColumns:'2fr 2.5fr 1.2fr 1.2fr 1fr',
//                   padding:'12px 14px',
//                   background:'#0f1526',
//                   borderBottom:'1px solid #223358',
//                   fontSize:13,
//                   color:'#c9d1e7'
//                 }}
//               >
//                 <div>Name</div>
//                 <div>Email</div>
//                 <div>Role</div>
//                 <div>Status</div>
//                 <div>Actions</div>
//               </div>

//               {/* Rows */}
//               <div>
//                 {users.map((u, idx) => {
//                   const isAdmin = u.role === 'admin'
//                   return (
//                     <div
//                       key={u._id}
//                       style={{
//                         display:'grid',
//                         gridTemplateColumns:'2fr 2.5fr 1.2fr 1.2fr 1fr',
//                         padding:'14px',
//                         borderBottom: idx === users.length - 1 ? 'none' : '1px solid #1a2442',
//                         alignItems:'center'
//                       }}
//                     >
//                       <div style={{ fontWeight:600 }}>{u.name}</div>
//                       <div className="small">{u.email}</div>
//                       <div>{pill(u.role, u.role === 'admin' ? 'blue' : u.role === 'agent' ? 'green' : 'default')}</div>
//                       <div>{pill(u.status || 'available', u.status === 'offline' ? 'red' : 'blue')}</div>
//                       <div>
//                         <button
//                           onClick={() => !isAdmin && deleteUser(u._id)}
//                           disabled={isAdmin}
//                           title={isAdmin ? 'Super Admin cannot be deleted' : 'Delete user'}
//                           style={{
//                             opacity: isAdmin ? 0.55 : 1,
//                             cursor: isAdmin ? 'not-allowed' : 'pointer',
//                             padding:'8px 12px',
//                             borderRadius:10
//                           }}
//                         >
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   )
//                 })}

//                 {!users.length && (
//                   <div style={{ padding:16 }}>
//                     <div className="small">No users found</div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* === Popup Modal === */}
//       {showPopup && (
//         <div
//           style={{
//             position:'fixed',
//             top:0,left:0,right:0,bottom:0,
//             background:'rgba(0,0,0,0.6)',
//             display:'flex',
//             justifyContent:'center',
//             alignItems:'center',
//             zIndex:1000
//           }}
//         >
//           <div
//             className="card"
//             style={{
//               width:'100%',
//               maxWidth:400,
//               padding:20,
//               background:'#131a2a',
//               border:'1px solid #223358',
//               borderRadius:12
//             }}
//           >
//             <h3 style={{marginTop:0}}>Create New Agent</h3>
//             <input
//               placeholder="Agent Name"
//               value={agentName}
//               onChange={e => setAgentName(e.target.value)}
//               style={{marginBottom:10}}
//             />
//             <input
//               type="email"
//               placeholder="Agent Email"
//               value={agentEmail}
//               onChange={e => setAgentEmail(e.target.value)}
//               style={{marginBottom:10}}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={agentPassword}
//               onChange={e => setAgentPassword(e.target.value)}
//               style={{marginBottom:10}}
//             />
//             <div style={{display:'flex', justifyContent:'flex-end', gap:10}}>
//               <button onClick={() => setShowPopup(false)}>Cancel</button>
//               <button className="primary" onClick={createAgent}>Create</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const token = localStorage.getItem('token');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': API_KEY
        }
      });
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      alert('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/auth/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': API_KEY
        }
      });
      fetchUsers();
    } catch (err) {
      console.error('Delete failed', err);
      alert(err?.response?.data?.error || 'Could not delete user');
    }
  };

  const createAgent = async () => {
    if (!agentName || !agentEmail || !agentPassword) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await axios.post(`${API_BASE}/auth/register`, {
        name: agentName,
        email: agentEmail,
        password: agentPassword,
        role: 'agent'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': API_KEY
        }
      });
      setAgentName('');
      setAgentEmail('');
      setAgentPassword('');
      setShowPopup(false);
      fetchUsers();
      alert('Agent created successfully ✅');
    } catch (err) {
      console.error('Failed to create agent', err);
      alert(err?.response?.data?.message || 'Failed to create agent');
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => { fetchUsers(); }, []);

  const pill = (text, tone = 'default') => {
    const tones = {
      default: { bg: '#1b2540', color: '#c9d1e7' },
      green: { bg: '#1d3b2b', color: '#b5f2c7' },
      blue: { bg: '#1a2a55', color: '#cdd7ff' },
      red: { bg: '#3b1d1d', color: '#ffb8b8' }
    };
    const t = tones[tone] || tones.default;
    return (
      <span className="tag" style={{ background: t.bg, color: t.color }}>
        {text}
      </span>
    );
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 960, padding: 0, overflow: 'hidden' }}>
        <div className="header" style={{ padding: '18px 22px', borderBottom: '1px solid #223358', marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>Admin Dashboard</div>
            <div className="small" style={{ marginTop: 6 }}>Manage all users and agents</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="primary" onClick={() => setShowPopup(true)}>➕ Create Agent</button>
            <button onClick={logout}>Logout</button>
          </div>
        </div>
        <div style={{ padding: '18px 22px' }}>
          {loading && <div className="small">Loading…</div>}
          {!loading && (
            <div className="card" style={{ padding: 0, borderColor: '#223358', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 3fr 1.5fr 1fr', padding: '12px 14px', background: '#0f1526', borderBottom: '1px solid #223358', fontSize: 13, color: '#c9d1e7' }}>
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Actions</div>
              </div>
              <div>
                {users.map((u, idx) => {
                  const isAdmin = u.role === 'admin';
                  return (
                    <div key={u._id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 3fr 1.5fr 1fr', padding: '14px', borderBottom: idx === users.length - 1 ? 'none' : '1px solid #1a2442', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div className="small">{u.email}</div>
                      <div>{pill(u.role, u.role === 'admin' ? 'blue' : u.role === 'agent' ? 'green' : 'default')}</div>
                      <div>
                        <button onClick={() => !isAdmin && deleteUser(u._id)} disabled={isAdmin} title={isAdmin ? 'Super Admin cannot be deleted' : 'Delete user'} style={{ opacity: isAdmin ? 0.55 : 1, cursor: isAdmin ? 'not-allowed' : 'pointer', padding: '8px 12px', borderRadius: 10 }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!users.length && (
                  <div style={{ padding: 16 }}>
                    <div className="small">No users found</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {showPopup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, padding: 20, background: '#131a2a', border: '1px solid #223358', borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Create New Agent</h3>
            <input placeholder="Agent Name" value={agentName} onChange={e => setAgentName(e.target.value)} style={{ marginBottom: 10 }} />
            <input type="email" placeholder="Agent Email" value={agentEmail} onChange={e => setAgentEmail(e.target.value)} style={{ marginBottom: 10 }} />
            <input type="password" placeholder="Password" value={agentPassword} onChange={e => setAgentPassword(e.target.value)} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
              <button className="primary" onClick={createAgent}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}