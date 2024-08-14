// context/TranslationContext.js
import React, { createContext, useContext, useState } from 'react';
import { getDictionary } from 'getDictionary';
import { useRouter } from 'next/router';

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [t, setT] = useState(null)
  const [checkPaidMedia, setCheckPaidMedia] = useState(false)
  const [modelId, setModelId] = useState(null)
    const router = useRouter();
  const local = getDictionary(router.locale).then(data => setT(data))
  const lang = router.locale
  return (
    <TranslationContext.Provider value={{
      lang, t, modelId, setModelId, checkPaidMedia, setCheckPaidMedia, local
    }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  return useContext(TranslationContext);
};
