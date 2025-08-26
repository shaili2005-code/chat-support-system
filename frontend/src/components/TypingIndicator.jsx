import React from 'react'

export default function TypingIndicator({ who }){
  if(!who) return null
  return (
    <div className="small" style={{marginTop:6}}>
      {who} is typing…
    </div>
  )
}
