import React, { useState, useEffect } from 'react'

export default function MessageInput({ onSend, onTypingStart, onTypingStop, disabled }){
  const [text,setText] = useState('')
  const [typing,setTyping] = useState(false)
  useEffect(()=>{
    if(!typing || disabled) return
    const t = setTimeout(()=>{ setTyping(false); onTypingStop?.() }, 1200)
    return ()=> clearTimeout(t)
  }, [typing, disabled, onTypingStop])

  return (
    <div className="footer">
      <input
        placeholder="Type a message..."
        value={text}
        disabled={disabled}
        onChange={(e)=>{
          setText(e.target.value)
          if(!typing){
            setTyping(true)
            onTypingStart?.()
          }
        }}
        onKeyDown={(e)=>{
          if(e.key === 'Enter' && text.trim()){
            onSend(text.trim())
            setText('')
            setTyping(false)
            onTypingStop?.()
          }
        }}
        style={{flex:1}}
      />
      <button
        className="primary"
        disabled={!text.trim() || disabled}
        onClick={()=>{
          if(!text.trim()) return
          onSend(text.trim())
          setText('')
          setTyping(false)
          onTypingStop?.()
        }}
      >Send</button>
    </div>
  )
}
