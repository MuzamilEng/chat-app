import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { connect, ConnectedProps, useDispatch } from 'react-redux';
import ConversationList from 'src/components/conversation/conversation-list';
import { loadConversation, setSelectedConversation } from 'src/redux/conversation/actions';

import SearchBar from './search-bar';
import { useTranslationContext } from 'context/TranslationContext';
import { userService } from '@services/user.service';

const AlertDanger = dynamic(() => import('src/components/common-layout/alert/alert-danger'), { ssr: false });

interface IProps {
  conversationId?: string;
}

const mapStates = (state: any) => ({
  authUser: state.auth.authUser,
  loadConvStore: state.conversation.loadConvStore,
  conversations: state.conversation.items,
  selectedConversation: state.conversation.selectedConversation
});

const mapDispatch = {
  dispatchLoadConversation: loadConversation
};

const connector = connect(mapStates, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function ConversationSideBar({
  conversationId = null,
  authUser,
  conversations = [],
  selectedConversation,
  loadConvStore,
  dispatchLoadConversation
}: IProps & PropsFromRedux) {
  const { requesting, success } = loadConvStore;
  const searchRef = useRef<string>('');
  const [conversationList, setConversationList] = useState(conversations);
  const ditspatch = useDispatch();
  const {t, lang} = useTranslationContext()


  const filter = () => {
    const newConversations = conversations.filter((con) => {
      const hasMatch = con.members.find((m) => m.username.toLowerCase().includes(searchRef.current.toLowerCase()));
      return !!hasMatch;
    });
    setConversationList(newConversations);
  };


  const handleSearch = ({ username = '' }) => {
    searchRef.current = username;
    filter();
  };

  useEffect(() => {
    filter();
    if (!selectedConversation && conversationId) {
      ditspatch(setSelectedConversation(conversationId));
    }
  }, [conversations]);

  useEffect(() => {
    dispatchLoadConversation();
  }, []);

  return (
    <aside className={`sidebar ${conversationId ? 'hide-mobile' : ''}  `}>
      <div className="d-flex flex-column h-100">
        <div className="hide-scrollbar h-100" id="chatContactsList">
          <div className="sidebar-header sticky-top p-2">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="font-weight-semibold mb-2">{t?.conversation}</h5>
            </div>
            <SearchBar handleSearchConversation={handleSearch} />
          </div>

          {conversationList.length > 0 ? (
            <ConversationList conversations={conversationList} authUser={authUser} />
          ) : (<AlertDanger content={lang === 'en' ? "No conversation": "Kein Gespräch verfügbar"} />)}
          {!requesting && !success && <AlertDanger content={lang === 'en' ? "No conversation": "Kein Gespräch verfügbar"} />}
        </div>
      </div>
    </aside>
  );
}

export default connector(ConversationSideBar);
