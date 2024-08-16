import { loadNotificationUnread, readAllNotifcations, readNotifcation } from '@redux/notification/actions';
import { notificationService } from '@services/notification.service';
import { useTranslationContext } from 'context/TranslationContext';
import Link from 'next/link';
import Router from 'next/router';
import { useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import Moment from 'react-moment';
import { useDispatch, useSelector } from 'react-redux';
import { INotification } from 'src/interfaces/notification';

export default function NotificationHeaderPopup() {
  const dispatch = useDispatch();
  const ids = useSelector((state: any) => state.notification.ids) as string[];
  const mapping = useSelector((state: any) => state.notification.mapping) as Record<string, INotification>;
  const take = 5;
  const { t , lang} = useTranslationContext();
  const readAll = async () => {
    await notificationService.readAll();
    dispatch(readAllNotifcations());
  };

  const readNotificationItem = async (id: string) => {
    await notificationService.read(id);
    dispatch(readNotifcation(id));
    dispatch(loadNotificationUnread({ take }));
    Router.push(`/${lang}/earning`);
  };

  useEffect(() => {
    dispatch(loadNotificationUnread({ take }));
  }, []);

  return (
    <div>
      <div className="d-flex p-2">
        <span>{lang === 'de' ? 'Kürzlich eingegangene Benachrichtigungen' : 'Recent received notifications'}</span>
        {ids.length > 0 && <a href="#" onClick={readAll} className="ml-auto">{lang === 'de' ? 'Alle als gelesen markieren' : 'Mark all as read'}</a>}
      </div>
      <ListGroup variant="flush">
        {ids?.length > 0 && ids.map((id) => (
          <ListGroup.Item className="d-flex border-bottom notification">
            <div className="d-flex pointer w-100" onClick={() => readNotificationItem(mapping[id]?._id)}>
              <div className="dropdown-list-image">
                <img className="rounded-circle avatar" src={mapping[id]?.user?.avatarUrl} alt="" />
              </div>
              <div className="font-weight-bold text-nowrap-mw">
                <div className="text-nowrap-mw header">
                  {mapping[id].text}
                </div>
                <div className="small"><Moment format="ddd, MMM D YYYY, h:mm:ss A">{mapping[id]?.createdAt}</Moment></div>
              </div>
              <span className="ml-auto mb-auto">
                <div className="text-right text-muted pt-1 hide-mobile"><Moment fromNow>{mapping[id]?.createdAt}</Moment></div>
              </span>
            </div>
          </ListGroup.Item>

        ))}
        {ids.length === 0 && <p className="minw-300 text-center">{lang === 'de' ? 'Es gibt keine neuen Benachrichtigungen!' : 'No new notifications'}</p>}
      </ListGroup>

      <div className="p-2 text-center">
        <Link href="/notifications">{lang === 'de' ? 'Mehr lesen' : 'Read more'}</Link>
      </div>
    </div>
  );
}
