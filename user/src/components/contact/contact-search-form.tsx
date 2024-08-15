import { useTranslationContext } from 'context/TranslationContext';
import {
  FormikHelpers, FormikProvider, useFormik
} from 'formik';
import { forwardRef, useImperativeHandle } from 'react';
import { Button, FormControl } from 'react-bootstrap';
import * as Yup from 'yup';

interface FormValues {
  username: string;
}

interface IProps {
  onSubmit: Function;
}

type TMoreProps = {
  forwardedRef: any;
};

const schema = Yup.object().shape({
  username: Yup.string().notRequired()
});

function ContactSearchForm({
  onSubmit,
  forwardedRef
}: IProps & TMoreProps) {
  const formik = useFormik({
    validationSchema: schema,
    initialValues: { username: '' },
    onSubmit: async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
      formikHelpers.setSubmitting(false);
      onSubmit(values);
    }
  });

  useImperativeHandle(forwardedRef, () => ({
    resetForm: () => {
      formik.resetForm();
    }
  }));

  const {t, lang} = useTranslationContext();

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="form-inline">
        <div className="input-group">
          <FormControl
            key="typeInput"
            value={formik.values.username}
            type="text"
            className="form-control search border-right-0 transparent-bg pr-0"
            name="username"
            id="username"
            placeholder={lang === 'en' ? 'Search ...' : 'Modellname eingeben'}
            onChange={formik.handleChange.bind(this)}
          />
          <div className="input-group-append">
            <Button type="submit" className="input-group-text transparent-bg border-left-0">
              <svg className="text-muted hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </div>
        </div>
      </form>
    </FormikProvider>
  );
}

export default forwardRef<any, IProps>((props, ref) => <ContactSearchForm {...props} forwardedRef={ref} />);
