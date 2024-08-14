import React, { useEffect, useState } from 'react'
import ChatContent from '../../src/components/content/content'
import { messageService } from '../../src/services/message.service';
import { useRouter } from 'next/router';


function index() {
    const {id} = useRouter().query
    const [messages, setMessages] = useState({
        items: [],
        count: 0
      });
    
      const loadMessages = async () => {
        const resp = await messageService.getList(id);
        setMessages(resp.data);
      };
    
      useEffect(() => {
        loadMessages();
      }, []);
    
  return (
    <div>
        <h1>Welcome to Next.js!</h1>
        <p>Get started by editing <code>pages/index.js</code>.</p>
        <ChatContent items={messages.items}/>
    </div>
  )
}

export default index