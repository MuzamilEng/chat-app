import { authService } from '@services/auth.service'
import { useTranslationContext } from 'context/TranslationContext'
import React, { useEffect } from 'react'
import { Button, Form, FormControl } from 'react-bootstrap'
import { toast } from 'react-toastify'

function NickName({onNicknameSuccess}) {
    const {lang, currentUser} = useTranslationContext()
    const [nickname, setNickname] = React.useState('')
    const [error, setError] = React.useState('')
    const [emailStatus, setEmailStatus] = React.useState(null)

    const checkEmailStatus = async ()=> {
      try {
        const resp = await authService.checkEmail({email: currentUser?.email})
      if(resp) {
        setEmailStatus(resp?.data?.user?.emailVerified)
      }
      } catch (error) {
        console.warn(error)
      }
    }
  

    const handleSubmit = async (e) => {
      e.preventDefault()
      try {
        const result = await authService.updateNickname({
          nickname,
          userId: currentUser?._id
        })
        const userFromLocal = JSON.parse(sessionStorage.getItem('userRegisterationRecords'))
        if(result){
          toast.success(lang === 'en' ? 'Nickname updated successfully' : 'Benutzername wurde erfolgreich geändert')
          onNicknameSuccess(true)
          userFromLocal.nickname = nickname
          sessionStorage.setItem('userRegisterationRecords', JSON.stringify(userFromLocal))
          // setActiveStep(2)
        }
      } catch (error) {
        // setError(error.message)
        toast.error(lang === 'en' ? 'Nickname already taken, please choose another one' : 'Benutzername bereits vergeben, bitte einen anderen auswählen')
        setError('')
      }
    }

    useEffect(()=> {
      const userFromLocal = JSON.parse(sessionStorage.getItem('userRegisterationRecords'))
      setNickname(userFromLocal?.nickname)
    }, [currentUser])

    useEffect(() => {
      checkEmailStatus()
    }, [])


  return (
       <section className="col-md-6 col-12 xchat-bg-color">
            <form onSubmit={handleSubmit} style={{ width: '100%', height: '100%', padding: '30px' }}>
              {emailStatus === false && <p style={{color: 'red', textAlign: 'center', fontSize: '1.3vw'}}>{lang === 'en' ? 'Please go to your Email account and verify your Email to Continue' : 'Bitte gehe zu deinem E-Mail-Konto und bestätige deinen E-Mail, um fortzufahren'}</p>}
              <h4>{lang === 'en' ? 'Nickname' : 'Nutzername'}</h4>
              <h5 style={{ color: '#ff337c' }} className="mt-3">
                {lang === 'en' ? 'Choose your nickname' : 'Waehle deinen Usernamen'}
              </h5>
              <div className="flex align-items-start mt-2">
                <p style={{ fontWeight: 'semibold', marginRight: '10px', marginTop: '0.3vw' }}>
                  {lang === 'en' ? 'My nickname is' : 'Mein Benutzername ist'}
                </p>
                <Form.Group className="form-group">
                  <FormControl
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                    name="nickname"
                    required
                    // pattern="[A-Za-z0-9]{3,15}"
                    title={lang === 'en'? 'Nickname must be between 3 and 8 characters and can contain letters and numbers' : 'Benutzername muss zwischen 3 und 8 Zeichen lang sein kann nur Buchstaben und Zahlen enthalten'}
                    className="form-control"
                    type="text"
                    id="nickname"
                    placeholder={lang === 'en' ? 'Choose your nickname' : 'Wähle deinen Benutzernamen'}
                  />
                </Form.Group>
                {error && <p style={{color: 'red', marginTop: '0.3vw'}}> {error}</p>}
              </div>
              <h6 style={{ color: '#ff337c', fontWeight: 'semibold' }} className="mt-4">{lang === 'en' ? 'Tips to choose a nickname' : 'Tipps zur Auswahl eines Benutzernamens'}</h6>
              <p style={{ marginTop: '10px' }}>
                {lang === 'en'
                  ? 'Choose a nickname that reflects your personality. It can be a combination of your interests, hobbies, or something unique to you. Remember, this nickname will be visible to others on the site, while your original name will be kept private.'
                  : 'Wählen Sie einen Benutzernamen, der Ihre Persönlichkeit widerspiegelt. Es kann eine Kombination aus Ihren Interessen, Hobbys oder etwas Einzigartigem für Sie sein. Denken Sie daran, dass dieser Benutzername für andere auf der Seite sichtbar ist, während Ihr richtiger Name privat bleibt.'}
              </p>
          <Button disabled={emailStatus === false} type="submit" className="btn btn-primary" style={{marginTop: '2vw'}} color="primary">
          {/* <Button type="submit" className="btn btn-primary" style={{marginTop: '2vw'}} color="primary"> */}
              {lang === 'en' ? 'submit' : 'einreichen'}
            </Button>
            </form>

            </section>
  )
}

export default NickName