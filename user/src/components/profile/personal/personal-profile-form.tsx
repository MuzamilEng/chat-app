import Upload from '@components/upload/Upload';
import { authService } from '@services/auth.service';
import { sellItemService } from '@services/sell-item.service';
import { useTranslationContext } from 'context/TranslationContext';
import { City, Country, State } from 'country-state-city';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Component } from 'react';
import { Col, Form, FormControl, Row} from 'react-bootstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import AvatarComponent from 'src/components/profile/personal/avatar-box';
import { setAvatar, updateProfile } from 'src/redux/auth/actions';
import * as Yup from 'yup';
import ImageCroper from './ImageCroper';

interface FormValues {
  username: string;
  bio: string;
  gender: string;
  age: number;
  phoneNumber: string;
  email: string;
  address: string;
  state: string;
  city: string;
  country: string;
  postCode: string;
}


class PersonalProfileForm extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      countries: [],
      states: [],
      cities: [],
      lang: 'en', // Default language
      profileVideoUrl : null
    };
  }

  componentDidMount() {
    const lang = this.getLangFromUrl(); // Extract lang from URL
    this.setState({ lang }, () => this.getCountry()); // Set the lang state and then fetch countries
    this.getProfileVideo(); // Fetch the profile video on mount
    this.getMyProfile()
  }

  componentDidUpdate(prevProps: any) {
    const { requesting, success, error } = this.props.updateProfileStore;
    if (prevProps.updateProfileStore?.requesting && !requesting && success && !error) {
      toast.success(this.state.lang === 'de' ? 'Profil erfolgreich aktualisiert!' : 'Profile updated successfully!');
    }
    if (prevProps.updateProfileStore?.requesting && !requesting && !success && error) {
      toast.error(error?.data?.message || this.state.lang === 'de' ? 'Fehler beim Aktualisieren des Profils!' : 'Error updating profile!');
    }
  }

  getLangFromUrl = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const lang = path.split('/')[1];
      return lang && lang.length === 2 ? lang : 'en';
    }
    return 'en';
  };

  getCountry() {
    this.setState(
      {
        countries: Country.getAllCountries().map((i) => ({ isoCode: i.isoCode, name: i.name }))
      },
      () => {
        const { authUser } = this.props;
        if (authUser.country) {
          this.getStateAndCity(authUser.country);
        }
      }
    );
  }

  async getStateAndCity(country: string) {
    const countryCode = this.getCodeByCountry(country);
    const stateData = await State.getStatesOfCountry(countryCode).map((i) => ({ isoCode: i.isoCode, name: i.name }));
    const cityData = await City.getCitiesOfCountry(countryCode).map((i) => ({ name: i.name }));

    this.setState({ states: stateData, cities: cityData });
  }

  getCodeByCountry(country: string) {
    const { countries } = this.state;
    const selectedCountry = countries.filter((c) => c.name === country);
    return selectedCountry[0]?.isoCode;
  }

  async getProfileVideo() {
    try {
      const res = await sellItemService.getProfileVidoe(this.props.authUser._id);
      if (res?.data?.data?.fileUrl) {
        this.setState({ profileVideoUrl: res.data?.data.fileUrl })
      }
    } catch (error) {
      console.error('Error fetching profile video:', error);
    }
  }

  async getMyProfile() {
    const res = await authService.me();
    if (res) {
      this.setState({userAge: res.data.data})
    }
  }

  onComplete = (res) => {
    if (res?.data) {
      this.getProfileVideo(); // Fetch the updated video after upload
    }
  };

  render() {
    const authUser = this.props.authUser;
    const { countries, states, cities } = this.state;
    const { t} = this.props;
    const lang = this.getLangFromUrl();
    const schema = Yup.object().shape({
      username: Yup.string()
        .min(3, lang === 'en' ? 'Name must be at least 3 characters' : 'Die Länge des Namens muss größer als 3 sein')
        .required( lang === 'en' ? 'Username is required' : 'Benutzername ist erforderlich'),
      bio: Yup.string().min(20, lang === 'en' ? 'Bio must be at least 20 characters' : 'Bitte geben Sie mindestens 20 Zeichen ein').required( lang === 'en' ? 'Bio is required' : 'Eine Kurzbiografie wird benötigt'),
      age: Yup.number().min(2).required( lang === 'en' ? 'Age is required' : 'Das Alter wird benötigt'),
      gender: Yup.string().required( lang === 'en' ? 'Gender is required' : 'Geschlecht wird benötigt'),
      phoneNumber: Yup.string(),
      email: Yup.string().email( lang === 'en' ? 'Email is not valid' : 'Die E-Mail-Adresse muss gültig sein').required( lang === 'en' ? 'Email is required' : 'E-Mail-Adresse wird benötigt'),
      address: Yup.string(),
      state: Yup.string(),
      city: Yup.string(),
      country: Yup.string(),
      postCode: Yup.string()
    });
  

    return (
      <div>
        {authUser && authUser._id ? (
          <Formik
            validationSchema={schema}
            initialValues={{
              username: authUser?.username,
              bio: authUser?.bio,
              age: authUser?.age,
              gender: authUser?.gender,
              phoneNumber: authUser?.phoneNumber,
              email: authUser?.email,
              address: authUser?.address,
              state: authUser?.state,
              city: authUser?.city,
              country: authUser?.country,
              postCode: authUser?.postCode,
              id: authUser?._id
            }}
            onSubmit={(values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
              this.props.updateProfile({ ...values });
              window.location.reload();
              formikHelpers.setSubmitting(false);
            }}
          >
            {(props: FormikProps<FormValues>) => (
              <form onSubmit={props.handleSubmit}>
                <div className="card-body">
                  <Row>
                  <Row>
                  <Col>
                    {/* <AvatarComponent
                      avatarUrl={authUser.avatarUrl}
                      onUploadAvatarComplete={this.props.setAvatar.bind(this)}
                    /> */}
                    <ImageCroper avatarURL={authUser.avatarUrl} />
                     <p style={{ color: 'green', marginLeft: '5vw' }} className="text mt-2">{authUser.avatarStatus === 'pending' ? 'pending' : 'approved'}</p>
                  </Col>
                  <div className="mt-3">
                      <video style={{ width: '15vw', height: '15vw', borderRadius: '2%', objectFit: 'cover' }} controls src={this.state.profileVideoUrl} />
                      <p style={{ color: 'green', marginLeft: '5vw' }} className="text mt-2">{!this.state.profileVideoUrl ? 'pending' : 'approved'}</p>
                    </div>
                  <Col>
                    <Upload
                      key="upload"
                      fileName='profile_video'
                      onComplete={this.onComplete.bind(this)}
                      url={`https://api.girls2dream.com/v1/media/videos`}
                      isChecked={true}
                      config={{
                        multiple: false,
                        accept: 'video/mp4'
                      }}
                    />
                  </Col>
                </Row>
                    <Col md={12} xs={12}>
                      <Form.Group>
                        <Form.Label>
                        {t?.profilePage?.name}
                          {' '}
                          <span className="text-required required-red">*</span>
                        </Form.Label>
                        <FormControl
                          isInvalid={props.touched.username && !!props.errors.username}
                          name="username"
                          className="form-control form-control-md"
                          type="text"
                          id="username"
                          placeholder={lang === 'en' ? 'Enter your name' : 'Geben Sie Ihren Namen ein'}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.username}
                        />
                        <div className="invalid-feedback">{props.errors.username}</div>
                      </Form.Group>
                    </Col>
                    <Col md={12} xs={12}>
                      <Form.Group>
                        <Form.Label>{t?.profilePage?.email}</Form.Label>
                        <FormControl
                          isInvalid={props.touched.email && !!props.errors.email}
                          name="email"
                          className="form-control form-control-md"
                          type="email"
                          placeholder={lang === 'en' ? 'Enter your email' : 'Geben Sie Ihre E-Mail Adresse ein'}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.email}
                        />
                        <div className="invalid-feedback">{props.errors.email}</div>
                      </Form.Group>
                    <p style={{ textAlign: 'center', display: 'block' }} className='text-muted mx-auto'>{lang === 'en' ? 'This data will be displayed publicly' : 'Diese Daten werden nicht im Profil angezeigt'}</p> <br />
                    </Col>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label>
                        {t?.profilePage?.age}
                          {' '}
                          <span className="text-required required-red">*</span>
                        </Form.Label>
                        <FormControl
                          isInvalid={props.touched.age && !!props.errors.age}
                          name="age"
                          type="number"
                          min={18}
                          className="form-control form-control-md"
                          id="age"
                          placeholder={lang === 'en' ? 'Please enter your age.' : 'Bitte geben Sie Ihr Alter ein.'}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.age}
                        />
                        <div className="invalid-feedback">{props.errors.age}</div>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>{t?.profilePage?.gender}</Form.Label>
                        <br />
                        <Form.Check
                          type="radio"
                          onChange={props.handleChange}
                          value="male"
                          checked={props.values.gender === 'male'}
                          className="form-check form-check-inline"
                          name="gender"
                          id="male"
                          label={t?.profilePage?.option?.male}
                        />
                        <Form.Check
                          type="radio"
                          onChange={props.handleChange}
                          value="female"
                          checked={props.values.gender === 'female'}
                          className="form-check form-check-inline"
                          name="gender"
                          id="female"
                          label={t?.profilePage?.option?.female}
                        />
                        <Form.Check
                          type="radio"
                          onChange={props.handleChange}
                          value="transgender"
                          checked={props.values.gender === 'transgender'}
                          className="form-check form-check-inline"
                          name="gender"
                          id="transgender"
                          label={t?.profilePage?.option?.transgender}
                        />
                        <div className="invalid-feedback">{props.errors.gender}</div>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>
                        {t?.profilePage?.bio}
                          {' '}
                          <span className="text-required required-red">*</span>
                        </Form.Label>
                        <FormControl
                          isInvalid={props.touched.bio && !!props.errors.bio}
                          name="bio"
                          id="bio"
                          className="form-control form-control-md"
                          placeholder={lang === 'en' ? 'Please enter your bio.' : 'Bitte geben Sie Ihre Bio ein.'}
                          as="textarea"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.bio}
                        />
                        <div className="invalid-feedback">{props.errors.bio}</div>
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label>{t?.profilePage?.country}</Form.Label>
                        <Form.Control
                          as="select"
                          name="country"
                          id="country"
                          className="form-control form-control-md"
                          type="text"
                          onChange={(e) => {
                            this.getStateAndCity(e.target.value);
                            props.handleChange(e);
                          }}
                          onBlur={props.handleBlur}
                          value={props.values.country}
                        >
                          <option value="">{lang === 'en' ? 'Country' : 'Land'}</option>
                          {countries.length
                              && countries.map((i) => (
                                <option value={i.name} key={i.isoCode}>
                                  {i.name}
                                </option>
                              ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label>{t?.profilePage?.province}</Form.Label>
                        <Form.Control
                          as="select"
                          name="state"
                          id="state"
                          className="form-control form-control-md"
                          type="text"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.state}
                        >
                          <option value="">{lang === 'en' ? 'State' : 'Ihr Staat'}</option>
                          {states.length
                              && states.map((i, index) => (
                                <option value={i.name} key={`${i.name}_${index}` as any}>
                                  {i.name}
                                </option>
                              ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                    <Col xs={4}>
                      <Form.Group>
                        <Form.Label>{t?.profilePage?.city}</Form.Label>
                        <Form.Control
                          as="select"
                          name="city"
                          id="city"
                          className="form-control form-control-md"
                          type="text"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.city}
                        >
                          <option value="">{lang === 'en' ? 'City' : 'Ihr Stadt'}</option>
                          {cities.length
                              && cities.map((i, index) => (
                                <option value={i.name} key={`${i.name}_${index}` as any}>
                                  {i.name}
                                </option>
                              ))}
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <div className="card-footer d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">
                  {t?.profilePage?.save}
                  </button>
                </div>
              </form>
            )}
          </Formik>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser,
  updateProfileStore: state.auth.updateProfileStore
});

const mapDispatch = { updateProfile, setAvatar };

export default connect(mapStateToProps, mapDispatch)(PersonalProfileForm);
