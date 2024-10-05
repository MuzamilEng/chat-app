import ImageCroper from '@components/image-crop'
import { useTranslationContext } from 'context/TranslationContext'
import React, { useEffect } from 'react'
import { Button } from 'react-bootstrap'

function ImageCrop() {
  const {lang, } = useTranslationContext()


  return (
     <div className="col-md-6 col-12 xchat-bg-color">
          <div className="xchat-content">
          <h3 className="text-uppercase">{lang === 'en' ? 'Profile Picture' : 'Profilbild'}</h3>
          <h6 style={{ color: '#ff337c', fontWeight: 'semibold' }} className="mt-4">{lang === 'en' ? 'Upload an appealing profile picture' : 'Lade ein passendes Profilbild hoch'}</h6>
              <p style={{ marginTop: '10px' }}>
                {lang === 'en'
                  ? `Your profile picture must not be an erotic motif or picture. You have to be fully clothed and recognizable as a person and ( no pure body parts and close ups permitted ) IMPORTANT: Images from the Internet are forbidden! Only real images / photos of your own person are permitted! Not fakes!`
                  : 'Benutzerprofilbilder koennen nur als Erkennungsbild vom Internet nicht als Erkennungsbild ausgewiesen werden!'}
              </p>
            <ImageCroper />
            <p style={{ marginTop: '10px' }}>
                {lang === 'en'
                  ? 'To upload a picture, drag and drop it into the white area or click the “upload” button to manually select a file'
                  : 'Um ein Bild hochzuladen, ziehen Sie es in die weiße Fläche und klicken Sie auf “hochladen” um das Bild manuell auszuwaehlen.'}
              </p>
              <p style={{ marginTop: '10px' }}>
                {lang === 'en'
                  ? `Don’t want to show your face? Not a problem!
                    There are many attractive ways to create and show your profile picture. Example you could wear a mask, sunglasses or a hat to hide your face or simply show yourself from a side angle and pose without a recognizable face. `
                  : 'Um ein Bild hochzuladen, ziehen Sie es in die weiße Fläche und klicken Sie auf “hochladen” um das Bild manuell auszuwaehlen.'}
              </p>
          <Button type="submit" className="btn btn-primary" style={{marginTop: '2vw'}} color="primary">
              {lang === 'en' ? 'submit' : 'einreichen'}
            </Button>
          </div>
          </div>
  )
}

export default ImageCrop