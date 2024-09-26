import React, { useEffect, useState } from 'react';
import MediaContent from './media-content';
import { Button, FormControl, Toast } from 'react-bootstrap';
import { messageService } from '@services/message.service';

interface IProps {
  items?: any;
}

function ChatContent({ items = null }: IProps) {
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSubmit = async (e: any, message) => {
    e.preventDefault();
    if(message){
      const model = items?.find((item) => item?.sender?.type === 'model' || item?.recipient?.type === 'model');  
      if (!model) {
        console.error('No model found in the conversation');
        return;
      }
  
      // Create the message payload
      const data = {
        text: message,
        conversationId: items?.[0]?.conversationId,
        subAdminId: model?.sender._id, // Use the model's ID as subAdminId
        type: 'text',
      };
  
      try {
        const res = await messageService.send(data);
        if (res) {
          setMessage('');  // Clear the input field after sending
          items.unshift(res.data);  // Add the message at the beginning of the array
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };
  
  const reversedItems = [...items].reverse(); // Create a reversed copy of items


  return (
    <>
      <div className="container" style={{ paddingBottom: 70 }}>
        <div className="message-day">
          {reversedItems?.map((message: any, index: number) => {
            const isModel = message?.sender?.type === 'model';
            return (
              <div
                className={isModel ? 'message model-message' : 'message user-message'}
                key={index as any}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: '6px',
                  justifyContent: isModel ? 'flex-end' : 'flex-start',
                  textAlign: isModel ? 'right' : 'left',
                }}
              >
                {!isModel && (
                  <img
                    src={message?.sender?.avatarUrl}
                    onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
                    alt="avatar"
                    className="avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '10px',
                    }}
                  />
                )}

                <div className="message-wrapper">
                  <div className={`message-content ${message.type === 'text' ? 'bg-primary-custom' : ''}`}>
                    {message.type === 'text' && <span>{message.text}</span>}
                    {(message.type === 'photo' || message.type === 'video') && message.files && (
                      <MediaContent type={message?.type} items={message?.files} download />
                    )}
                    {message.type === 'file' && message.files && (
                      <div className="document">
                        <div className="btn btn-primary btn-icon rounded-circle text-light mr-2">
                          <svg className="hw-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>

                        <div className="document-body">
                          <ul className="list-inline small mb-0">
                            <li className="list-inline-item">
                              <span className="text-muted">
                                {Number(message?.files[0]?.size) / 1000} KB
                              </span>
                            </li>
                            <li className="list-inline-item">
                              <span className="text-muted text-uppercase">
                                {message?.files[0]?.mimeType.substring(message?.files[0]?.mimeType.indexOf('/') as any + 1)}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {isModel && (
                  <img
                    src={message.sender.avatarUrl}
                    alt="avatar"
                    onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
                    className="avatar"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginLeft: '10px',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Message Input Field */}
        <form onSubmit={(e) => handleSubmit(e, message)} style={{ position: 'fixed', bottom: 0, width: '100%', left: 18 }}>
          <div className="d-flex justify-content-center align-items-center">
            <FormControl
              as="textarea"
              value={message}
              type="text"
              name="message"
              id="message"
              placeholder="Type your message..."
              onChange={handleInputChange}
              style={{ width: '70%' }}
            />
            <Button className="btn btn-primary ml-4 text-light" type="submit">
              send
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ChatContent;
