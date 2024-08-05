/* eslint-disable jsx-a11y/label-has-associated-control */
import { withAuth } from '@redux/withAuth';
import { sellItemService } from '@services/sell-item.service';
import {
  Field, Formik, FormikHelpers, FormikProps
} from 'formik';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { connect, ConnectedProps } from 'react-redux';
import { toast } from 'react-toastify';
import Upload from 'src/components/upload/Upload';
import * as Yup from 'yup';

interface FormValues {
  name: string;
  description: string;
  mediaType: string;
  // folderName: string;
}

const schema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'The name is too Short!')
    .max(50, 'The name is too Long!')
    .required('Name is Required'),
  description: Yup.string().required('Description is Required'),
  mediaType: Yup.string().required('Type is Required'),
});

const mapStates = (state: any) => ({
  authUser: state.auth.authUser
});

const connector = connect(mapStates);

type PropsFromRedux = ConnectedProps<typeof connector>;

function Blogs({ authUser }: PropsFromRedux) {
  const [fileUpload, setFileUpload] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const ENDPOINT: string = process.env.API_ENDPOINT || 'https://api.girls2dream.com/v1';
  // const { publicRuntimeConfig: config } = getConfig();
  const [mediaId, setMediaId] = useState('');
  const [url, setUrl] = useState(`${ENDPOINT}/media/photos`);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  const onCompleteFile = (resp) => {
    setMediaId(resp.data.id);
    setFileUpload(resp);
  };

    const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  const upload = async (formValues) => {
    if (!isChecked) {
      toast.error('Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      return;
    }
    try {
      setDisabled(true);
      await sellItemService.createBlogPost({
        ...formValues,
        mediaId,
      });
      toast.success('Medieninhalt wurde erfolgreich hochgeladen. Bitte warten Sie auf die Genehmigung durch den Administrator.');
      setTimeout(() => router.push(`/blogs/allblogs/${authUser?._id}`), 3000);
    } catch (e) {
      setDisabled(false);
      const err = await e;
      toast.error(err?.data?.msg || err?.data?.message || err?.message || 'Ihr Medieninhalt konnte nicht hochgeladen werden.');
    }
  };

  return (
    <div className="row mt-5">
      <div className="col-md-12">
        <div className="card mb-3">
          <Formik
            validationSchema={schema}
            onSubmit={(
              values: FormValues,
              formikHelpers: FormikHelpers<FormValues>
            ) => {
              upload(values);
              formikHelpers.setSubmitting(false);
              formikHelpers.resetForm();
            }}
            initialValues={{
              name: '',
              description: '',
              mediaType: 'photo',
            }}
          >
            {(props: FormikProps<FormValues>) => (
              <form onSubmit={props.handleSubmit}>
                <div className="card-body">
                  <div className="row">

                    <div className="col-md-6 col-12">
                      <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <FormControl
                          isInvalid={
                              props.touched.name && !!props.errors.name
                            }
                          type="text"
                          name="name"
                          id="name"
                          className="form-control form-control-md"
                          placeholder="Bitte geben Sie den Namen ein."
                          onChange={props.handleChange}
                          value={props.values.name}
                        />
                        <div className="invalid-feedback">
                          {props.errors.name}
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6 col-12">
                      <Form.Group>
                        <Form.Label>Beschreibung</Form.Label>
                        <FormControl
                          className="form-control"
                          isInvalid={
                              props.touched.description
                              && !!props.errors.description
                            }
                          type="text"
                          as="textarea"
                          rows={3}
                          name="description"
                          id="description"
                          placeholder="Beschreibung"
                          onChange={props.handleChange}
                          value={props.values.description}
                        />
                        <div className="invalid-feedback">
                          {props.errors.description}
                        </div>
                      </Form.Group>
                    </div>
                    <div className="col-md-6 col-12">
                      <Upload
                        key="upload"
                        url={url}
                        isChecked={isChecked}
                        onComplete={onCompleteFile}
                        onRemove={() => setFileUpload(null)}
                        config={{
                          multiple: false,
                          accept:
                              props.values.mediaType === 'photo'
                                ? 'image/*'
                                : 'video/mp4'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between">
                <div style={{ display: 'flex' , alignItems: 'center'}} className="flex">
                  <input style={{marginTop: '-9px'}} checked={isChecked}
                  onChange={handleCheckboxChange} className='' type="checkbox" name="confirm" id="confirm" />
                  <p className='ml-2 mt-1'>Ich akzeptiere</p>
                </div>
                  <Button
                    type="submit"
                    variant="primary"
                    key="button-upload"
                    disabled={!fileUpload || disabled}
                  >
                    Eingeben
                  </Button>
                </div>
              </form>
            )}
            
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default withAuth(connector(Blogs));