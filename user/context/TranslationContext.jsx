// context/TranslationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDictionary } from 'getDictionary';
import { useRouter } from 'next/router';
import { usePathname } from "next/navigation";

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [t, setT] = useState(null)
  const [checkPaidMedia, setCheckPaidMedia] = useState(false)
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null)
  const [modelId, setModelId] = useState(null)
  const [onImageUploadSuccess, setOnImageUploadSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeStep, setActiveStep] = useState(currentUser ? 1 : 0);
    const router = useRouter();
  const local = getDictionary(router.locale).then(data => setT(data))
  const lang = router.locale
 
  useEffect(()=> {
    const userData = JSON.parse(localStorage.getItem('userRegisterationRecords'))
    if(userData) setCurrentUser(userData)
  }, [pathname])

  return (
    <TranslationContext.Provider value={{
      lang, t, modelId, setModelId, checkPaidMedia, setCheckPaidMedia, local, currentUser, setCurrentUser,
      onImageUploadSuccess, setOnImageUploadSuccess, currentStep, setCurrentStep, activeStep, setActiveStep
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  return useContext(TranslationContext);
};
