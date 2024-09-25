import * as React from 'react';
import { useEffect, useState } from 'react';
import { Container } from 'reactstrap';
import Router, { useRouter } from 'next/router';
import UserVerificationForm from 'src/components/user/verification-form';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { userService } from '@services/user.service';
import Loading from '@components/loading/loading';

function VerificationUser() {
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();
  const userId = router.query.id;

  const findUser = async () => {
    setLoadingUser(true);
    try {
      const resp = await userService.findOne(userId as string);
      setUser(resp.data);
    } catch (e) {
      const error = await e;
      toast.error(error?.messsage || 'Fehler, Benutzer wurde nicht gefunden');
      Router.push('/users/listing');
    } finally {
      setLoadingUser(false);
    }
  };
  const updateVerification = async (data: any) => {
    setLoadingUpdate(true);
    data.id = userId;
    try {
      await userService.updateVerificationDocument(userId as string, data);
      toast.success('Die Verifizierung wurde aktualisiert');
      Router.push('/users/listing');
    } catch (e) {
      const error = await e;
      toast.error(error?.messaga || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es noch einmal');
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    findUser();
  }, []);
  return (
    <main className="main">
      <Head>
        <title>Modellverifizierungsdokument</title>
      </Head>
      <h4 className="title-table">
      Modellverifizierungsdokument
      </h4>
      <Container fluid className="content">
        {loadingUser && <Loading />}
        {!loadingUser && user && (
        <UserVerificationForm
          submit={updateVerification.bind(this)}
          user={user}
          loading={loadingUpdate}
        />
        )}
      </Container>
    </main>
  );
}
VerificationUser.getInitialProps = async (ctx) => {
  try {
    const userId = ctx.query.id;
    const model = await userService.findOne(userId);
    return {
      user: model.data
    };
  } catch (e) {
    toast.error('Fehler, Verifizierungsbenutzer nicht gefunden');
    return Router.push('/users/listing');
  }
};

export default VerificationUser;
