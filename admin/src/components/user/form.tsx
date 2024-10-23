import * as React from 'react';
import {
  Col, Row, Button, FormGroup, Label, Input, FormFeedback
} from 'reactstrap';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { omit } from 'lodash';
import getConfig from 'next/config';
import ShowPasswordIcon from '@layouts/show-password-icon';
import Upload from '../upload/Upload';

interface FormValue {
  username: string;
  email: string;
  role: string;
  type: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneNumber: string;
  address: string;
  password: string;
  avatar: string;
  avatar2?: string;
  avatarUrl: string;
  balance: number;
  isCompletedProfile: boolean;
  isBlocked: boolean;
  avatar2Url?: boolean;
  avatarStatus?: string; // Add avatarStatus here
}

interface IProps {
  submit: Function;
  data?: {
    username?: string;
    email?: string;
    role?: string;
    type?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    phoneNumber?: string;
    address?: string;
    password?: string;
    avatar?: string;
    avatar2?: string;
    avatarUrl?: string;
    balance?: number;
    avatar2Url?: boolean;
    isCompletedProfile?: boolean;
    isBlocked?: boolean;
    _id?: string;
  };
  me?: boolean;
  getCurrentRole: Function;
  loadingUpdate?: boolean;
  loadingCreate?: boolean;
}

const initialValuesForm = {
  username: '',
  email: '',
  role: 'user',
  type: 'user',
  isActive: true,
  emailVerified: true,
  isCompletedProfile: true,
  isBlocked: false,
  phoneNumber: '',
  address: '',
  password: '',
  avatar: '',
  avatarUrl: '',
  balance: 0,
  avatar2: '',
  avatar2Url: false,
  avatarStatus: 'pending' 

} as any;

const UserForm: React.FunctionComponent<IProps> = ({
  // eslint-disable-next-line react/require-default-props
  submit, data, me, getCurrentRole, loadingUpdate, loadingCreate
}) => {
  const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const [showPw, setShowPw] = React.useState(false);
  const initialValues = data?.email ? data : initialValuesForm;
  const { publicRuntimeConfig: config } = getConfig();
  const schema = Yup.object().shape({
    username: Yup.string()
      // .matches(/^[a-zA-Z0-9]*$/, {
      //   message: 'The username not whitespace',
      //   excludeEmptyString: true
      // })
      .min(3, 'The username length must be greater than 3')
      .required('Username is required'),
    email: Yup.string().matches(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, 'Email format is not right').required('Email is required'),
    role: Yup.string()
      .matches(/(user|admin)/, 'Role is not valid')
      .required(),
    type: Yup.string()
      .matches(/(user|model)/, 'Type is not valid')
      .required(),
    isActive: Yup.boolean(),
    emailVerified: Yup.boolean(),
    isCompletedProfile: Yup.boolean(),
    phoneNumber: Yup.string()
      .matches(/[0-9]/, 'The phone number is digits')
      .min(8, 'The phone number have 8 or 15 digits')
      .max(15, 'The phone number have 8 or 15 digits'),
    address: Yup.string(),
    password: Yup.string()
      .matches(
        validatePassword,
        'Das Passwort muss mindestens 8 Zeichen lang sein, mindestens 1 Zahl, 1 Großbuchstabe, 1 Kleinbuchstabe und 1 Sonderzeichen'
      ),
    avatarUrl: Yup.string(),
    avatar: Yup.string(),
    balance: Yup.number()
      .typeError('Amount must be a number')
      .min(0, 'Balance must be greater than or equal to 0!')
  });

  const onChangeType = (type: any, props: FormikProps<FormValue>) => {
    props.setFieldValue('type', type.currentTarget.value);
    if (type.currentTarget.value === 'model') {
      props.setFieldValue('balance', 0);
    }
  };

  const removePublicKeywordFromAvatar2 = data.avatar2 ? data.avatar2.replace('public/', '') : '';


  return (
    <Formik
      enableReinitialize
      validateOnChange
      validationSchema={schema}
      onSubmit={(values: FormValue) => {
        // eslint-disable-next-line no-param-reassign
        values.balance = Number(values.balance);

          // Check if the "Approve Avatar" checkbox is checked
    if (values.avatar2Url) {
      values.avatarStatus = 'verified'; // Set avatarStatus to 'verified' if checked
    }

        if (!initialValues.email && !values.password) {
          return toast.error('Bitte geben Sie das Passwort für den neuen Benutzer ein');
        }
        return submit(omit(values, ['avatarUrl']));
      }}
      initialValues={initialValues as any}
    >
      {(props: FormikProps<FormValue>) => (
        <form onSubmit={props.handleSubmit}>
          <Row form>
            <Col xs={12} md={6}>
              <FormGroup>
                <Label>
                  {props.values.role === 'admin' ? 'Admin' : 'Nutzer'}
                  {' '}
                  name
                </Label>
                <Input
                  invalid={props.touched.username && !!props.errors.username}
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Bitte geben Sie den Benutzernamen ein"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.username}
                />
                <FormFeedback>{props.errors.username}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs={12} md={6}>
              <FormGroup>
                <Label>Telefonnummer</Label>
                <Input
                  invalid={props.touched.phoneNumber && !!props.errors.phoneNumber}
                  type="text"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder="Bitte geben Sie die Telefonnummer ein"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.phoneNumber}
                />
                <FormFeedback>{props.errors.phoneNumber}</FormFeedback>
              </FormGroup>
            </Col>

            {!me && (
              <>
                <Col xs={12} md={6}>
                  <FormGroup>
                    <Label>Rolle</Label>
                    <Input
                      invalid={props.touched.role && !!props.errors.role}
                      type="select"
                      name="role"
                      id="role"
                      onChange={(e) => {
                        props.handleChange(e);
                        getCurrentRole(e);
                      }}
                      value={props.values.role}
                    >
                      <option value="user">Benutzer</option>
                      <option value="admin">ADMINISTRATOR</option>
                    </Input>
                  </FormGroup>
                </Col>
                {data?.type
                  ? (
                    <Col xs={12} md={6}>
                      <FormGroup>
                        <Label>Konto Typ</Label>
                        <Input
                          invalid={props.touched.type && !!props.errors.type}
                          type="text"
                          name="type"
                          id="type"
                          onChange={props.handleChange}
                          value={`${data?.type[0].toUpperCase()}${data?.type.slice(1)}`}
                          disabled
                        />
                      </FormGroup>
                    </Col>
                  ) : (
                    <Col xs={12} md={6}>
                      <FormGroup>
                        <Label>Typ</Label>
                        <Input
                          invalid={props.touched.type && !!props.errors.type}
                          type="select"
                          name="type"
                          id="type"
                          onChange={(e) => onChangeType(e, props)}
                          value={props.values.type}
                        >
                          <option value="user">Lüfter</option>
                          <option value="model">Modell</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  )}
              </>
            )}
            <Col xs={12} md={6}>
              <FormGroup>
                <Label>Adresse</Label>
                <Input
                  invalid={props.touched.address && !!props.errors.address}
                  type="text"
                  name="address"
                  id="address"
                  placeholder="Bitte geben Sie die Adresse ein"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.address}
                />
              </FormGroup>
            </Col>
            <Col xs={12} md={6}>
              <FormGroup>
                <Label>Email</Label>
                <Input
                  invalid={props.touched.email && !!props.errors.email}
                  type="text"
                  name="email"
                  id="email"
                  placeholder="Bitte geben Sie die E-Mail ein"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.email}
                />
                <FormFeedback>{props.errors.email}</FormFeedback>
              </FormGroup>
            </Col>
            <Col xs={12} md={6}>
              <FormGroup className="form-group">
                <Label>Passwort</Label>
                <Input
                  invalid={props.touched.password && !!props.errors.password}
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  id="password"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.password}
                />
                <ShowPasswordIcon
                  handleClick={setShowPw}
                  showPw={showPw}
                  error={props.errors.password}
                />
                <FormFeedback>{props.errors.password}</FormFeedback>
                <span className="text-muted">
                  <small>Leer, um aktuelles Passwort beizubehalten</small>
                </span>
              </FormGroup>
            </Col>

            <Col xs={12} md={6}>
              <FormGroup>
                <Label>Gleichgewicht</Label>
                <Input
                  invalid={props.touched.balance && !!props.errors.balance}
                  type="number"
                  min={0}
                  name="balance"
                  id="balance"
                  placeholder="Please enter the balance in token"
                  onChange={props.handleChange}
                  onBlur={props.handleBlur}
                  value={props.values.balance}
                  disabled={props.values.type === 'model'}
                />
                <FormFeedback>{props.errors.balance}</FormFeedback>
              </FormGroup>
            </Col>

            {data?._id && (
              <Col xs={12} md={4}>
                <FormGroup>
                  <Label>Avatar</Label>
                  <Upload
                    url={`${config.API_ENDPOINT}/users/${data._id}/avatar`}
                    config={{ multiple: false, accept: 'image/*' }}
                    // eslint-disable-next-line no-return-assign, no-param-reassign
                    onComplete={(e: any) => props.values.avatar = e.data.fileUrl}
                    // https://api.girls2dream.com/${data?.avatar2} this becomes --> https://api.girls2dream.com/public/avatar/YBTDH_800x800.png and i want to replace itwith https://api.girls2dream.com/avatar/YBTDH_800x800.png
                    previewImage={data?.avatar2 ? `https://api.girls2dream.com/${removePublicKeywordFromAvatar2}` :  data?.avatarUrl}
                  />
                </FormGroup>
              </Col>
            )}
            {!me && (
              <>
                <Col xs={12} md={12}>
                  <FormGroup check>
                    <Label check for="isBlocked">
                      <Input
                        invalid={props.touched.isBlocked && !!props.errors.isBlocked}
                        type="checkbox"
                        name="isBlocked"
                        id="isBlocked"
                        onChange={props.handleChange}
                        checked={props.values.isBlocked}
                        // disabled
                      />
                      {' '}
                      Vom Benutzer deaktiviert
                    </Label>
                  </FormGroup>
                </Col>
                <Col xs={12} md={12}>
                  <FormGroup check>
                    <Label check for="emailVerified">
                      <Input
                        invalid={props.touched.emailVerified && !!props.errors.emailVerified}
                        type="checkbox"
                        name="emailVerified"
                        id="emailVerified"
                        onChange={props.handleChange}
                        checked={props.values.emailVerified}
                      />
                      {' '}
                      Email überprüft
                    </Label>
                  </FormGroup>
                </Col>
                <Col xs={12} md={12}>
                  <FormGroup check>
                    <Label check for="isCompletedProfile">
                      <Input
                        invalid={props.touched.isCompletedProfile && !!props.errors.isCompletedProfile}
                        type="checkbox"
                        name="isCompletedProfile"
                        id="isCompletedProfile"
                        onChange={props.handleChange}
                        checked={props.values.isCompletedProfile}
                      />
                      {' '}
                      Abgeschlossenes Profil
                    </Label>
                  </FormGroup>
                </Col>
              {data.avatar2 &&  <Col xs={12} md={12}>
                  <FormGroup check>
                    <Label check for="avatar2Url">
                      <Input
                        invalid={props.touched.avatar2Url && !!props.errors.avatar2Url}
                        type="checkbox"
                        name="avatar2Url"
                        id="avatar2Url"
                        onChange={props.handleChange}
          checked={props.values.avatar2Url} // Properly bind the form value
                      />
                      {' '}
                      Approve Avatar
                    </Label>
                  </FormGroup>
                </Col>}
                <Col xs={12} md={12}>
                  <FormGroup check>
                    <Label check for="isActive">
                      <Input
                        invalid={props.touched.isActive && !!props.errors.isActive}
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        onChange={props.handleChange}
                        checked={props.values.isActive}
                      />
                      {' '}
                      Aktiv
                    </Label>
                  </FormGroup>
                </Col>
              </>
            )}
            <Col xs={12} md={12}>
              <Button
                type="submit"
                color="primary"
                outline
                className="float-right"
                disabled={loadingCreate || loadingUpdate}
              >
                EINREICHEN
              </Button>
            </Col>
          </Row>
        </form>
      )}
    </Formik>
  );
};

export default UserForm;
