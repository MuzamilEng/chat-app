import { conversationService } from '@services/conversation.service';
import { useTranslationContext } from 'context/TranslationContext';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { setSelectedConversation } from 'src/redux/conversation/actions';
import { loadMessage, loadOldMessage, removeSendMessgeStatus } from 'src/redux/message/actions';

const ConversationSideBar = dynamic(() => import('src/components/common-layout/sidebar/conversation-sidebar'));
const ChatContent = dynamic(() => import('src/components/chat-box/content/content'));
const ChatHeader = dynamic(() => import('src/components/chat-box/header/header'));
const ChatFooter = dynamic(() => import('src/components/chat-box/footer/footer'));

interface IProps {
  selectedConversation: any;
  conversationId: string;
  total: number;
  loadMessageStore: {
    requesting: boolean;
    success: boolean;
    error: any;
  };
  sendMessageStore: {
    requesting: boolean;
    success: boolean;
    error: any;
    data: any;
  };
  loadOldMessageStore: {
    requesting: boolean;
    success: boolean;
    error: any;
  };
}

const mapStateToProps = (state: any) => ({
  ...state.message,
  selectedConversation: state.conversation.selectedConversation
});

const connetor = connect(mapStateToProps);
function MessagePage({
  conversationId,
  total,
  selectedConversation,
  loadMessageStore,
  sendMessageStore,
  loadOldMessageStore
}: IProps) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const take = 20;
  const chatRef = useRef<any>();
  const { t, lang } = useTranslationContext();

  const fetchMessages = async () => {
    dispatch(loadMessage({ conversationId, query: { page, take } }));
  };

  const getConversation = async (id: string) => {
    try {
      setLoading(true);
      const resp = await conversationService.findOne(id);
      dispatch(setSelectedConversation(resp.data));
    } catch {
      Router.push(`/${lang}/conversation`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      getConversation(conversationId);
    } else {
      Router.push(`/${lang}/conversation`);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!sendMessageStore.requesting && sendMessageStore.success && !sendMessageStore.error && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollBy({
          top: chatRef.current?.scrollHeight + 300,
          behavior: 'smooth'
        });
      }, 500);
    }
    if (!sendMessageStore.requesting && !sendMessageStore.success && sendMessageStore.error) {
      toast.error(sendMessageStore.error?.data?.message || lang === 'en' ? 'Failed to send message!' : 'Senden der Nachricht fehlgeschlagen!');
      dispatch(removeSendMessgeStatus());
    }
  }, [sendMessageStore]);

  useEffect(() => {
    if (!sendMessageStore.requesting && chatRef.current) {
      setTimeout(() => {
        chatRef.current?.scrollBy({
          top: chatRef.current?.scrollHeight + 300,
          behavior: 'smooth'
        });
      }, 500);
    }
  }, [total]);

  useEffect(() => {
    if (loadOldMessageStore.requesting && loadOldMessageStore.success && !loadOldMessageStore.error) {
      setTimeout(() => {
        chatRef.current?.scrollBy({
          top: chatRef.current?.scrollTop + 300,
          behavior: 'smooth'
        });
      }, 1000);
    }
  }, [loadOldMessageStore]);

  useEffect(() => {
    if (page > 1) {
      dispatch(loadOldMessage({ conversationId, query: { take, page } }));
    }
  }, [page]);

  const onChatScroll = (e: any) => {
    if (take * page - total > take) {
      // Cannot load more messages
      return;
    }
    if (conversationId && e.currentTarget.scrollTop === 0 && !loadOldMessageStore.error && !loadOldMessageStore.requesting) {
      setPage(page + 1);
    }
  };

  return (
    <>
      <ConversationSideBar conversationId={conversationId} />
      <main className="main main-visible">
        <div className="chats mobile">
          <div className="chat-body">
            {!loadMessageStore.requesting && selectedConversation && <ChatHeader />}
            <div
              className="chat-content p-2"
              id="messageBody"
              ref={chatRef}
              onScroll={onChatScroll.bind(this)}
            >
              {loading && <p>Loading...</p>}
              {!loadMessageStore.requesting && <ChatContent />}
            </div>
            {!loadMessageStore.requesting && selectedConversation && <ChatFooter />}
          </div>
        </div>
      </main>
    </>
  );
}

MessagePage.getInitialProps = (ctx) => {
  const conversationId = ctx.query.id;
  return { conversationId };
};

export default connetor(MessagePage);
