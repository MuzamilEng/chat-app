import ImageCroper from '@components/image-crop'
import { useTranslationContext } from 'context/TranslationContext'
import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'

function ImageCrop({onImageSuccess}) {
  const {lang, onImageUploadSuccess, setCurrentStep} = useTranslationContext()
   
  useEffect(() => {
    if (onImageUploadSuccess === true) {
      onImageSuccess(true);
    }
  }, [onImageUploadSuccess]);

  return (
     <div className="col-md-6 col-12 xchat-bg-color">
          <div className="xchat-content">
          <h3 className="text-uppercase">{lang === 'en' ? 'Profile Picture' : 'Profilbild'}</h3>
          <h6 style={{ color: '#ff337c', fontWeight: 'semibold' }} className="mt-4">{lang === 'en' ? 'Upload an appealing profile picture' : 'Lade ein passendes Profilbild hoch'}</h6>
              <p style={{ marginTop: '10px' }}>
                {lang === 'en'
                  ? 'Choose the image that is most appealing to you. It will be used as your profile picture on the site, and will be visible to others on the site.'
                  : 'Wählen Sie das Bild, das Ihnen am meisten passt. Es wird als Profilbild auf der Seite verwendet und wird von anderen auf der Seite angezeigt.'}
              </p>
            <ImageCroper />
            <p style={{ marginTop: '10px' }}>
                {lang === 'en'
                  ? 'click on the avatar to change your profile picture'
                  : 'klicken Sie auf den Avatar, um Ihr Profilbild zu ändern'}
              </p>
          <Button type="submit" className="btn btn-primary" style={{marginTop: '2vw'}} color="primary">
              {lang === 'en' ? 'submit' : 'einreichen'}
            </Button>
          </div>
          </div>
  )
}

export default ImageCrop