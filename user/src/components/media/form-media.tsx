/* eslint-disable jsx-a11y/label-has-associated-control */
import { Icon } from '@iconify/react';
import { authService } from '@services/auth.service';
import { sellItemService } from '@services/sell-item.service';
import axios from 'axios';
import { useTranslationContext } from 'context/TranslationContext';
import {
  Field, Formik, FormikHelpers, FormikProps
} from 'formik';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import ImageCroper from './ImageCroper';

interface FormValues {
  name: string;
  description: string;
  price: string;
  mediaType: string;
  free: boolean;
  // category: string;
  // folderName: string;
}


function FormMedia() {
  const [fileUpload, setFileUpload] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isContentChecked, setIsContentChecked] = useState(false);
  const ENDPOINT: string = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://api.girls2dream.com/v1';
  const { publicRuntimeConfig: config } = getConfig();
  // const [url, setUrl] = useState(`${config.API_ENDPOINT}/media/photos`); // used (`${config.API_ENDPOINT}/media/photos`) changed to process.env.NEXT_PUBLIC_API_SERVER_ENDPOINT
  const [url, setUrl] = useState(`https://api.girls2dream.com/v1/media/photos`);
  const [switchValue, setSwitchValue] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState('photo');
  const [folderError, setFolderError] = useState(false);
  const [previewFolderId, setPreviewFolderId] = useState('')
  const {lang} = useTranslationContext();

  const [files, setFiles] = useState([]);
  const ref = useRef(null);

  function handleInput() {
    if (ref.current) {
      ref.current.click();
    }
  }

  function handleImage(e) {
    const newFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }

  
  
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, lang === 'de' ? 'Der Name ist zu kurz' : 'The name is too Short!')
      .max(50, lang === 'de' ? 'Der Name ist zu lang' : 'The name is too Long!')
      .required( lang === 'de' ? 'Name ist erforderlich' : 'Name is Required'),
    price: Yup.number().min(0).required( lang === 'de' ? 'Preis ist erforderlich' : 'Price is Required'),
    description: Yup.string().required( lang === 'de' ? 'Beschreibung ist erforderlich' : 'Description is Required'),
    mediaType: Yup.string().required( lang === 'de' ? 'Typ ist erforderlich' : 'Type is Required'),
    free: Yup.boolean().required(),
    // category: Yup.string().required( lang === 'de' ? 'Kategorie ist erforderlich' : 'Category is Required'),
    // folderName: Yup.string().required('Folder Name is Required'),
  });

  const fetchFolders = async () => {
    const response = await sellItemService.getFolders();      
    setFolders(response?.folders);
  };

  const handleFolderChange = (e) => {
    const folderName = e.target.value;
    const folderExists = folders.some(folder => folder.name === folderName);
  
   setTimeout(() => {
    if (folderExists) {
      setFolderError(true);
      setNewFolderName('');
    }
   }, 3000);
  
    setNewFolderName(folderName);
    setFolderError(false);
  };

  useEffect(() => {
    fetchFolders();
  }, []);


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

    const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleCheckboxChange2 = () => {
    setIsContentChecked(!isContentChecked);
  };

  const upload = async (formValues) => {
    if (files.length < 3) {
      alert(lang === 'de' ? 'Maximal 3 Medien können hochgeladen werden.' : 'Maximal 3 Media können hochgeladen werden.');
      return;
    }
    if (!isContentChecked && !isChecked) {
      alert(lang === 'de' ? 'Bitte akzeptieren Sie die Nutzungsbedingungen' : 'Please accept the Terms and Conditions');
      return;
    }
  

    const folderResponse = await sellItemService.createFolder({ name: newFolderName });

    if (folderResponse?.folder) {
      setSelectedFolder(folderResponse?.folder._id);
    }
  
    const accessToken = authService.getToken();
    const formData = new FormData();
    formData.append('description', formValues?.description || 'Your Media Description');
    formData.append('price', formValues?.price || 0);
    formData.append('mediaType', selectedMediaType); // 'photo' or 'video'

    files.forEach((file) => {
      formData.append('files', file, file.name); // Dynamically handle media files
    });
  
    try {
      const response = await axios.post('https://api.girls2dream.com/v1/media/multiple-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        const mediaIds = response.data.data.map(media => media.id);
        mediaIds.push(previewFolderId)
        setDisabled(true);
        for (let mediaId of mediaIds) {
          await sellItemService.createSellItem({
            ...formValues,
            mediaId: mediaId,
            folderId: folderResponse?.folder._id || selectedFolder,
            // category: formValues.category,
          });
        }
  
        setFiles([]);
        toast.success(lang === 'en'
          ? 'Media content uploaded successfully. Await admin approval.'
          : 'Medieninhalt erfolgreich hochgeladen. Bitte auf die Genehmigung warten.');
        setTimeout(() => router.push('/profile/media-content'), 3000);
      }
    } catch (error) {
      console.error('Error uploading media:', error.message);
      alert('An error occurred while uploading the media.');
    }
  };
  
  

  return (
    <div className="row m-0">
      <div className="col-md-12">
      {/* <UploadImages /> */}

        <div className="card mb-3">
          <Formik
            validationSchema={schema}
            onSubmit={(
              values: FormValues,
              formikHelpers: FormikHelpers<FormValues>
            ) => {
              upload(values);
              // handleImageSubmit()
              formikHelpers.setSubmitting(false);
              // formikHelpers.resetForm();
            }}
            initialValues={{
              name: '',
              description: '',
              price: '0',
              mediaType: 'photo',
              free: false,
              // category: '',  // Initialized category
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
                          onChange={(e) => {onChangeType(e, props); setSelectedMediaType(e.currentTarget.value)} }
                        >
                          <option value="photo">{lang === 'de' ? 'Foto' : 'Photo'}</option>
                          <option value="video">Video</option>
                        </Field>
                      </Form.Group>
                    </div>
                    {/* <div className="col-md-12 col-12">
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
                    </div> */}
                     <div className="col-md-6 col-12">
                      <Form.Group>
                        <Form.Label>{lang === 'de' ? 'Ordnername' : 'Folder Name'}</Form.Label>
                        <FormControl
                          type="text"
                          name="name"
                          id="name"
                          className="form-control form-control-md"
                          placeholder={lang === 'de' ? 'Bitte geben Sie den Namen ein' : 'Please enter the name'}
                          onChange={handleFolderChange}
                          value={newFolderName}
                        />
                        <div className="invalid-feedback">
                          {props.errors.name}
                        </div>
                        {folderError ? <p className="text-danger">{lang === 'de' ? 'Ordner existiert bereits. Versuchen Sie es erneut' : 'Folder already exists. Try to create a new one.'}</p> : null} <br />

               
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
                    <main style={{ width: '100%', marginLeft: '4vw', marginTop: '4vw' }}>
                    <p style={{ fontSize: '1.3vw', maxWidth: '70vw', color: '#4b5563' }}>
                      {/* Please upload your media here */}
                      {`${selectedMediaType === 'photo' ? 'Please upload your photos here' : 'Please upload your videos here'}`}
                    </p>
                    <section style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div
                  onClick={handleInput}
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    borderRadius: '0.375rem',
                    width: '100%',
                    maxWidth: '22vw',
                    padding: '2vw',
                    display: 'flex',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Icon icon="clarity:upload-cloud-line" style={{ color: '#374151', fontSize: '7vw' }} />
                  <input type="file" ref={ref} hidden onChange={handleImage} multiple />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem' }}>
                  {files.map((file, index) => (
                    <figure key={index} style={{ position: 'relative', borderRadius: '0.375rem' }}>
                      <Icon
                        icon="clarity:close-line"
                        style={{ position: 'absolute', top: 0, right: 0, fontSize: '1.8vw', cursor: 'pointer', background: '#ff337c', borderRadius: '0.4vw' }}
                        onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      />
                      {file.type.startsWith('image') ? (
                        <img src={URL.createObjectURL(file)} alt={`Image ${index + 1}`} style={{ objectFit: 'cover', width: '15vw', height: '15vw', borderRadius: '0.3vw' }} />
                      ) : (
                        <video src={URL.createObjectURL(file)} controls style={{ width: '15vw', height: '15vw' }} />
                      )}
                    </figure>
                  ))}
                </div>
              </section>

                  </main>
                  </div>
                 { selectedMediaType === 'photo' && <div style={{marginTop: '3vw', width: '28%',}} className="">
                  <p style={{ fontSize: '1.1vw', maxWidth: '70vw', color: '#4b5563' }}>
                      {/* Please upload your media here */}
                      {`${selectedMediaType === 'photo' ? 'Please upload your main preview image here' : ''}`}
                    </p>
                    <ImageCroper meidaID={(id)=> setPreviewFolderId(id)} />
                  </div>}
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
                    disabled={!isChecked && !isContentChecked}
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
