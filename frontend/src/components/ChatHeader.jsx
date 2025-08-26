import React from 'react'

export default function ChatHeader({ title, subtitle, right }){
  return (
    <div className="header">
      <div>
        <div style={{fontWeight:700, fontSize:18}}>{title}</div>
        {subtitle && <div className="small" style={{marginTop:4}}>{subtitle}</div>}
      </div>
      {right}
    </div>
  )
}
