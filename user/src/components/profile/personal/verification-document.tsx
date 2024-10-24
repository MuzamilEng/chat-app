import { City, Country, State } from 'country-state-city';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import axios from 'axios';
import { pick } from 'lodash';
import moment from 'moment';
import getConfig from 'next/config';
import { Component } from 'react';
import {
  Button, Col, Form, FormControl, Image, Row
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import Upload from 'src/components/upload/Upload';
import { updateDocument } from 'src/redux/auth/actions';
import * as Yup from 'yup';

const exampleIDCard = '/images/example_ID_card.jpg';
const exampleHoldingID = '/images/example_holding_ID.jpg';

interface FormValues {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  birthday: string;
  twitter: string;
  instagram: string;
  number: string;
  expiredDate: string;
  isConfirm: boolean;
  isExpired: boolean;
  type: string;
  id?: string;
  gender: string;
  age: number;
}

// Your component logic remains the same



class VerificationDocumentComponent extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      type: props.authUser?.verificationDocument?.type || 'ID',
      uploadHolding: false,
      uploadFrontSide: false,
      uploadBackSide: false,
      frontSideUrl: this.props.authUser?.verificationDocument?.frontSideUrl,
      backSideUrl: this.props.authUser?.verificationDocument?.backSideUrl,
      holdingUrl: this.props.authUser?.verificationDocument?.holdingUrl || '',
      countries: [],
      states: [],
      cities: [],
    };
  }

  componentDidMount() {
    this.getCountry();
  }

  // eslint-disable-next-line consistent-return
  componentDidUpdate(prevProps: any) {
    // const { requesting, success, error } = this.props.updateDocumentStore;
    // if (prevProps.updateDocumentStore?.requesting && !requesting && success && !error) {
    //   return toast.success(this.props.lang === 'en' ? 'Verification documents successfully updated; please wait for approval by the administrator.': 'Verifizierungsdokumente erfolgreich aktualisiert; bitte warten Sie auf die Genehmigung durch den Administrator.');
    // }

    // if (prevProps.updateDocumentStore?.requesting && !requesting && !success && error) {
    //   return toast.error(error?.data?.message || this.props.lang === 'en' ? 'Verification document update failed!' : 'Verifizierungsdokumentaktualisierung fehlgeschlagen!');
    // }
  }

  getCountry() {
    this.setState(
      {
        countries: Country.getAllCountries().map((i) => ({ isoCode: i.isoCode, name: i.name }))
      },
      () => {
        const verificationDocument = this.props.currentUser;
        if (verificationDocument?.verificationDocument?.country) {
          this.getStateAndCity(verificationDocument?.verificationDocument.country);
        }
      }
    );
  }


  getLangFromUrl = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const lang = path.split('/')[1];
      return lang && lang.length === 2 ? lang : 'en';
    }
    return 'en';
  };
  

  async getStateAndCity(country: string) {
    const countryCode = this.getCodeByCountry(country);
    // State data
    const stateData = await State.getStatesOfCountry(countryCode).map((i) => ({ isoCode: i.isoCode, name: i.name }));
    // City data
    const cityData = await City.getCitiesOfCountry(countryCode).map((i) => ({ name: i.name }));

    this.setState({ states: stateData, cities: cityData });
  }

  getCodeByCountry(country: string) {
    const { countries } = this.state;
    const selectedCountry = countries.filter((c) => c.name === country);
    return selectedCountry[0]?.isoCode;
  }

  // eslint-disable-next-line consistent-return
  updateVerificationDocument(values: any) {
    if (!values.isConfirm) {
      return toast.error( this.state.lang === 'en' ? 'Please confirm that you are sexually explicit / pornographic content!' : 'Bitte bestätigen Sie, dass Sie sexuell explizite / pornografische Inhalte veröffentlichen werden!');
    }
    if (!values.isExpired && !values.expiredDate) {
      return toast.error( this.state.lang === 'en' ? 'Please enter the expiry date of the document!' : 'Bitte geben Sie das Ablaufdatum des Dokuments ein!');
    }
    if (
      !this.state.uploadFrontSide
      || (!this.state.uploadBackSide && this.state.type === 'ID')
      || !this.state.uploadHolding
    ) {
      return toast.error( this.state.lang === 'en' ? 'Please load all photos of the document!' : 'Bitte laden Sie alle Fotos des Dokuments hoch!');
    }
    if (values.zipCode) {
      // eslint-disable-next-line no-param-reassign
      values.zipCode = values.zipCode.toString();
    }
    if (values.number) {
      // eslint-disable-next-line no-param-reassign
      values.number = values.number.toString();
    }
    const data = Object.assign(
      pick(values, [
        'firstName',
        'lastName',
        'address',
        'city',
        'state',
        'country',
        'zipCode',
        'birthday',
        'twitter',
        'instagram',
        'type',
        'number',
        'expiredDate',
        'isConfirm',
        'isExpired'
      ]),
      { type: this.state.type }
    );
    this.props.updateDocument(data);
  }

  uploadPhoto(state: string, photoUrl: string, value: any) {
    this.setState({ [state]: true, [photoUrl]: value.data.url });
    return toast.success( 'Foto erfolgreich hochgeladen!');
  }

  submitDocument = async (data: any) => {
    console.log('Submitting document with data:', data);
    try {
      const response = await axios.post(`https://api.girls2dream.com/v1/users/document`, data);
      if(response.status === 200 || response.data) {
        this.props.activeStep === 5;     
        this.props.onVerficationDocumentSuccess(true);
        localStorage.removeItem('userRegisterationRecords');
      }
      return response.data; // Adjust based on your API response
    } catch (error) {
      console.error("Error submitting document:", error);
      throw error; // Rethrow to handle it in the calling function
    }
  };
  
  render() {
    const { currentUser } = this.props;
    const { countries, states, cities } = this.state;
    const lang = this.getLangFromUrl();
    // eslint-disable-next-line no-nested-ternary
    const certText = this.state.type === 'ID' ? 'ID' : this.state.type === 'passport' ? 'Passport' : 'Driving Lisence';
    const { publicRuntimeConfig: config } = getConfig();
    const validateMaxBirhOfDay = moment().subtract(18, 'year').endOf('day').format('YYYY-MM-DD');
    const validateMinBirhOfDay = moment().subtract(100, 'year').endOf('day').format('YYYY-MM-DD');

    const schema = Yup.object().shape({
      firstName: Yup.string().required( lang === 'en' ? 'First Name is required' : 'Vorname ist erforderlich'),
      lastName: Yup.string().required( lang === 'en' ? 'Last Name is required' : 'Nachname ist erforderlich'),
      address: Yup.string().required( lang === 'en' ? 'Address is required' : 'Adresse ist erforderlich'),
      city: Yup.string(),
      state: Yup.string(),
      country: Yup.string().required( lang === 'en' ? 'Country is required' : 'Land ist erforderlich'),
      zipCode: Yup.string().required( lang === 'en' ? 'Zip Code is required' : 'Postleitzahl ist erforderlich'),
      birthday: Yup.string().required( lang === 'en' ? 'Birthday is required' : 'Geburtstag ist erforderlich'),  
      twitter: Yup.string().notRequired(),
      instagram: Yup.string().notRequired(),
      number: Yup.string().notRequired(),
      expiredDate: Yup.string().notRequired(),
      isExpired: Yup.boolean(),
      isConfirm: Yup.boolean(),
      gender: Yup.string().required( lang === 'en' ? 'Gender is required' : 'Geschlecht ist erforderlich'),
      age: Yup.number()
    });

    return (
      <div>
        <Formik
          validationSchema={schema}
          initialValues={{
            firstName: currentUser?.verificationDocument?.firstName || '',
            lastName: currentUser?.verificationDocument?.lastName || '',
            address: currentUser?.verificationDocument?.address || '',
            country: currentUser?.verificationDocument?.country || '',
            state: currentUser?.verificationDocument?.state || '',
            city: currentUser?.verificationDocument?.city || '',
            zipCode: currentUser?.verificationDocument?.zipCode || '',
            birthday: currentUser?.verificationDocument?.birthday || '',
            twitter: currentUser?.verificationDocument?.twitter || '',
            instagram: currentUser?.verificationDocument?.instagram || '',
            number: currentUser?.verificationDocument?.number || '',
            expiredDate: currentUser?.verificationDocument?.expiredDate || '',
            isExpired: currentUser?.verificationDocument?.isExpired || false,
            isConfirm: currentUser?.verificationDocument?.isConfirm || false,
            gender: currentUser?.gender || '',
            type: currentUser?.verificationDocument?.type || 'ID',
            id: currentUser?._id || '',
            age: currentUser?.age || 0,
          }}
          onSubmit={async (values: FormValues) => {
            try {
              // Calculate the user's age based on their birthday
              const calculatedAge = moment().diff(moment(values.birthday, 'YYYY-MM-DD'), 'years');
              values.age = calculatedAge || 0; // Assign calculated age as a number
              const response = await this.submitDocument(values);
              this.props.activeStep === 5;
              this.props.onVerficationDocumentSuccess(true);
            } catch (error) {
              toast.error('There was an error submitting your document. Please try again.');
            }
          }}
          
          render={(props: FormikProps<FormValues>) => (
            <form className="form-signin form-update-profile" onSubmit={props.handleSubmit}>
              <div className="card-body">
                <Row>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'First Name' : 'Vorname'}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        isInvalid={props.touched.firstName && !!props.errors.firstName}
                        name="firstName"
                        className="form-control form-control-md"
                        type="text"
                        placeholder={lang === 'en' ? 'Please enter your first name.' : 'Bitte geben Sie Ihren Vornamen ein.'}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.firstName}
                      />
                      <div className="invalid-feedback">{props.errors.firstName}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'Last Name' : 'Nachname'}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        isInvalid={props.touched.lastName && !!props.errors.lastName}
                        name="lastName"
                        className="form-control form-control-md"
                        type="text"
                        placeholder={lang === 'en' ? 'Please enter your last name.' : 'Bitte geben Sie Ihren Nachnamen ein.'}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.lastName}
                      />
                      <div className="invalid-feedback">{props.errors.lastName}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'Birthday' : 'Geburtstag'}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        isInvalid={props.touched.birthday && !!props.errors.birthday}
                        name="birthday"
                        className="form-control form-control-md"
                        type="date"
                        min={validateMinBirhOfDay}
                        max={validateMaxBirhOfDay}
                        placeholder={lang === 'en' ? 'Please enter your birthday.' : 'Bitte geben Sie Ihr Geburtstag ein.'}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.birthday}
                      />
                      <div className="invalid-feedback">{props.errors.birthday}</div>
                    </Form.Group>
                  </Col>
                  {/* <Col xs={12} md={6}>
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
                    </Col> */}
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
                          label={lang === 'en' ? 'Transgender' : 'Transgendlich'}
                        />
                        <div className="invalid-feedback">{props.errors.gender}</div>
                      </Form.Group>
                    </Col>
                  <Col md={12} xs={12} className="mt-3">
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'Address' : 'Adresse'}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        isInvalid={props.touched.address && !!props.errors.address}
                        name="address"
                        className="form-control form-control-md"
                        type="text"
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.address}
                      />
                      <div className="invalid-feedback">{props.errors.address}</div>
                    </Form.Group>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Group>
                      <Form.Label>
                       Land
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        isInvalid={props.touched.country && !!props.errors.country}
                        name="country"
                        as="select"
                        className="form-control form-control-md"
                        type="text"
                        onChange={(e) => {
                          this.getStateAndCity(e.target.value);
                          props.handleChange(e);
                        }}
                        onBlur={props.handleBlur}
                        value={props.values.country}
                      >
                        <option value="">{lang === 'en' ? 'Your Country' : 'Mein Land'}</option>
                        {countries.length
                        && countries.map((i) => (
                          <option value={i.name} key={i.isoCode}>
                            {i.name}
                          </option>
                        ))}
                      </FormControl>
                      <div className="invalid-feedback">{props.errors.country}</div>
                    </Form.Group>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Group>
                      <Form.Label>{lang === 'en' ? 'State' : 'Staat'}</Form.Label>
                      <FormControl
                        isInvalid={props.touched.state && !!props.errors.state}
                        as="select"
                        name="state"
                        className="form-control form-control-md"
                        type="text"
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.state}
                      >
                        <option value="">{lang === 'en' ? 'Your State' : 'Mein Staat'}</option>
                        {states.length
                        && states.map((i, index) => (
                          <option value={i.name} key={`${i.name}_${index}` as any}>
                            {i.name}
                          </option>
                        ))}
                      </FormControl>
                      <div className="invalid-feedback">{props.errors.state}</div>
                    </Form.Group>
                  </Col>
                  <Col md={4} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'City' : 'Stadt'}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        as="select"
                        isInvalid={props.touched.city && !!props.errors.city}
                        name="city"
                        className="form-control form-control-md"
                        type="text"
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.city}
                      >
                        <option value="">{lang === 'en' ? 'Your City' : 'Meine Stadt'}</option>
                        {cities.length
                        && cities.map((i, index) => (
                          <option value={i.name} key={`${i.name}_${index}` as any}>
                            {i.name}
                          </option>
                        ))}
                      </FormControl>
                      <div className="invalid-feedback">{props.errors.city}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'Zip Code' : 'Postleitzahl'}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <FormControl
                        isInvalid={props.touched.zipCode && !!props.errors.zipCode}
                        name="zipCode"
                        className="form-control form-control-md"
                        min="0"
                        type="string"
                        placeholder={lang === 'en' ? 'Please enter your zip code.' : 'Bitte geben Sie Ihre Postleitzahl ein.'}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.zipCode}
                      />
                      <div className="invalid-feedback">{props.errors.zipCode}</div>
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>{lang === 'en' ? 'Document Type' : 'Dokumententyp'}</Form.Label>
                      <FormControl
                        as="select"
                        value={this.state.type}
                        onChange={(e: any) => this.setState({ type: e.target.value })}
                      >
                        <option value="ID">{lang === 'en' ? 'ID Card' : 'ID'}</option>
                        <option value="passport">{lang === 'en' ? 'Passport' : 'Reisepass'}</option>
                      </FormControl>
                    </Form.Group>
                  </Col>
                  {/* <Col md={6} xs={12} /> */}
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>
                        {certText}
                        {' '}
                        {lang === 'en' ? 'Number' : 'Nummer'}
                        <span className="text-required required-red"> *</span>
                      </Form.Label>
                      <FormControl
                        name="number"
                        className="form-control form-control-md"
                        type="string"
                        min="0"
                        placeholder={lang === 'en' ? 'Please enter your number.' : `Geben Sie Ihre ${certText}-Nummer ein.`}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.number}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Label>
                        {certText}
                        {' '}
                        {lang === 'en' ? 'Expired Date' : 'Ablaufdatum'}
                        <span className="text-required required-red"> *</span>
                      </Form.Label>
                      <FormControl
                        name="expiredDate"
                        className="form-control form-control-md"
                        type="date"
                        placeholder={`Bitte geben Sie ein ${
                        // eslint-disable-next-line no-nested-ternary
                          this.state.type === 'driverCard'
                            ? 'Führerschein'
                            : this.state.type === 'passport'
                              ? 'Reisepass'
                              : 'Identifikation'
                        } Ablaufdatum hier eingeben`}
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        value={props.values.expiredDate}
                        disabled={props.values.isExpired}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} xs={12} />
                  <Col md={6} xs={12}>
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        name="isExpired"
                        id="isExpired"
                        label="No expiration date"
                        onChange={props.handleChange}
                        onBlur={props.handleBlur}
                        checked={props.values.isExpired}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'Front Side' : 'Foto von'}
                        {' '}
                        {certText !== 'ID' ? `Ihr ${certText}` : lang === 'en' ? ` ${certText}` :  `Die Vorderseite Ihres ${certText}`}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <br />
                      {this.state.frontSideUrl ? (
                        <Image
                          src={this.state.frontSideUrl}
                          style={{ borderRadius: 10 }}
                          fluid
                          width={250}
                          height={150}
                        />
                      ) : (
                        <Image src={exampleIDCard} style={{ borderRadius: 10 }} fluid width={250} height={150} />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={12} xs={12}>
                    <Form.Group>
                      <Upload
                        isChecked={true}
                        url={`${config.API_ENDPOINT}/users/certification/photo?position=frontSide`}
                        onComplete={(e: any) => this.uploadPhoto('uploadFrontSide', 'frontSideUrl', e)}
                        config={{
                          multiple: false,
                          accept: 'image/*'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  {this.state.type === 'ID' && (
                  <>
                    <Col md={12} xs={12}>
                      <Form.Group>
                        <Form.Label>
                        {lang === 'en' ? 'Back Side' : 'Foto von der Rückseite Ihres'}
                          {' '}
                          {certText}
                          {' '}
                          <span className="text-required required-red">*</span>
                        </Form.Label>
                        <br />
                        {this.state.backSideUrl ? (
                          <Image src={this.state.backSideUrl} style={{ borderRadius: 10 }} width={250} height={160} />
                        ) : (
                          <Image src={exampleIDCard} style={{ borderRadius: 10 }} width={250} height={160} />
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={12} xs={12}>
                      <Form.Group>
                        <Upload
                        isChecked={true}
                          url={`${config.API_ENDPOINT}/users/certification/photo?position=backSide`}
                          onComplete={(e: any) => this.uploadPhoto('uploadBackSide', 'backSideUrl', e)}
                          config={{
                            multiple: false,
                            accept: 'image/*'
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </>
                  )}
                  <Col md={12} xs={12}>
                    <Form.Group>
                      <Form.Label>
                      {lang === 'en' ? 'Holding Photo' : 'Foto, auf dem Sie Ihr'}
                        {' '}
                        {certText}
                        {' '}
                        <span className="text-required required-red">*</span>
                      </Form.Label>
                      <br />
                      {this.state.holdingUrl ? (
                        <Image src={this.state.holdingUrl} style={{ borderRadius: 10 }} width={250} height={160} />
                      ) : (
                        <Image src={exampleHoldingID} style={{ borderRadius: 10 }} width={250} height={160} />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={12} xs={12}>
                    <Form.Group>
                      <Upload
                      isChecked={true}
                        url={`${config.API_ENDPOINT}/users/certification/photo?position=holding`}
                        onComplete={(e: any) => this.uploadPhoto('uploadHolding', 'holdingUrl', e)}
                        config={{
                          multiple: false,
                          accept: 'image/*'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} xs={12}>
                    <Form.Group>
                      <Form.Check
                        type="checkbox"
                        name="isConfirm"
                        id="isConfirm"
                        label={lang === 'en' ? 'I will post sexually explicit/pornographic content' : 'Ich werde sexuell explizite / pornografische Inhalte veröffentlichen'}
                        onBlur={props.handleBlur}
                        onChange={props.handleChange}
                        checked={props.values.isConfirm}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
              <Button className="btn btn-primary p-2" variant="primary" type="submit">
              {lang === 'en' ? 'Update Verification Document' : 'Aktualisieren Sie das Verifizierungsdokument.'}
              </Button>
            </form>
          )}
        />
      </div>
    );
  }
}

export default VerificationDocumentComponent
