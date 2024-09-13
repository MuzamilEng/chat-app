import PageTitle from '@components/page-title';
import classNames from 'classnames';
import { withAuth } from 'src/redux/withAuth';
import styles from './index.module.scss';
import { useTranslationContext } from 'context/TranslationContext';
import { useEffect, useState } from 'react';
import { sellItemService } from '@services/sell-item.service';
import { useSelector } from 'react-redux';

function Friends() {
  const { t } = useTranslationContext();
  const [friends, setFriends] = useState([]);
  const authUser = useSelector((state : any) => state?.auth?.authUser);

  const handleRequest = async (friendId, status) => {
    try {
      const res = await sellItemService.updateFriendRequest({
        friendId: authUser._id,
        userId: friendId,
        status,
      });
      // setFriends(res.data?.data || []);
      console.log('====================================');
      console.log(res, "response");
      console.log('====================================');
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await sellItemService.getAllFriendRequests(authUser._id);
        setFriends(res.data?.data || []);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    };

    fetchFriends();
  }, [authUser._id]);

  return (
    <div style={{ width: '100%', margin: '2vw' }} className={classNames('funds_token_box', styles.funds_token_box)}>
      <PageTitle title="Friends" />
      <div style={{ width: '100%' }}>
        <div className="row m-0 mb-4">
          <p className={classNames('heading_title', styles.heading_title)}>
            <span className={classNames('heading_left', styles.heading_left)}>{t?.friendRequestMsg}</span>
          </p>
          {friends.map((friend) => {
            // Check if authUser._id matches with either friendId._id or senderId._id
            const isFriendIdMatch = friend.friendId?._id === authUser._id;
            const isSenderIdMatch = friend.senderId?._id === authUser._id;

            // Display the appropriate object based on the match
            const displayUser = isFriendIdMatch ? friend.senderId : isSenderIdMatch ? friend.friendId : null;

            return displayUser ? (
              <div key={displayUser._id} className="" style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div className="card mb-3">
                  <div className="card-body">
                    <div className="row align-items-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                        <img style={{ width: '15vw', height: '15vw', objectFit: 'cover', borderRadius: '50%' }}
                          alt={displayUser.username || 'User'}
                          className="img-fluid mb-2 rounded-circle"
                          src={displayUser.avatarUrl || '/images/default_user.png'}
                          onError={(e) => (e.currentTarget.src = 'https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg')}
                        />
                      <div className="ml-3" style={{ alignItems: 'center', justifyItems: 'center' }}>
                        <h5 className="mb" style={{ textAlign: 'center', fontWeight: 'bold' }}>Profile</h5>
                        <p className="mb-2">Name :{displayUser.username}</p>
                        <p className="mb-2">Email :{displayUser.email}</p>
                        <div className="flex" style={{ display: 'flex', alignItems: 'center' }}>
                        <p className="mt-2">Status : </p>
                        <button className='className="mx-1 ml-3 btn btn-primary'> {friend.status}</button> 
                        </div>
                        { friend.status === 'pending' && isFriendIdMatch && (
                          <div className="flex mt-3">
                            <button onClick={() => handleRequest(displayUser?._id, 'accepted')} className="mx-1 btn btn-primary">Accept</button>
                            <button onClick={() => handleRequest(displayUser?._id, 'declined')} className="mx-1 btn btn-primary">Decline</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Friends);
