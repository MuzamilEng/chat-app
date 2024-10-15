import * as React from 'react';
import { City, Country, State } from 'country-state-city';
import {
  Col, Row, Button, FormGroup, Label, Input, FormFeedback
} from 'reactstrap';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { omit } from 'lodash';
import getConfig from 'next/config';
import moment from 'moment';
import Upload from '../upload/Upload';

interface FormValue {
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
  isApproved: boolean;
  isExpired: boolean;
  type: string;
  holdingUrl: string;
  frontSideUrl: string;
  backSideUrl: string;
}

interface IProps {
  submit: Function;
  user?: any;
  loading?: boolean;
}

const initialValuesForm = {
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  birthday: '',
  twitter: '',
  instagram: '',
  isConfirm: false,
  isApproved: false,
  isExpired: false,
  type: 'ID',
  holdingUrl: '',
  frontSideUrl: '',
  backSideUrl: ''
} as any;

const UserVerificationForm: React.FunctionComponent<IProps> = ({
  submit,
  loading = false,
  user = null
}) => {
  const [countries, setCountries] = React.useState([] as any);
  const [states, setStates] = React.useState([]);
  const [cities, setCities] = React.useState([]);

  const { publicRuntimeConfig: config } = getConfig();
  initialValuesForm.isApproved = user.isApproved;
  const initialValues = user.verificationDocument ? Object.assign(initialValuesForm, user.verificationDocument) : initialValuesForm;
  const schema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string(),
    state: Yup.string(),
    country: Yup.string().required('Country is required'),
    zipCode: Yup.string().required('Zip code is required'),
    birthday: Yup.string().required('Age is required and must not be under 18'),
    twitter: Yup.string().notRequired(),
    instagram: Yup.string().notRequired(),
    number: Yup.string().required('ID number is required'),
    expiredDate: Yup.string().notRequired(),
    isExpired: Yup.boolean(),
    isConfirm: Yup.boolean(),
    isApproved: Yup.boolean()
  });

  // eslint-disable-next-line no-nested-ternary
  const certText = user.verificationDocument.type === 'ID' ? 'ID' : user.verificationDocument.type === 'passport' ? 'Passport' : 'Driving Lisence';
  const validateMaxBirhOfDay = moment().subtract(18, 'year').endOf('day').format('YYYY-MM-DD');
  const validateMinBirhOfDay = moment().subtract(100, 'year').endOf('day').format('YYYY-MM-DD');

  const getCountry = async () => {
    const countryDataawait = Country.getAllCountries().map((i) => ({ isoCode: i.isoCode, name: i.name }));
    setCountries(countryDataawait);
  };

  const getCodeByCountry = (country: string) => {
    const selectedCountry = countries.filter((c) => c.name === country);
    return selectedCountry[0]?.isoCode;
  };

  const getStateAndCity = async (country: string) => {
    const countryCode = getCodeByCountry(country);
    // State data
    const stateData = await State.getStatesOfCountry(countryCode).map((i) => ({ isoCode: i.isoCode, name: i.name }));
    setStates(stateData);
    // City data
    const cityData = await City.getCitiesOfCountry(countryCode).map((i) => ({ name: i.name }));
    setCities(cityData);
  };

  React.useEffect(() => {
    if (countries && countries.length > 0 && user.verificationDocument?.country) {
      getStateAndCity(user.verificationDocument.country);
    }
  }, [countries]);

  React.useEffect(() => {
    getCountry();
  }, []);

  return (
    <Formik
      enableReinitialize
      validationSchema={schema}
      onSubmit={(values: FormValue) => {
        const newData = omit(values, ['holdingUrl', 'backSideUrl', 'frontSideUrl']);
        newData.number = values.number.toString();
        newData.zipCode = values.zipCode.toString();
        submit(newData);
      }}
      initialValues={initialValues}
      render={(props: FormikProps<FormValue>) => (
        <form onSubmit={props.handleSubmit}>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label>Model</Label>
                <Input disabled name="name" className="input-type" type="text" value={user.username || 'No name'} />
              </FormGroup>
            </Col>
            {/* <Col md={6} /> */}
            <Col md={6}>
              <FormGroup>
                <Label>
                  First Name
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.firstName && !!props.errors.firstName}
                  name="firstName"
                  className="input-type"
                  type="text"
                  placeholder="Enter your first name here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.firstName}
                />
                <FormFeedback>{props.errors.firstName}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Last Name
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.lastName && !!props.errors.lastName}
                  name="lastName"
                  className="input-type"
                  type="text"
                  placeholder="Enter your last name here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.lastName}
                />
                <FormFeedback>{props.errors.lastName}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Date Of Birth
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.birthday && !!props.errors.birthday}
                  name="birthday"
                  className="input-type"
                  type="date"
                  min={validateMinBirhOfDay}
                  max={validateMaxBirhOfDay}
                  placeholder="Enter your age here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.birthday}
                />
                <FormFeedback>{props.errors.birthday}</FormFeedback>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label>
                  Address
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.address && !!props.errors.address}
                  name="address"
                  className="input-type"
                  type="text"
                  placeholder="Enter your address here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.address}
                />
                <FormFeedback>{props.errors.address}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Country
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.country && !!props.errors.country}
                  name="country"
                  className="input-type"
                  type="select"
                  onChange={(e) => {
                    getStateAndCity(e.target.value);
                    props.handleChange(e);
                  }}
                  onBlur={props.handleBlur}
                  value={props.values.country}
                >
                  <option value="">Enter your country here</option>
                  {countries.length
                    && countries.map((i) => (
                      <option value={i.name} key={i.isoCode}>
                        {i.name}
                      </option>
                    ))}
                </Input>
                <FormFeedback>{props.errors.country}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  State
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.state && !!props.errors.state}
                  name="state"
                  className="input-type"
                  type="select"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.state}
                >
                  <option value="">Enter your state here</option>
                  {states.length
                    && states.map((i, index) => (
                      <option value={i.name} key={`${i.name}_${index}` as any}>
                        {i.name}
                      </option>
                    ))}
                </Input>
                <FormFeedback>{props.errors.state}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  City
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.city && !!props.errors.city}
                  name="city"
                  className="input-type"
                  type="select"
                  placeholder="Enter your city here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.city}
                >
                  <option value="">Enter your city here</option>
                  {cities.length
                    && cities.map((i, index) => (
                      <option value={i.name} key={`${i.name}_${index}` as any}>
                        {i.name}
                      </option>
                    ))}
                </Input>
                <FormFeedback>{props.errors.city}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  Postal/Zip
                  {' '}
                  <span className="text-required">*</span>
                </Label>
                <Input
                  invalid={props.touched.zipCode && !!props.errors.zipCode}
                  name="zipCode"
                  className="input-type"
                  type="number"
                  min="0"
                  placeholder="Enter your zip code here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.zipCode}
                />
                <FormFeedback>{props.errors.zipCode}</FormFeedback>
              </FormGroup>
            </Col>

            {/* <Col md={6}>
              <FormGroup>
                <Label>Twitter</Label>
                <Input
                  name="twitter"
                  className="input-type"
                  type="text"
                  placeholder="Enter your twitter here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.twitter}
                />
                <FormFeedback>{props.errors.twitter}</FormFeedback>
              </FormGroup>
            </Col> */}

            {/* <Col md={6}>
              <FormGroup>
                <Label>Instagram</Label>
                <Input
                  name="instagram"
                  className="input-type"
                  type="text"
                  placeholder="Enter your instagram here"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.instagram}
                />
                <FormFeedback>{props.errors.instagram}</FormFeedback>
              </FormGroup>
            </Col> */}
            <Col md={6}>
              <FormGroup>
                <Label>Document Type</Label>
                <Input type="select" name="type" onChange={props.handleChange} value={props.values.type}>
                  <option value="ID">ID</option>
                  <option value="passport">Passport</option>
                  <option value="driverCard">Driving License</option>
                </Input>
              </FormGroup>
            </Col>
            {/* <Col md={6} /> */}
            <Col md={6}>
              <FormGroup>
                <Label>
                  {certText}
                  {' '}
                  Number
                  <span className="text-required">*</span>
                </Label>
                <Input
                  name="number"
                  className="input-type"
                  type="number"
                  min="0"
                  placeholder={`Enter your ${certText === 'ID' ? certText : certText.toLowerCase()} number here`}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.number}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>
                  {certText}
                  {' '}
                  Expiration Date
                  <span className="text-required">*</span>
                </Label>
                <Input
                  name="expiredDate"
                  className="input-type"
                  type="date"
                  placeholder={`Enter your ${certText === 'ID' ? certText : certText.toLowerCase()
                  } expiration date here`}
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.expiredDate}
                  disabled={props.values.isExpired}
                />
              </FormGroup>
            </Col>
            <Col md={6} />
            <Col md={6}>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isExpired"
                    onChange={props.handleChange}
                    checked={props.values.isExpired}
                  />
                  No Expiration Date
                </Label>
              </FormGroup>
            </Col>
            <Col md={12}>
              <Row>
                <Col md={12}>
                  <Label>
                    Photo Of
                    {' '}
                    {certText !== 'ID' ? `Your ${certText}` : `The Front Your ${certText}`}
                    {' '}
                    <span className="text-required">*</span>
                  </Label>
                </Col>
                <Col md={3}>
                  <Image
                    src={props.values.frontSideUrl || '/images/default-avatar.png'}
                    style={{ borderRadius: 10 }}
                    fluid
                    width={250}
                    height={150}
                    onClick={() => window.open(props.values.frontSideUrl, '_blank')}
                  />
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Upload
                      url={`${config.API_ENDPOINT}/users/${user._id}/certification/photo?position=frontSide`}
                      onComplete={(e: any) => {
                        props.setFieldValue('frontSideUrl', e.data.url);
                        toast.success('Hochladen erfolgreich');
                      }}
                      config={{ multiple: false, accept: 'image/*' }}
                      previewImage={props.values.frontSideUrl || '/images/default-avatar.png'}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            {props.values.type === 'ID' && (
            <Col md={12}>
              <Row>
                <Col md={12}>
                  <Label>
                    ID Back Photo
                    {' '}
                    <span className="text-required">*</span>
                  </Label>
                </Col>
                <Col md={3}>
                  <Image
                    src={props.values.backSideUrl || '/images/default-avatar.png'}
                    style={{ borderRadius: 10 }}
                    fluid
                    width={250}
                    height={150}
                    onClick={() => window.open(props.values.backSideUrl, '_blank')}
                  />
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Upload
                      url={`${config.API_ENDPOINT}/users/${user._id}/certification/photo?position=backSide`}
                      onComplete={(e: any) => {
                        props.setFieldValue('backSideUrl', e.data.url);
                        toast.success('Upload successfully');
                      }}
                      config={{ multiple: false, accept: 'image/*' }}
                      previewImage={props.values.backSideUrl || '/images/default-avatar.png'}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            )}
            <Col md={12}>
              <Row>
                <Col md={12}>
                  <Label>
                    Photo of model holding the ID
                    {' '}
                    <span className="text-required">*</span>
                  </Label>
                </Col>
                <Col md={3}>
                  <Image
                    src={props.values.holdingUrl || '/images/default-avatar.png'}
                    style={{ borderRadius: 10 }}
                    fluid
                    width={250}
                    height={150}
                    onClick={() => window.open(props.values.holdingUrl, '_blank')}
                  />
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Upload
                      url={`${config.API_ENDPOINT}/users/${user._id}/certification/photo?position=holding`}
                      onComplete={(e: any) => {
                        props.setFieldValue('holdingUrl', e.data.url);
                        toast.success('Upload successfully');
                      }}
                      config={{ multiple: false, accept: 'image/*' }}
                      previewImage={props.values.holdingUrl || '/images/default-avatar.png'}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            <Col md={12}>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isConfirm"
                    onChange={props.handleChange}
                    checked={props.values.isConfirm}
                  />
                  Model will be posting sexually explicit / Update verification documents successfully!
                </Label>
              </FormGroup>
            </Col>

            <Col md={12}>
              <FormGroup check>
                <Label check>
                  <Input
                    type="checkbox"
                    name="isApproved"
                    onChange={props.handleChange}
                    checked={props.values.isApproved}
                  />
                  Approve Document?
                </Label>
              </FormGroup>
            </Col>
            <Col md={12}>
              <Button
                type="submit"
                color="primary"
                outline
                className="float-right"
                disabled={loading}
              >
                Submit
              </Button>
            </Col>
          </Row>
        </form>
      )}
    />
  );
};

export default UserVerificationForm;
