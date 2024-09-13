import { userService } from '@services/user.service';
import moment from 'moment';
import Link from 'next/link';
import Router from 'next/router';
import { useEffect, useState } from 'react';

interface IProps {
  conversations: any;
  authUser: any;
}

const now = moment(new Date(), 'DD/MM/YYYY HH:mm:ss');

function ConversationList({ conversations, authUser }: IProps) {
  const [selectedConversationId, setSelectedConversationId] = useState(Router.query.id || '');

  const renderDate = (date: any) => {
    const diff = now.diff(date);
    const duration = moment.duration(diff);
    const hour = duration.asHours();
    const year = duration.asYears();
    if (hour < 24) {
      return moment(date).format('HH:mm');
    }
    if (year < 1) {
      return moment(date).format('HH:mm DD/MM');
    }
    return moment(date).format('HH:mm DD/MM/YY');
  };

  const [data, setData] = useState([]);

  const [friendsConversations, setFriendsConversations] = useState<any[]>([]);
  const [nonFriendsConversations, setNonFriendsConversations] = useState<any[]>([]);

  const [query, setQuery] = useState({
    page: 1,
    take: 12,
    type: authUser.type === 'model' ? 'user' : 'model',
    gender: undefined,
    country: undefined,
    state: undefined,
    city: undefined
  });

  useEffect(() => {
    const updatedQuery = {
      ...query,
      type: authUser.type === 'model' ? 'user' : 'model',
    };
    setQuery(updatedQuery);
    search(updatedQuery);
  }, [authUser]);

  const search = async (newQuery = {}) => {
    const requestQuery = {
      ...query,
      ...newQuery
    };
    const resp = await userService.getFriends({
      ...requestQuery,
      isFriend: true
    });
    setData(resp?.data.items);
  };

  useEffect(() => {
    if (conversations.findIndex((conv) => !conv.members || conv?.members?.length === 0) > -1) {
      Router.reload();
    }

    const friendsConv = [];
    const nonFriendsConv = [];

    conversations.forEach((conv: any) => {
      const user = conv.members.find((m) => m._id !== authUser._id);
      const isFriend = data?.some((friend) => friend._id === user._id);

      if (isFriend) {
        friendsConv.push(conv);
      } else {
        nonFriendsConv.push(conv);
      }
    });

    setFriendsConversations(friendsConv);
    setNonFriendsConversations(nonFriendsConv);
  }, [conversations, data]);

  return (
    <div className="contacts-list">
      {friendsConversations.length > 0 && (
        <>
          <h5 style={{ fontWeight: 'bold' }}>Friends</h5>
          {friendsConversations.map((conv: any) => {
            const user = conv.members.find((m) => m._id !== authUser._id);
            return (
              <div
                className={`contacts-item ${conv.unreadMessageCount > 0 ? 'unread' : 'friends'}${selectedConversationId === conv._id ? ' active' : ''}`}
                key={conv._id}
                onClick={() => setSelectedConversationId(conv._id)}
              >
                <Link
                  legacyBehavior
                  href={{
                    pathname: '/conversation/[id]',
                    query: { id: conv._id }
                  }}
                >
                  <a href="#" className="contacts-link">
                    <div className={`avatar ${user.isOnline ? 'avatar-online' : 'avatar-offline'}`}>
                      <img
                        key={`${user._id}`}
                        src={user.avatarUrl}
                        alt="avatar"
                        onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
                      />
                    </div>
                    <div className="contacts-content">
                      <div className="contacts-info">
                        <h6 className="chat-name text-truncate" key={user._id}>
                          {user.username}
                        </h6>
                        <div className="chat-time">{renderDate(conv.updatedAt)}</div>
                      </div>
                      <div className="contacts-texts">
                        {/* Similar logic for different message types */}
                        {conv?.lastMessage?.type === 'text' && <p className="text-truncate">{conv?.lastMessage?.text}</p>}
                        {conv.unreadMessageCount > 0 && (
                          <div className="badge badge-rounded badge-primary ml-1">{conv.unreadMessageCount}</div>
                        )}
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            );
          })}
        </>
      )}

      {nonFriendsConversations.length > 0 && (
        <>
          <h5 style={{ fontWeight: 'bold' }}>Others</h5>
          {nonFriendsConversations.map((conv: any) => {
            const user = conv.members.find((m) => m._id !== authUser._id);
            return (
              <div
                className={`contacts-item ${conv.unreadMessageCount > 0 ? 'unread' : ''}${selectedConversationId === conv._id ? ' active' : ''}`}
                key={conv._id}
                onClick={() => setSelectedConversationId(conv._id)}
              >
                <Link
                  legacyBehavior
                  href={{
                    pathname: '/conversation/[id]',
                    query: { id: conv._id }
                  }}
                >
                  <a href="#" className="contacts-link">
                    <div className={`avatar ${user.isOnline ? 'avatar-online' : 'avatar-offline'}`}>
                      <img
                        key={`${user._id}`}
                        src={user.avatarUrl}
                        alt="avatar"
                        onError={(e) => e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg'}
                      />
                    </div>
                    <div className="contacts-content">
                      <div className="contacts-info">
                        <h6 className="chat-name text-truncate" key={user._id}>
                          {user.username}
                        </h6>
                        <div className="chat-time">{renderDate(conv.updatedAt)}</div>
                      </div>
                      <div className="contacts-texts">
                        {conv?.lastMessage?.type === 'text' && <p className="text-truncate">{conv?.lastMessage?.text}</p>}
                        {conv.unreadMessageCount > 0 && (
                          <div className="badge badge-rounded badge-primary ml-1">{conv.unreadMessageCount}</div>
                        )}
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default ConversationList;
