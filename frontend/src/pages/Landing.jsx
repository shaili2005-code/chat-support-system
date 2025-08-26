import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing(){
  const nav = useNavigate()
  return (
    <div className="container">
      <div className="card">
        <h2>Chat Support System</h2>
        <p className="small" style={{marginTop:4}}>Choose a side to continue.</p>
        <div className="row" style={{marginTop:16}}>
          <div className="col">
            <div className="card">
              <h3>User</h3>
              <p className="small">Start a new conversation with an automatically assigned agent.</p>
              <button className="primary" onClick={()=>nav('/user')}>Continue as User</button>
            </div>
          </div>
          <div className="col">
            <div className="card">
              <h3>Agent</h3>
              <p className="small">Join conversations assigned to your Agent ID.</p>
              <button onClick={()=>nav('/agent')}>Continue as Agent</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
