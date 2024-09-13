import { systemService } from "@services/system.service";
import Router, { useRouter } from "next/router";
import BlankWithFooterLayout from "src/components/layouts/blank-with-footer";
import { authService } from "src/services/auth.service";
import PageTitle from "@components/page-title";
import { useEffect, useState } from "react";
import DummyHeader from "@components/common-layout/dummyheader/dummyheader";
import { Country } from "country-state-city";
import Link from "next/link";
import { connect, ConnectedProps } from "react-redux";
import { setLogin } from "src/redux/auth/actions";
import { Baseurl } from "@services/api-request";
import { useTranslationContext } from "context/TranslationContext";
import { userService } from "@services/user.service";
import Loader from "@components/common-layout/loader/loader";
interface IProps {
  authUser: any;
  transparentLogo: string;
  authBgImage: string;
}
const mapDispatch = {
  dispatchSetLogin: setLogin,
};

const connector = connect(null, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;
function Home({ authUser, dispatchSetLogin }: IProps & PropsFromRedux) {
  const router = useRouter();
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [showCountrySelect, setShowCountrySelect] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [heartClickedId, setHeartClickedId] = useState(null);
  const [country, setCountry] = useState([]);
  const [userData, setUserData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isauthusertrue, setisauthusertrue] = useState(false);

  const checkAuthUser = () => {
    if (authService.isLoggedin()) {
      if (!authUser) {
        authService.removeToken();
        // router.push("/auth/login");
      }
      if (authUser && (!authUser.isCompletedProfile || !authUser.isApproved)) {
        Router.push(`/${lang}/profile/update?requireUpdate=1`);
      } else {
        router.push(`/${lang}/conversation`);
      }
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [data, setData] = useState({
    items: [],
    count: 0
  });
  const [query, setQuery] = useState({
    page: 1,
    take: 12,
    type: 'model',
    gender: undefined,
    country: undefined,
    state: undefined,
    city: undefined
  });

  useEffect(() => {
      const updatedQuery = {
        ...query,
        type: 'model',
      };
      setQuery(updatedQuery);
      search(updatedQuery);
  }, [authUser]);

  const search = async (newQuery = {}) => {
    setLoading(true);
    const requestQuery = {
      ...query,
      ...newQuery
    };
    const { friendOnly } = router.query;
    const resp = friendOnly
      ? await userService.getFriends({
        ...requestQuery,
        isFriend: true
      })
      : await userService.findDefault(requestQuery);
    setData(resp?.data);
    setLoading(false);
  };

  useEffect(() => {
    search();
  }, [query]);

  const handlechatclick = () => {
    if (authUser) {
      router.push(`/${lang}/models`);
    } else {
      setIsModalOpen(true);
    }
  };
  const openModal = () => {
    setIsModalOpen(true);
  };



  useEffect(() => {
    if (authUser) {
      setisauthusertrue(true);
    }
  }, []);

  useEffect(() => {
    checkAuthUser();
    handleGetAllCountries();
  }, [authUser]);

  const handleGetAllCountries = async () => {
    const countriesData = await Country.getAllCountries().map((i) => ({
      isoCode: i.isoCode,
      name: i.name,
    }));
    setCountry(countriesData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `${Baseurl}/users/search/testing?gender=${selectedGender}&page=${page}`;
        if (selectedCountry && selectedCountry !== "county") {
          url += `&country=${selectedCountry}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        setUserData(data.result);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedGender, selectedCountry, page]);

  const handleHeartClick = (_id) => {
    console.log(`Heart icon clicked for item with ID: ${_id}`);
    openModal();
    setHeartClickedId(_id);
  };


  const handleProfileButtonClick = (_id) => {
    openModal();
    console.log(`Profile button clicked for item with ID: ${_id}`);
  };

  const {t, lang} = useTranslationContext();
  const handleByCoinsClick = (value) => {
    if (value === true) {
      if (authUser) {
        router.push(`/${lang}/tokens`);
      } else {
        setIsModalOpen(true);
      }
    }
  };
  const handleByfavoritesClick = (value) => {
    if (value === true) {
      if (authUser) {
        router.push(`/${lang}/favorites`);
      } else {
        setIsModalOpen(true);
      }
    }
  };
  const handlemodelsClick = (value) => {
    if (value === true) {
      if (authUser) {
        router.push(`/${lang}/models`);
      } else {
        setIsModalOpen(true);
      }
    }
  };
  const handleconversationClick = (value) => {
    if (value === true) {
      if (authUser) {
        router.push(`/${lang}/conversation`);
      } else {
        setIsModalOpen(true);
      }
    }
  };
  const inviteClickHandler = (value) => {
    if (value === true) {
      setIsModalOpen(true);
    }
  };

  return (
    <section className="main scroll">
      <PageTitle title="Startseite" />
      <DummyHeader
        onByCoinsClick={handleByCoinsClick}
        isAuthUserTrue={isauthusertrue}
        onByfavoriteClick={handleByfavoritesClick}
        onBymodelsClick={handlemodelsClick}
        onByconversationClick={handleconversationClick}
        inviteClick={inviteClickHandler}
      />
      <div className="container-fluid">
        <div className="row">
          <div className="row col-md-12 col-12 " style={{ flexWrap: "wrap" }}>
            <div className="col-md-6 col-12 text-left">
              <h4 className="set-font-size my-3">
                {t?.title}
              </h4>
            </div>
            <div className="col-md-6 col-12 text-right">
              <div className="row justify-content-end">
                <div className="dropdown mr-2">
                  <select
                    className="btn btn-outline-default dropdown-toggle"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    <option value="">{lang === 'en' ? 'All' : 'Alle'}</option>
                    <option value="male">{lang === 'en' ? 'Male' : 'Maennlich'}</option>
                    <option value="female">{lang === 'en' ? 'Female' : 'Weiblich'}</option>
                    <option value="transgender">{lang === 'en' ? 'Transgender' : 'Transsexuelle'}</option>
                  </select>
                </div>

                <div className="dropdown mr-2">
                  <select
                    className="btn btn-outline-default dropdown-toggle"
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);

                      if (e.target.value === "") {
                        setShowCountrySelect("");
                      } else {
                        setShowCountrySelect(e.target.value);
                      }
                    }}
                  >
                     <option value="county">{lang === 'en' ? 'Country' : 'Dein Land'}</option>
                    <option value="">{lang === 'en' ? 'All countries' : 'Alle Land'}</option>
                   
                  </select>
                </div>

                <div className="dropdown mr-2">
                  <form className="form-inline">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control search border-right-0 transparent-bg pr-0"
                        name="username"
                        id="username"
                        placeholder={lang === 'en' ? "Model name" : "Modellname eingeben"}
                        onChange={(e) => console.log(e.target.value)}
                      />
                      <div className="input-group-append">
                        <button
                          type="submit"
                          className="input-group-text transparent-bg border-left-0"
                        >
                          <svg
                            className="text-muted hw-20"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                {showCountrySelect === "county" && (
                  <div className="dropdown mr-2">
                    <select
                      className="btn btn-outline-default dropdown-toggle"
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                      }}
                    >
                      {country.map((country, index) => (
                        <option key={index} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-12 col-12"  >
            <div className="">
              <div style={{ display: "flex", flexWrap: "wrap" ,minHeight:"420px", marginTop: "10px", width: "100%" }} className="col-md-12">
              {data?.items?.length === 0 ? (
                   <div className="" style={{ margin: "auto" }}><Loader /></div>
                   ) : (
                   data?.items?.map((data, index) => (
                 <div  key={index} className="d-block"
                 style={{ position: "relative", margin: "auto", }}

                 >
                   <div
                    key={index}
                       style={{
                      margin: "auto",
                      border: "1px solid #e3e3e3",
                      borderRadius: "11px",
                      marginTop: "10px"
                    }}
                 
                  >
                    <div
                      onMouseEnter={() => setHoveredIndex(data._id)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <img
                        src={data.avatarUrl}
                        alt="Card"
                        style={{
                          width: "300px",
                          height: "300px",
                          objectFit: "cover",
                          borderRadius: "11px",
                        }}
                        onError={(e) => (e.currentTarget.src = "https://img.freepik.com/premium-photo/3d-bohemian-styled-woman_397139-28113.jpg?size=626&ext=jpg")}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          color: "#fff",
                          zIndex: 1,
                        }}
                      >
                        {data.daysAgo}
                      </div>
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          color: heartClickedId === data._id ? "red" : "#fff",
                          zIndex: 1,
                          cursor: "pointer",
                        }}
                        onClick={() => handleHeartClick(data._id)}
                      >
                        {heartClickedId === data._id ? "❤️" : "🤍"}
                      </span>
                      {hoveredIndex === data._id && (
                        <div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: "40px",
                              left: "30px",
                              backgroundColor: "transparent",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxSizing: "border-box",
                              width: "calc(50% - 15px)",
                              zIndex: 1,
                            }}
                          >
                            <button
                              className="mx-1 btn btn-primary"
                              type="button"
                              onClick={() => handlechatclick()}
                            >
                              <i className="far fa-comments" />
                              <span
                                style={{ fontSize: "11px", marginLeft: "5px" }}
                              >
                                {t?.modelLists?.chat}
                              </span>
                            </button>
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: "40px",
                              right: "5px",
                              backgroundColor: "transparent",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              boxSizing: "border-box",
                              width: "calc(50% - 15px)",
                              zIndex: 1,
                            }}
                          >
                            <Link href={`/${lang}/model/${data.username}`} >
                            <button
                              className="btn btn-primary btn-secondary"
                              type="button"
                              onClick={() => handleProfileButtonClick(data._id)}
                            >
                              <i className="fas fa-user-circle" />
                              <span
                                style={{ fontSize: "11px", marginLeft: "5px" }}
                              >
                                {t?.modelLists?.profile}
                              </span>
                            </button>
                            </Link>
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          position: "absolute",
                          textAlign: "center",
                          width: "100%",
                          top: "94%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          backgroundColor: "#000000ad",
                          color: "#fff",
                          padding: "5px",
                          zIndex: 2,
                          borderBottomLeftRadius: "10px",
                          borderBottomRightRadius: "10px",
                          cursor: "pointer",
                        }}
                        onClick={openModal}
                      >
                        <i style={{color:"#ff337c" ,fontStyle:"normal"}}> {data.name }</i>
                        <i
                          className={
                            data.gender === "male"
                              ? "fas fa-mars"
                              : "fas fa-venus"
                          }
                          style={{ marginLeft: "5px" }}
                        ></i>
                        {data.gender === "male"
                          ? "M"
                          : data.gender === "female"
                          ? "F"
                          : "Other"}
                        <i
                          className="fa-duotone fa-cake-candles"
                          style={{ marginLeft: "5px" }}
                        ></i>
                        {data.verificationDocument.birthday}
                      </div>
                    </div>
                  </div>
                 </div>
                    ))
               )}
              </div>
            </div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />

          </div>

        </div>
      </div>
    </section>
  );
}

Home.getInitialProps = async () => {
  try {
    const res = await systemService.getConfigByKeys([
      "transparentLogo",
      "authBgImage",
    ]);
    return res.data;
  } catch (e) {
    return {};
  }
};

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser,
});

Home.Layout = BlankWithFooterLayout;
export default connect(mapStateToProps)(Home);
