import * as Yup from 'yup';
import SendFile from './send-file';
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { useEffect, useState } from 'react';
import { Button, Form, FormControl, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { sendMessage } from 'src/redux/message/actions';
import { conversationService, mediaService, sellItemService } from 'src/services';
import { useTranslationContext } from 'context/TranslationContext';
import stringSimilarity from 'string-similarity';

interface IProps {
  selectedConversation: any;
  sendMessage: Function;
  authUser: any;
  blockConvStore: any;
  unBlockConvStore: any;
  haveBeenBlockStatus: boolean;
}

interface FormValues {
  message: string;
}


function ChatFooter({
  selectedConversation,
  sendMessage: sendMess,
  authUser,
  blockConvStore,
  unBlockConvStore,
  haveBeenBlockStatus
}: IProps) {
  const [sendFileBox, openSendFileBox] = useState(false);
  const {t, lang} = useTranslationContext()
  const [isBlocked, setIsBlocked] = useState(false);
  const [placeHolder, setPlaceHolder] = useState( lang === 'en' ? 'Enter message here...' : 'Bitte geben Sie Ihre Nachricht hier ein...');
  const [showDialog, setShowDialog] = useState(false);
  const [price, setPrice] = useState(0);
  const [isFree, setIsFree] = useState(true);
  const [userType, setUserType] = useState('');
  const [tokenPerMessage, setTokenPerMessage] = useState(0);

  const schema = Yup.object().shape({
    message: Yup.string().required( lang === 'en' ? 'Message is required.' : 'Nachricht erforderlich.')
  });

  const [recentMessage, setRecentMessage] = useState('');
const [messageSimilarityThreshold, setMessageSimilarityThreshold] = useState(0.8); // Similarity threshold (0-1)

// Function to save the recent message to localStorage and state
const saveRecentMessage = (message) => {
  setRecentMessage(message);
  localStorage.setItem('recentMessage', message); // Persist to localStorage
};

// Function to check similarity (using a basic string comparison for demonstration)
const isMessageSimilar = (message1, message2) => {
  const similarity = stringSimilarity.compareTwoStrings(message1, message2);
  return similarity > 0.8; // Adjust threshold as needed
};


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userType'));
    setUserType(user);
  }, []);

  useEffect(() => {
    // Anything in here is fired on component mount.
    document.addEventListener('mousedown', (e: any) => {
      if (document.getElementById('file-selector')?.contains(e.target)) {
        // Clicked in box
      } else {
        // Clicked outside the box
        openSendFileBox(false);
      }
    });

    return () => {
      // Anything in here is fired on component unmount.
      document.removeEventListener('mousedown', (e: any) => {
        if (document.getElementById('file-selector')?.contains(e.target)) {
          // Clicked in box
        } else {
          // Clicked outside the box
          openSendFileBox(false);
        }
      });
    };
  }, []);

  useEffect(() => {
    const receiver = selectedConversation.members.find((i) => i._id !== authUser._id);
    setTokenPerMessage(receiver?.tokenPerMessage)
    if (receiver.isBlocked || !receiver.isActive) {
      // user is deactivate
      setIsBlocked(true);
      setPlaceHolder( lang === 'en' ? 'This user is not available.' : 'Dieser Benutzer ist nicht verfügbar.');
    } else if (selectedConversation.blockedIds && selectedConversation.blockedIds.length > 0) {
      setIsBlocked(true);
      if (selectedConversation.blockedIds.findIndex((blockedId) => blockedId === authUser._id) > -1) {
        // auth user have been blocked
        setPlaceHolder( lang === 'en' ? 'You have been blocked.' : 'Du bist blockiert.');
      } else {
        // auth user is blocking receiver user
        setPlaceHolder( lang === 'en' ? 'You are blocking this user.' : 'Du hast diesen Benutzer blockiert.');
      }
    } else {
      setIsBlocked(false);
      setPlaceHolder( lang === 'en' ? 'Enter message here...' : 'Bitte geben Sie Ihre Nachricht hier ein...');
    }
  }, [selectedConversation, haveBeenBlockStatus, blockConvStore, unBlockConvStore]);

  const closeMedia = () => {
    setShowDialog(false);
    setPrice(0);
    setIsFree(true);
  }
  const handleSendMedia = async (dataFiles: any) => {
    if (dataFiles && dataFiles.length > 3) {
      return toast.error( lang === 'en' ? 'Cannot send more than 3 files at once.' : 'Kann nicht mehr als 3 Medien auf einmal senden');
    } 
    if (userType === 'model' && !isFree && price <= 0) {
      return toast.error('Please enter a price greater than 0.');
    }
    return Promise.all(
      dataFiles.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('systemType', 'message');
        if (file.type.indexOf('video') > -1) {
          return mediaService.uploadVideo(formData);
        } if (file.type.indexOf('image') > -1) {
          return mediaService.uploadPhoto(formData);
        }
        return null;
      })
    ).then((updatedFiles: any) => {
      const files = updatedFiles.map((item) => item?.data);
      const fileIds = files.map((file) => file._id);
      const data = {
        type: files[0]?.type,
        fileIds,
        conversationId: selectedConversation._id
        // socketId: socket.status === 'connected' ? socket.id : null
      };
      console.log(data, "conversation");
      sendMess(data);
      closeMedia()
      openSendFileBox(false);
      if(userType === 'model' && price > 0) {
        const sellMedia = sellItemService.createSellItem({
          mediaId: fileIds?.[0], folderId: fileIds?.[0],
          description: "chat_image", price: price ? price : 0,
          mediaType: "photo", name: "chat_image", isApproved: true
        });
      }
    });
  };
  const handleSendFile = async (files: any) => {
    if (files && files.length > 1) {
      return toast.error( lang === 'en' ? 'Cannot send more than one file at once.' : 'Kann nicht mehr als eine Datei auf einmal senden');
    }
    return Promise.all(
      files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('systemType', 'message');
        return mediaService.uploadFile(formData);
      })
    ).then((updatedFiles: any) => {
      const data = {
        type: updatedFiles[0]?.data?.type,
        fileIds: [updatedFiles[0]?.data?.id],
        conversationId: selectedConversation._id
        // socketId: socket.status === 'connected' ? socket.id : null
      };
      sendMess(data);
      openSendFileBox(false);
    });
  };

  const handleSendMessage = (message) => {
    if (/\S/.test(message)) {
      if (isMessageSimilar(message, recentMessage)) {
        toast.info('Try something different or a new message!');
      } else {
        // Proceed with sending the message
        const data = {
          text: message,
          conversationId: selectedConversation._id,
          type: 'text'
        };
        sendMess(data);
        saveRecentMessage(message); // Update recent message
      }
  
      if (authUser.type === 'user' || userType === 'user') {
        const data = {
          userId: authUser._id,
          tokenPerMessage: tokenPerMessage
        };
        conversationService.deductBalance(data);
      }
    }
  };
  


  return (
    <>
      {/* <!-- Chat Footer Start--> */}
      <div className="chat-footer">
        <div className="attachment">
          <div className={sendFileBox ? 'dropdown show' : 'dropdown'}>
            <button
              className="btn btn-add-content"
              type="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              onClick={() => !isBlocked && openSendFileBox(!sendFileBox)}
            >
              <svg className="hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <div
              id="file-selector"
              className={sendFileBox ? 'dropdown-menu show' : 'dropdown-menu'}
              style={
                sendFileBox
                  ? {
                    position: 'absolute',
                    transform: 'translate3d(0px, -92px, 0px)',
                    top: 0,
                    left: 0,
                    willChange: 'transform'
                  }
                  : {}
              }
            >
          {showDialog && <Modal
            dialogClassName="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-dialog-zoom mw-80"
            aria-labelledby="contained-modal-title-vcenter"
            className="modal modal-lg-fullscreen fade modal-uploader model-content-image"
            show={showDialog}
            onHide={() => closeMedia()}
          >
            <Modal.Header>
              <Modal.Title className="text-align-start media-name" data-toggle="tooltip" title={'Upload media'}>{'Upload media'}</Modal.Title>
              <Button className="fa fa-xmark" type="button" aria-label="Close" onClick={() => closeMedia()} />
            </Modal.Header>
            <Modal.Body className=" my-0 mx-auto">
            <div style={{width: '100%'}} className="row mt-2">
                    <Modal.Body>
                    <Form.Check
                      type="checkbox"
                      label="Is Free"
                      checked={isFree}
                      onChange={(e) => {
                        setIsFree(e.target.checked);
                        if (e.target.checked) {
                          setPrice(0); // Reset price to 0 if checkbox is checked
                        }
                      }}
                    />
                    <Form.Control
                      type="number"
                      placeholder="Enter price"
                      value={price}
                      disabled={isFree} // Disable if isFree is true
                      onChange={(e) => setPrice(parseFloat(e.target.value))}
                    />
                    <p></p>
                    </Modal.Body>
                          </div>
                          <hr />
                    <SendFile onDrop={handleSendMedia} type="media" /> 
                    <br /> <br />
                    <Button
                        type="submit"
                        variant="primary"
                        key="button-upload"
                        disabled={!price && isFree}
                        onClick={closeMedia}
                      >
                        Upload
                      </Button>
            </Modal.Body>
          </Modal>}
        {userType === 'model'?  <div style={{cursor: 'pointer'}} onClick={()=> setShowDialog(true)} className="row ml-4">
         <svg className="hw-20 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span> Gallery </span>
         </div> : <SendFile onDrop={handleSendMedia} type="media" />}
              <SendFile onDrop={handleSendFile} type="file" />
            </div>
          </div>
        </div>
        <Formik
          validationSchema={schema}
          initialValues={{ message: '' }}
          onSubmit={async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
            handleSendMessage(values.message);
            formikHelpers.setSubmitting(false);
            formikHelpers.resetForm();
          }}
        >
          {(props: FormikProps<FormValues>) => (
            <form onSubmit={props.handleSubmit}>
              <FormControl
                as="textarea"
                key="typeInput"
                value={props.values.message}
                type="text"
                name="message"
                id="message"
                placeholder={t?.messagePlaceHolder || placeHolder}
                disabled={isBlocked}
                onChange={props.handleChange}
              />
              <Button className="btn btn-primary btn-icon send-icon rounded-circle text-light mb-1" type="submit">
                <svg className="hw-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Button>
            </form>
          )}
        </Formik>

      </div>
      {/* <!-- Chat Footer End--> */}
    </>
  );
}

const mapStateToProps = (state: any) => ({
  authUser: state.auth.authUser,
  selectedConversation: state.conversation.selectedConversation,
  blockConvStore: state.conversation.blockConvStore,
  unBlockConvStore: state.conversation.unBlockConvStore,
  haveBeenBlockStatus: state.conversation.haveBeenBlockStatus,
  socket: state.socket
});
const mapDispatch = { sendMessage };
export default connect(mapStateToProps, mapDispatch)(ChatFooter) as any;
