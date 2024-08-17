import { useTranslationContext } from "context/TranslationContext";

interface IProps {
  contact: any;
}
function ContactContent({ contact }: IProps) {
  const address = () => {
    let addr = '';
    if (contact.address) {
      addr += contact.address;
    }
    if (contact.city) {
      if (addr.length > 0) addr += ', ';
      addr += contact.city;
    }
    if (contact.state) {
      if (addr.length > 0) addr += ', ';
      addr += contact.state;
    }
    if (contact.country) {
      if (addr.length > 0) addr += ', ';
      addr += contact.country;
    }

    return addr;
  };
  const {lang} = useTranslationContext()
  return (
    <div className="card">
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <div className="media align-items-center">
            <div className="media-body">
              <p className="small text-muted mb-0">{lang === 'en' ? 'Biography' : 'Biografie'}</p>
              <p className="mb-0">{contact?.bio}</p>
            </div>
            <svg
              className="text-muted hw-20"
              fill="currentColor"
              id="Layer_1"
              enableBackground="new 0 0 512 512"
              height="512"
              viewBox="0 0 512 512"
              width="512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path d="m256 512c-68.38 0-132.667-26.628-181.02-74.98s-74.98-112.64-74.98-181.02 26.628-132.667 74.98-181.02 112.64-74.98 181.02-74.98 132.667 26.628 181.02 74.98 74.98 112.64 74.98 181.02-26.628 132.667-74.98 181.02-112.64 74.98-181.02 74.98zm0-480c-123.514 0-224 100.486-224 224s100.486 224 224 224 224-100.486 224-224-100.486-224-224-224z" />
                <path d="m256 368c-8.836 0-16-7.164-16-16 0-40.386 15.727-78.354 44.285-106.912 17.872-17.873 27.715-41.635 27.715-66.911 0-27.668-22.509-50.177-50.177-50.177h-3.646c-27.668 0-50.177 22.509-50.177 50.177v5.823c0 8.836-7.164 16-16 16s-16-7.164-16-16v-5.823c0-45.313 36.864-82.177 82.177-82.177h3.646c45.313 0 82.177 36.864 82.177 82.177 0 33.823-13.171 65.622-37.088 89.539-22.514 22.513-34.912 52.446-34.912 84.284 0 8.836-7.164 16-16 16z" />
                <path d="m256.02 432c-8.836 0-16.005-7.164-16.005-16s7.158-16 15.995-16h.01c8.836 0 16 7.164 16 16s-7.164 16-16 16z" />
              </g>
            </svg>
          </div>
        </li>
        <li className="list-group-item">
          <div className="media align-items-center">
            <div className="media-body">
              <p className="small text-muted mb-0">{lang === 'en' ? 'Gender' : 'Geschlecht' }</p>
              <p className="mb-0">{contact?.gender}</p>
            </div>
            <svg
              className="text-muted hw-20"
              fill="currentColor"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 512 512"
              xmlSpace="preserve"
              enableBackground="new 0 0 512 512"
            >
              <g>
                <g>
                  <path
                    d="M403.921,0v31.347h35.36l-68.982,65.409c-24.421-24.99-58.474-40.53-96.092-40.53c-50.603,0-94.759,28.112-117.687,69.535
                                              c-1.964-0.086-3.938-0.138-5.924-0.138c-74.118,0-134.417,60.299-134.417,134.418c0,68.816,51.984,125.71,118.743,133.498v41.657
                                              H87.995v31.347h46.929V512h31.347v-45.458h48.977v-31.347h-48.977v-41.657c43.948-5.127,81.488-31.533,102.013-68.616
                                              c1.964,0.086,3.937,0.138,5.922,0.138c74.119,0,134.418-60.299,134.418-134.417c0-25.187-6.969-48.774-19.071-68.944
                                              l74.919-71.038v38.933h31.347V0H403.921z M150.598,363.11c-56.833,0-103.07-46.237-103.07-103.071
                                              c0-54.619,42.705-99.442,96.477-102.853c-2.751,10.7-4.215,21.91-4.215,33.457c0,60.464,40.132,111.726,95.157,128.562
                                              C216.281,345.738,185.432,363.11,150.598,363.11z M249.044,290.6c-44.709-11.26-77.906-51.802-77.906-99.957
                                              c0-10.636,1.62-20.901,4.625-30.561c44.709,11.26,77.906,51.803,77.906,99.958C253.669,270.676,252.048,280.94,249.044,290.6z
                                              M280.801,293.495c2.751-10.7,4.215-21.909,4.215-33.456c0-60.464-40.132-111.726-95.156-128.563
                                              c18.666-26.532,49.516-43.905,84.349-43.905c56.834,0,103.071,46.237,103.071,103.071
                                              C377.278,245.261,334.573,290.085,280.801,293.495z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </li>
        <li className="list-group-item">
          <div className="media align-items-center">
            <div className="media-body">
              <p className="small text-muted mb-0">{lang === 'en' ? 'Age' : 'Alter'}</p>
              <p className="mb-0">{contact?.age}</p>
            </div>
            <svg className="text-muted hw-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </li>
      </ul>
    </div>
  );
}

export default ContactContent;
