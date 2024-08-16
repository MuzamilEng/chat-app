import MainPaginate from '@components/paginate/main-paginate';
import {
  loadNotificationAll, readNotifcation
} from '@redux/notification/actions';
import { selectNotificationMapping, selectTotalNotfication } from '@redux/notification/selector';
import { notificationService } from '@services/notification.service';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import NotificationItems from './notification-items';
import { useTranslationContext } from 'context/TranslationContext';

function NotificationList() {
  const take = 10;
  const [page, setPage] = useState(1);
  const {t, lang} = useTranslationContext()
  const dispatch = useDispatch();

  const { ids } = useSelector(selectNotificationMapping);
  const totalNotification = useSelector(selectTotalNotfication);

  const readAllNotification = async () => {
    await notificationService.readAll();
    dispatch(readNotifcation());
  };

  useEffect(() => {
    dispatch(loadNotificationAll({ page, take }));
  }, [page]);

  return (
    <div className="shadow-sm  bg-white mb-3">
      <div className="border-bottom p-3">
        <div className="row m-0 ">
          <div className="col-md-6 col-xs-6">
            <h3 className="m-0">{lang === 'de' ? 'Benachrichtigungen' : 'Notifications'}</h3>
          </div>
          <div className="col-md-6 col-xs-6 flex justify-content-end">
            <Button className="btn btn-primary" onClick={() => readAllNotification()}>Read All</Button>
          </div>
        </div>
      </div>
      <div className=" p-0">
        {!ids?.length && <p>{lang === 'de' ? 'Genau richtig! Das war eine perfekte Übersetzung!' : 'Precisely! That was a perfect translation!'}</p>}
        {ids.map((id) => (
          <NotificationItems id={id} />
        ))}
        {totalNotification > take && <MainPaginate currentPage={page} pageTotal={totalNotification} pageNumber={take} setPage={setPage} />}
      </div>
    </div>

  );
}

export default NotificationList;
