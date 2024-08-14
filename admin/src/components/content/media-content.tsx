import React from 'react';
import { useState } from 'react';
import ImageBox from './image-box';

interface IProps {
  items: any;
  type: string;
  download?: boolean;
  sender?: {
    type: string;
  }
  messageLength?: number;
}

function MediaContent({ items, type, }: IProps) {
  const [activeImage, setActiveImage] = useState('');
  const [userType, setUserType] = useState('');
  const [mediaItems, setMediaItems] = useState(items);


  return (
    <>
      <div className="form-row">
        {mediaItems?.map((item) => (
          <div className="col m-auto" key={item?._id}>
            <a
              aria-hidden
              className="popup-media"
              onClick={() => {
                if (type === 'video') {
                  return;
                }
                setActiveImage(`${item?.fileUrl}`);
              }}
            > 
              <img alt="media_thumb" src={item?.thumbUrl} />
              {/* type = video */}
              {type === 'video' && (
              <video controls src={`${item?.fileUrl}`} width="100%" />
              )}
            </a>
          </div>
        ))}
      </div>

      <ImageBox image={activeImage} />
    </>
  );
}

export default MediaContent;
