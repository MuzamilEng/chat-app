import Loading from '@components/common-layout/loading/loading';
import axios from 'axios';
import { City, Country, State } from 'country-state-city';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Component } from 'react';
import { Col, Form, FormControl, Row} from 'react-bootstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { setAvatar, updateProfile } from 'src/redux/auth/actions';
import * as Yup from 'yup';

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


class ProfileDataForm extends Component<any, any> {
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
        if (authUser?.country) {
          this.getStateAndCity(authUser?.country);
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


  render() {
    const authUser  = this.props.currentUser;
    const { countries, states, cities } = this.state;
    const { t} = this.props;
    const lang = this.getLangFromUrl();
    const userFromLocal = JSON.parse(localStorage.getItem('userRegisterationRecords'))
    const schema = Yup.object().shape({
      username: Yup.string().required( lang === 'en' ? 'Username is required' : 'Benutzername ist erforderlich'),
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


    const handleFormSubmit = async (values, formikHelpers) => {
      try {
        const response = await axios.put('https://api.girls2dream.com/v1/users/updateProfile', values, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          toast.success(lang === 'de' ? 'Profil erfolgreich aktualisiert!' : 'Profile updated successfully!');
          this.props.onProfileFormSuccess(true);
          // Update localStorage with new user data
          userFromLocal.username = values.username;
          userFromLocal.bio = values.bio;
          userFromLocal.age = values.age;
          userFromLocal.gender = values.gender;
          userFromLocal.phoneNumber = values.phoneNumber;
          userFromLocal.email = values.email;
          userFromLocal.address = values.address;
          userFromLocal.state = values.state;
          userFromLocal.city = values.city;
          userFromLocal.country = values.country;
          userFromLocal.postCode = values.postCode;
  
          localStorage.setItem('userRegisterationRecords', JSON.stringify(userFromLocal));
  
          formikHelpers.setSubmitting(false);
        }
      } catch (error) {
        formikHelpers.setSubmitting(false);
        console.error('Error updating profile:', error);
        toast.error(lang === 'de' ? 'Fehler beim Aktualisieren des Profils!' : 'Error updating profile!');
      }
    };
  

    return (
      <div>
         {authUser ? <Formik
          validationSchema={schema}
          initialValues={{
            username: authUser?.username?.length < 14 ? (authUser?.username || userFromLocal?.username) : "",
            bio: authUser?.bio || userFromLocal?.bio || "",
            age: authUser?.age || userFromLocal?.age || "",
            gender: authUser?.gender || userFromLocal?.gender || "",
            phoneNumber: authUser?.phoneNumber || userFromLocal?.phoneNumber || "",
            email: authUser?.email || userFromLocal?.email || "",
            address: authUser?.address || userFromLocal?.address || "",
            state: authUser?.state || userFromLocal?.state || "",
            city: authUser?.city || userFromLocal?.city || "",
            country: authUser?.country || userFromLocal?.country || "",
            postCode: authUser?.postCode || userFromLocal?.postCode || "",
            id: authUser?._id
          }}
          onSubmit={handleFormSubmit}
        >
            {(props: FormikProps<FormValues>) => (
              <form onSubmit={props.handleSubmit}>
                <div className="card-body">
                  <Row>
                    <Col md={12} xs={12}>
                      <Form.Group>
                        <Form.Label>
                        {lang === 'en' ? 'Username' : 'Benutzername'}
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
                        <Form.Label>{lang === 'en' ? 'Email' : 'E-Mail'}</Form.Label> {' '}
                        <span className="text-required required-red">*</span>
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
                    </Col>
                    <p className='text-muted mx-auto'>{lang === 'en' ? 'This data will not be displayed publicly' : 'Diese Daten werden nicht im Profil angezeigt'}</p>
                    <Col xs={12} md={6}>
                      <Form.Group>
                        <Form.Label>
                        {lang === 'en' ? 'Age' : 'Alter'}
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
                        <Form.Label>{lang === 'en' ? 'Gender' : 'Geschlecht'}</Form.Label>
                        <br />
                        <Form.Check
                          type="radio"
                          onChange={props.handleChange}
                          value="male"
                          checked={props.values.gender === 'male'}
                          className="form-check form-check-inline"
                          name="gender"
                          id="male"
                          label={lang === 'en' ? 'Male' : 'Maennlich'}
                        />
                        <Form.Check
                          type="radio"
                          onChange={props.handleChange}
                          value="female"
                          checked={props.values.gender === 'female'}
                          className="form-check form-check-inline"
                          name="gender"
                          id="female"
                          label={lang === 'en' ? 'Female' : 'Weiblich'}
                        />
                        <Form.Check
                          type="radio"
                          onChange={props.handleChange}
                          value="transgender"
                          checked={props.values.gender === 'transgender'}
                          className="form-check form-check-inline"
                          name="gender"
                          id="transgender"
                          label={lang === 'en' ? 'Transgender' : 'Transgender'}
                        />
                        <div className="invalid-feedback">{props.errors.gender}</div>
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>
                        {lang === 'en' ? 'Bio' : 'Bio'}
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
                        <Form.Label>{lang === 'en' ? 'Country' : 'Land'}</Form.Label>
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
                        <Form.Label>{lang === 'en' ? 'State' : 'Ihr Staat'}</Form.Label>
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
                        <Form.Label>{lang === 'en' ? 'City' : 'Ihr Stadt'}</Form.Label>
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
                  {lang === 'en' ? 'Save' : 'Speichern'}
                  </button>
                </div>
              </form>
            )}
          </Formik> :
           <>
           <Loading />
          </>}
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser,
  updateProfileStore: state.auth.updateProfileStore
});

const mapDispatch = { updateProfile, setAvatar };

export default connect(mapStateToProps, mapDispatch)(ProfileDataForm);
