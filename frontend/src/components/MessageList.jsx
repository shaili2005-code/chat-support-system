import React, { useEffect, useRef } from 'react'
import dayjs from 'dayjs'

export default function MessageList({ messages, me }){
  const ref = useRef(null)
  useEffect(()=>{ ref.current?.scrollTo(0, ref.current.scrollHeight) }, [messages])

  return (
    <div className="messages card" ref={ref}>
      {messages.map(m => {
        const mine = m.senderId === me.id
        return (
          <div key={m.id} className={`msg ${mine ? 'you':'other'}`}>
            <div className="name">{m.senderName} {m.senderType === 'agent' && <span className="tag" style={{marginLeft:8}}>Agent</span>}</div>
            <div>{m.message}</div>
            <div className="timestamp">{dayjs(m.timestamp).format('HH:mm, DD MMM')}</div>
          </div>
        )
      })}
      {!messages.length && <div className="small center" style={{height:'100%'}}>No messages yet</div>}
    </div>
  )
}
