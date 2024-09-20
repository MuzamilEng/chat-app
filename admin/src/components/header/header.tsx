import { Nav, NavItem, NavLink } from 'reactstrap';
import { connect, ConnectedProps } from 'react-redux';
import { logout } from 'src/redux/auth/actions';
import { loadConfig } from '@redux/settings/actions';

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser,
  isLoadConfig: state.settings.isLoadConfig
});
const mapDispatch = {
  logout,
  loadConfig
};

const connector = connect(mapStateToProps, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

function Header({
  authUser
}: PropsFromRedux) {
  // const [showSidebar, setShowSidebar] = useState(false);
  // const [logo, setLogo] = useState(null);

  const handleLogout = (evt: any) => {
    evt.preventDefault();
    if (window.confirm('Abmelden bestätigen?')) {
      logout();
      localStorage.removeItem('userRegisterationRecords');
      window.location.href = '/login';
    }
  };

  // const loadLogo = async () => {
  //   const res = await settingService.getPublicConfig();
  //   setLogo(res.data.siteLogo);
  // };

  // useEffect(() => {
  //   loadLogo();
  // }, []);

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <li className="nav-item">
          <a className="nav-link" data-widget="pushmenu" href="#" role="button">
            <i className="fas fa-bars" />
          </a>
        </li>
      </ul>
      <Nav className="navbar-nav ml-auto" navbar>
        <NavItem className="nav-item">
          <NavLink href={`/users/profile/${authUser?._id}/update`} title="Update profile">
            <i className="fa fa-user fa-lg" />
          </NavLink>
        </NavItem>

        <NavItem className="nav-item">
          <NavLink href="#" onClick={handleLogout} title="Log out">
            <i className="fa fa-power-off fa-lg" />
          </NavLink>
        </NavItem>
      </Nav>
    </nav>
  );
}

export default connector(Header);
