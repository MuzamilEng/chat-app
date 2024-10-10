import { userService } from '@services/user.service';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import FormFilter from '@components/user/form-filter';
import Head from 'next/head';
import { Table } from 'reactstrap';
import { formatDate } from '@lib/utils';
import Link from 'next/link';
import MainPaginate from '@components/paginate/main-paginate';
import { Col, Row } from 'react-bootstrap';

function UserListing() {
  const [total, setTotal] = useState(0);
  const [usersData, setUsersData] = useState({} as any);
  const [totalUserIsApproved, setTotalUserIsApproved] = useState(0);
  const [query, setQuery] = useState({
    page: 1,
    take: 10,
    sortBy: 'createdAt',
    sortType: 'desc'
  });

  const onFilterChange = (data: any) => {
    setQuery({ ...query, ...data, page: 1 });
  };

  const loadUsers = async () => {
    try {
      const resp = await userService.find({ ...query, page: query.page });
      setUsersData(resp.data);
      setTotal(resp.data.count);
    } catch (e) {
      const error = await e;
      toast.error(error?.message || 'Fehler, Laden des Benutzers ist fehlgeschlagen');
    }
  };

  const loadToalUsersIsApproved = async () => {
    try {
      const resp = await userService.find({ isApproved: false });
      setTotalUserIsApproved(resp.data.count);
    } catch (e) {
      const error = await e;
      toast.error(error?.message || 'Fehler. Das Laden der gesamten Benutzeranzahl bis zur Überprüfung ist fehlgeschlagen');
    }
  };

  const remove = (id) => {
    userService
      .remove(id)
      .then(() => {
        toast.success('Lüfter wurde gelöscht');
        loadUsers();
      })
      .catch(() => toast.error('Das Löschen des Lüfters ist fehlgeschlagen'));
  };

  useEffect(() => {
    loadUsers();
  }, [query]);

  useEffect(() => {
    loadToalUsersIsApproved();
  }, []);

  return (
    <main className="main">
      <Head>
        <title>Fanliste</title>
      </Head>
      <Row>
        <Col md={4}>
          <h4 className="title-table">Benutzerverwaltung</h4>
        </Col>
        <Col md={8}>
          <h4 className="title-table">
          Modell zur Überprüfung ausstehend:
            {' '}
            {totalUserIsApproved}
          </h4>
        </Col>
      </Row>
      <FormFilter filter={onFilterChange} />
      <Table responsive striped borderless>
        <thead>
          <tr>
            <th>
              <a>Nutzername</a>
            </th>
            <th className="text-center">
              <a>Email</a>
            </th>
            <th className="text-center">
              <a>Geschlecht</a>
            </th>
            {/* <th className="text-center">
              <a>Block-Status</a>
            </th> */}
            <th className="text-center">
              <a>Rolle</a>
            </th>
            <th className="text-center">
              <a>Konto Typ</a>
            </th>
            <th className="text-center">
              <a>Profilstatus</a>
            </th>
            <th className="text-center">
              <a>Email überprüft</a>
            </th>
            <th className="text-center">
              <a>Dokumentstatus</a>
            </th>
            <th className="text-center">
              <a>Verifizierungsstatus</a>
            </th>
            <th className="text-center">
              <a>Aktiv</a>
            </th>
            <th className="text-center">
              <a>Status der Kontodeaktivierung</a>
            </th>
            <th className="text-center">
              <a>Hergestellt in</a>
            </th>
            <th className="text-center">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {usersData && usersData.items?.length > 0 ? (usersData?.items?.map((user, index) => (
            <tr key={index as any}>
              <td>{user?.username || user?.nickname}</td>
              <td>
                {user?.email}
                {' '}
              </td>
              <td>
                {user?.gender === 'male' && <span className="badge badge-success">Male</span>}
                {user?.gender === 'female' && <span className="badge badge-danger">Female</span>}
                {user?.gender === 'transgender' && <span className="badge badge-primary">Transgender</span>}
              </td>
              <td className="text-center">{user.role === 'admin' ? <span>Admin</span> : <span>User</span>}</td>
              <td className="text-center">{user.type === 'model' ? <span>Model</span> : <span>Fan</span>}</td>
              <td className="text-center">
                {user.isCompletedProfile ? (
                  <span className="badge badge-success">Y</span>
                ) : (
                  <span className="badge badge-warning">N</span>
                )}
              </td>
              <td className="text-center">
                {user.emailVerified ? (
                  <span className="badge badge-success">Y</span>
                ) : (
                  <span className="badge badge-warning">N</span>
                )}
              </td>
              {user.type === 'model' ? (
                <td className="text-center">
                  {user.isCompletedDocument ? (
                    <span className="badge badge-success">Y</span>
                  ) : (
                    <span className="badge badge-warning">N</span>
                  )}
                </td>
              ) : (
                <td className="text-center">
                  <span />
                </td>
              )}
              {user.type === 'model' ? (
                <td className="text-center">
                  {user.isApproved ? (
                    <span className="badge badge-success">Y</span>
                  ) : (
                    <span className="badge badge-warning">N</span>
                  )}
                </td>
              ) : (
                <td className="text-center">
                  <span />
                </td>
              )}
              <td className="text-center">
                { user.isActive ? (
                  <span className="badge badge-success">Y</span>
                ) : (
                  <span className="badge badge-warning">N</span>
                )}
              </td>
              <td className="text-center">
                {user.isBlocked ? (
                  <span className="badge badge-success">Y</span>
                ) : (
                  <span className="badge badge-warning">N</span>
                )}
              </td>
              <td className="text-center">{formatDate(user.createdAt)}</td>
              <td className="text-center">
                <Link href="/users/profile/[id]/update" as={`/users/profile/${user._id}/update`}>
                  <i className="fa fa-pencil-alt" />
                </Link>
                &nbsp;
                {user.type === 'model' && (
                  <>
                    <Link href="/users/verification/[id]/update" as={`/users/verification/${user._id}/update`}>
                      <i className="fas fa-file-alt" />
                    </Link>
                    &nbsp;
                    <Link href="/users/payout-account/[id]/update" as={`/users/payout-account/${user._id}/update`}>
                      <i className="fas fa-credit-card" />
                    </Link>
                    &nbsp;
                  </>
                )}
                <a
                  href="#"
                  onClick={() => {
                    if (window.confirm('Deleting account will permanently delete all associated data. Continue?')) {
                      remove(user._id);
                    }
                  }}
                >
                  <i className="fa fa-trash" />
                </a>
              </td>
            </tr>
          ))) : (
            <tr>
              <td colSpan={11}>
                <p>Es wurden keine passenden Ergebnisse gefunden!</p>
              </td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={12}>
              {total > 0 && total > query.take ? <MainPaginate currentPage={query.page} pageTotal={total} pageNumber={query.take} setPage={(page) => setQuery({ ...query, page })} /> : null}
            </td>
          </tr>
        </tfoot>
      </Table>
    </main>
  );
}

export default UserListing;
