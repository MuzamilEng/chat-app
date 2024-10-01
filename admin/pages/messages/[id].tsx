import React, { useEffect, useState } from 'react'
import ChatContent from '../../src/components/content/[id]'
import { messageService } from '../../src/services/message.service';
import { useRouter } from 'next/router';


function index() {
    const {id} = useRouter().query
    const [messages, setMessages] = useState({
        items: [],
        count: 0
      });
    
      const loadMessages = async () => {
        const resp = await messageService.find(id);
        setMessages(resp.data);
      };
    
      useEffect(() => {
        loadMessages();
      }, []);
    
  return (
    <div>
        <h1 className="title">Messages</h1>
        <ChatContent items={messages?.items}/>
    </div>
  )
}

export default index