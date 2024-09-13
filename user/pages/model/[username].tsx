import SeoMetaHead from '@components/seo-meta-head';
import { userService } from '@services/user.service';
import dynamic from 'next/dynamic';
import { IUser } from 'src/interfaces/user';

type IProps = {
  user: IUser;
}

const ContactContent = dynamic(() => import('src/components/contact/contact-detail/content'));
const ContactFooter = dynamic(() => import('src/components/contact/contact-detail/footer'));
const ContactHeader = dynamic(() => import('src/components/contact/contact-detail/header'));

function ModelDetail({
  user
}: IProps) {


  return (
    <main className="main main-visible">
      <SeoMetaHead item={user} />
      <div className="friends px-0 py-2 p-xl-3 set-width">
        <div className="container-xl">
          <ContactHeader contact={user} />
          <div className="row friends-info">
            <div className="col">
              <ContactContent contact={user} />
            </div>
          </div>
        </div>
      </div>
      <div className="friends px-0 py-2 p-xl-3 set-width">
        <ContactFooter contact={user} isFriend />
      </div>
    </main>
  );
}

// ModelDetail.authenticate = true;
ModelDetail.getInitialProps = async (ctx) => {
  try {
    const { username } = ctx.query;
    const user = await userService.defautltFindByUsername(username);
    return {
      user: user.data
    };
  } catch {
    // redirect('/404', ctx);
    return {};
  }
};

export default ModelDetail;
