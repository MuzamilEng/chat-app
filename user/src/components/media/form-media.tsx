/* eslint-disable jsx-a11y/label-has-associated-control */
import { sellItemService } from '@services/sell-item.service';
import { useTranslationContext } from 'context/TranslationContext';
import {
  Field, Formik, FormikHelpers, FormikProps
} from 'formik';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Upload from 'src/components/upload/Upload';
import * as Yup from 'yup';

interface FormValues {
  name: string;
  description: string;
  price: string;
  mediaType: string;
  free: boolean;
  category: string;
  // folderName: string;
}


function FormMedia() {
  const [fileUpload, setFileUpload] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isContentChecked, setIsContentChecked] = useState(false);
  const ENDPOINT: string = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.girls2dream.com/v1';
  const { publicRuntimeConfig: config } = getConfig();
  const [mediaId, setMediaId] = useState('');
  // const [url, setUrl] = useState(`${config.API_ENDPOINT}/media/photos`); // used (`${config.API_ENDPOINT}/media/photos`) changed to process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT
  const [url, setUrl] = useState(`https://api.girls2dream.com/v1/media/photos`);
  const [switchValue, setSwitchValue] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const {lang} = useTranslationContext();
  
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, lang === 'de' ? 'Der Name ist zu kurz' : 'The name is too Short!')
      .max(50, lang === 'de' ? 'Der Name ist zu lang' : 'The name is too Long!')
      .required( lang === 'de' ? 'Name ist erforderlich' : 'Name is Required'),
    price: Yup.number().min(0).required( lang === 'de' ? 'Preis ist erforderlich' : 'Price is Required'),
    description: Yup.string().required( lang === 'de' ? 'Beschreibung ist erforderlich' : 'Description is Required'),
    mediaType: Yup.string().required( lang === 'de' ? 'Typ ist erforderlich' : 'Type is Required'),
    free: Yup.boolean().required(),
    category: Yup.string().required( lang === 'de' ? 'Kategorie ist erforderlich' : 'Category is Required'),
    // folderName: Yup.string().required('Folder Name is Required'),
  });

  const fetchFolders = async () => {
    const response = await sellItemService.getFolders();      
    setFolders(response?.folders);
  };

  useEffect(() => {
    fetchFolders();
  }, [folders.length]);

  const createFolder = async () => {
    const folderExists = folders.some(folder => folder.name === newFolderName);
    if (folderExists) {
      alert( lang === 'de' ? 'Ordner existiert bereits. Versuchen Sie es erneut' : 'Folder already exists. Try to create a new one.');
      return;
    }
    const response = await sellItemService.createFolder({ name: newFolderName });
    setFolders([...folders, response?.data?.folder]);
    setNewFolderName('');
  };

  const onChangeType = (type: any, props: FormikProps<FormValues>) => {
    props.setFieldValue('mediaType', type.currentTarget.value);
    props.setFieldValue('name', '');
    props.setFieldValue('description', '');
    props.setFieldValue('price', '0');
    props.setFieldValue('free', false);
    setFileUpload(null);
    setUrl(`https://api.girls2dream.com/v1/media/${type.currentTarget.value}s`);
  };

  const onCheck = (e: any, props: FormikProps<FormValues>) => {
    props.setFieldValue('free', e.currentTarget.checked);
    props.setFieldValue('price', 0);
  };

  const toggleSwitch = (value) => {
    setSwitchValue(value.target.checked);
  };

  const onCompleteFile = (resp) => {
    setMediaId(resp.data.id);
    setFileUpload(resp);
  };

    const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleCheckboxChange2 = () => {
    setIsContentChecked(!isContentChecked);
  };

  const upload = async (formValues) => {
    if (!isChecked) {
      toast.error( lang === 'en' ? 'Please check the checkbox to continue.' : 'Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      return;
    }
    if (!isContentChecked) {
      toast.error( lang === 'en' ? 'Please check the 2nd checkbox to continue.' : 'Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      return;
    }
    if(formValues.category === '') {
      toast.error( lang === 'en' ? 'Please select a category.' : 'Bitte wählen Sie einen Kategorie aus.');
      return;
    }
    if(!selectedFolder){
      toast.error( lang === 'en' ? 'Please select a folder.' : 'Bitte wählen Sie einen Ordner aus.');
      return;
    }
    try {
      setDisabled(true);
      await sellItemService.createSellItem({
        ...formValues,
        mediaId, folderId: selectedFolder, category: formValues.category
      });
      toast.success( lang === 'en' ? 'Media content has been successfully uploaded. Please wait for approval by the administrator.' : 'Medieninhalt wurde erfolgreich hochgeladen. Bitte warten Sie auf die Genehmigung durch den Administrator.');
      setTimeout(() => router.push('/profile/media-content'), 3000);
    } catch (e) {
      setDisabled(false);
      const err = await e;
      toast.error(err?.data?.msg || err?.data?.message || err?.message || lang === 'en' ? 'Media content could not be uploaded.' : 'Ihr Medieninhalt konnte nicht hochgeladen werden.');
    }
  };

  return (
    <div className="row m-0">
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
              price: '0',
              mediaType: 'photo',
              free: false,
              category: '',  // Initialized category
            }}
          >
            {(props: FormikProps<FormValues>) => (
              <form onSubmit={props.handleSubmit}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-12 col-12">
                      <Form.Group>
                        <Form.Label>{lang === 'de' ? 'Wählen Sie den Typ aus.' : 'Please select the type.'} </Form.Label>
                        <Field
                          className="form-control form-control-md"
                          name="mediaType"
                          component="select"
                          value={props.values.mediaType}
                          onChange={(e) => onChangeType(e, props)}
                        >
                          <option value="photo">{lang === 'de' ? 'Foto' : 'Photo'}</option>
                          <option value="video">Video</option>
                        </Field>
                      </Form.Group>
                    </div>
                    <div className="col-md-12 col-12">
                      <Form.Group>
                        <Form.Label>{lang === 'de' ? 'Wählen Sie den Ordner aus.' : 'Please select category.'} </Form.Label>
                        <Field
                          className="form-control form-control-md"
                          name="category"
                          component="select"
                          value={props.values.category}
                          onChange={props.handleChange}
                        >
                          <option  value="">{lang === 'de' ? 'Bitte waehlen Sie' : 'select category'}</option>
                          <option value="FSK12">{lang === 'de' ? 'FSK12' : 'FSK12'}</option>
                          <option value="FSK16">{lang === 'de' ? 'FSK16' : 'FSK16'}</option>
                          <option value="FSK18">{lang === 'de' ? 'FSK18' : 'FSK18'}</option>
                        </Field>
                        <div className="invalid-feedback">
                        {props.errors.category && props.touched.category ? props.errors.category : null}
                      </div>
                      </Form.Group>
                    </div>
                     <div className="col-md-6 col-12">
                      <Form.Group>
                        <Form.Label>{lang === 'de' ? 'Ordnername' : 'Folder Name'}</Form.Label>
                        <FormControl
                          type="text"
                          name="name"
                          id="name"
                          className="form-control form-control-md"
                          placeholder={lang === 'de' ? 'Bitte geben Sie den Namen ein' : 'Please enter the name'}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          value={newFolderName}
                        />
                        <div className="invalid-feedback">
                          {props.errors.name}
                        </div>
                    <Button
                    type="submit"
                    variant="primary"
                    key="button-upload"
                    disabled={!fileUpload || disabled}
                    onClick={createFolder}>
                    {lang === 'de' ? 'Ordner erstellen' : 'Create Folder'}
                  </Button>
                      </Form.Group>
                    </div>
              <div >
              <Form.Group>
                        <Form.Label>{lang === 'de' ? 'Ordner auswählen' : 'Select Folder'}</Form.Label>
                        <Field
                          className="form-control form-control-md"
                          name="mediaType"
                          component="select"
                          value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}
                        >
                          <option value="">Select Folder</option>
                      {folders?.map((folder) => (
                        <option key={folder?._id} value={folder?._id}>{folder?.name}</option>
                      ))}
                        </Field>
                      </Form.Group>
                    </div>

                    <div className="col-12 mt-4">
                      <Form.Group>
                        <div className=" custom-control custom-switch">
                          <input
                            type="checkbox"
                            name="internal"
                            className="custom-control-input"
                            id="customSwitch1"
                            onClick={(e) => onCheck(e, props)}
                            onChange={toggleSwitch}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor="customSwitch1"
                          />
                          {switchValue ? 'Free' : 'Paid'}
                        </div>
                      </Form.Group>
                    </div>

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
                          placeholder={lang === 'de' ? 'Bitte geben Sie den Namen ein' : 'Please enter the name'}
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
                        <Form.Label>Token</Form.Label>
                        <FormControl
                          disabled={props.values.free}
                          className="form-control form-control-md"
                          isInvalid={
                              props.touched.price && !!props.errors.price
                            }
                          type="number"
                          min={1}
                          step={1}
                          name="price"
                          id="price"
                          placeholder="Bitte geben Sie den Preis ein."
                          onChange={props.handleChange}
                          value={props.values.price}
                        />
                        <div className="invalid-feedback">
                          {props.errors.price}
                        </div>
                      </Form.Group>
                    </div>

                    <div className="col-md-6 col-12">
                      <Form.Group>
                        <Form.Label>{lang === 'de' ? 'Beschreibung' : 'Description'}</Form.Label>
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
                          placeholder={lang === 'de' ? 'Bitte geben Sie eine Beschreibung ein.' : 'Please enter a description.'}
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
                <div className="card-footer d-flex justify-content-between align-items-center">
                <section>
                <div style={{ display: 'flex' , alignItems: 'center'}} className="flex">
                  <input style={{marginTop: '-9px'}} checked={isChecked}
                  onChange={handleCheckboxChange} className='' type="checkbox" name="confirm" id="confirm" />
                  <p className='ml-2 mt-1'>{lang === 'de' ? 'Ich bin einverstanden' : 'I consent to upload sexual content and I understand that uploaded content is reviewed before publication .'}</p>
                </div>
                <div style={{ display: 'flex' , alignItems: 'start'}} className="flex">
                  <input style={{marginTop: '0.4vw'}} checked={isContentChecked}
                  onChange={handleCheckboxChange2} className='' type="checkbox" name="confirm" id="confirm" />
                  <p style={{width: '100%', maxWidth: '50vw'}} className='ml-2 mt-1'>{lang === 'de' ? 'Ich bin einverstanden' : 'Use of Your Comments, Photos, Videos and Digital Media: In accordance to our gerneral terms and conditons and by submitting and/or uploading data and files such as but not limited to; your story, comments, photos, videos, digital content of any means ( “Your Content” ) on our wall, website and domains, you are authorizing PMS to use, publish, and otherwise reproduce, modify, distribute and grant unlimited downloads to other users and members of Your Content with or without your name in perpetuity, worldwide in any and all PMS related media for any lawful purpose'}</p>
                </div>
                </section>
                  <Button style={{ height: '2vw'}}
                    type="submit"
                    variant="primary"
                    key="button-upload"
                    disabled={!fileUpload || disabled}
                  >
                    {lang === 'de' ? 'Eingeben' : 'Submit'}
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

export default FormMedia;
