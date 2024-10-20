import * as React from 'react';
import {
  Col, Row, Button, FormGroup, Label, Input, FormFeedback
} from 'reactstrap';
import * as Yup from 'yup';
import { Field, Formik, FormikProps } from 'formik';
import { Form } from 'react-bootstrap';

interface IProps {
  data: {
    price?: number;
    free?: boolean;
    name?: string;
    media?: any;
    model?: any;
    isApproved?: boolean;
    mediaType?: string;
    description?: string;
    category?: string;
  };
  submit: Function;
  loadingUpdate: boolean;
}

interface FormValue {
  price?: number;
  free?: boolean;
  name?: string;
  modelName?: string;
  isApproved?: boolean;
  category?: string;
}

const initData = {
  price: 0,
  free: false,
  isApproved: false,
  mediaType: 'photo',
  mediaId: '',
  media: {},
  model: {},
  description: '',
  category: ''
};

const SellItemDetail: React.FunctionComponent<IProps> = ({ data, submit, loadingUpdate }) => {
  const {
    price, free, isApproved, mediaType, media, model, description, category
  } = data || initData;
  const initialValues = {
    price,
    free,
    isApproved,
    name: data.name || '',
    category: category || ''
  };

  const schema = Yup.object().shape({
    name: Yup.string().required('Please enter item name'),
    free: Yup.boolean(),
    isApproved: Yup.boolean(),
    price: Yup.number().min(0),
    category: Yup.string().optional()
  });

  const onCheck = (e: any, props: FormikProps<FormValue>) => {
    props.setFieldValue('free', e.currentTarget.checked);
    props.setFieldValue('price', 0);
  };

  return (
    <Formik
      validationSchema={schema}
      onSubmit={(values: FormValue) => {
        Object.assign(values, { description });
        const updatedValues = { ...values, description };
        submit(updatedValues); // Pass the values to the submit function
        // submit(values);
      }}
      initialValues={initialValues}
      render={(props: FormikProps<FormValue>) => (
        <form onSubmit={props.handleSubmit}>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label>Name</Label>
                <Input
                  invalid={props.touched.name && !!props.errors.name}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Please enter the media name"
                  onChange={props.handleChange}
                  defaultValue={props.values.name}
                />
                <FormFeedback>{props.errors.name}</FormFeedback>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Price</Label>
                <Input
                  disabled={props.values.free}
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  onChange={props.handleChange}
                  value={props.values.price}
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label>Model</Label>
                <Input type="text" name="modelName" id="modelName" defaultValue={model?.username || 'No name'} />
              </FormGroup>
            </Col>
            <Col md={6}>
                      <Form.Group>
                        <Form.Label>{'Please select category.'} </Form.Label>
                        <Field
                          className="form-control form-control-md"
                          name="category"
                          as="select" // Use as="select" for correct rendering
                          value={props.values.category} // Make sure the value is tied to Formik
                          onChange={props.handleChange}
                        >
                          <option  value="">{'select category'}</option>
                          <option value="FSK12">{'FSK12'}</option>
                          <option value="FSK16">{'FSK16'}</option>
                          <option value="FSK18">{'FSK18'}</option>
                        </Field>
                        <div className="invalid-feedback">
                        {props.errors.category && props.touched.category ? props.errors.category : null}
                      </div>
                      </Form.Group>
                    </Col>
            <Col md={6}>
              <FormGroup>
                {mediaType === 'photo' ? (
                  <>
                    <Label>Photo</Label>
                    <br />
                    <img
                      alt="media_photo"
                      src={media?.thumbUrl || '/images/default_thumbnail_photo.jpg'}
                      style={{
                        width: '50%',
                        alignContent: 'center',
                        display: 'flex',
                        margin: '0 auto'
                      }}
                    />
                  </>
                ) : (
                  <>
                    <Label>Video</Label>
                    <br />
                    <video
                      controls
                      src={`${media?.fileUrl}` || '/images/default_thumbnail_video.png'}
                      style={{ width: '100%', maxHeight: '500px', background: 'grey' }}
                    />
                  </>
                )}
              </FormGroup>
            </Col>
          </Row>
            <Col md={6}>
              <FormGroup check>
                <Label check for="free">
                  <Input
                    type="checkbox"
                    name="free"
                    id="free"
                    onChange={(e) => onCheck(e, props)}
                    checked={props.values.free}
                  />
                  {' '}
                  Free
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check for="isApproved">
                  <Input
                    type="checkbox"
                    name="isApproved"
                    id="isApproved"
                    onChange={props.handleChange}
                    checked={props.values.isApproved}
                  />
                  {' '}
                  Approve
                </Label>
              </FormGroup>
            </Col>

          <Button type="submit" color="primary" outline disabled={loadingUpdate}>
            Submit
          </Button>
        </form>
      )}
    />
  );
};

export default SellItemDetail;
