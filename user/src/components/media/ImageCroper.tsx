// import React, { useRef, useState } from "react";
// import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";
// import { Modal, Button, Box, Avatar } from "@mui/material";
// import { toast } from 'react-toastify';
// import { authService } from "@services/auth.service";
// import { useTranslationContext } from "context/TranslationContext";
// import setCanvasPreview from "@components/image-crop/canvas";

// const ImageCroper = ({meidaID }) => {
//   const imgRef = useRef<HTMLImageElement>(null);
//   const previewCanvasRef = useRef<HTMLCanvasElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [crop, setCrop] = useState<any>(null);
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const {setOnImageUploadSuccess, currentUser} = useTranslationContext()

//   const [croppedImage, setCroppedImage] = useState<string | null>( null);

//   const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
  
//     const reader = new FileReader();
//     reader.addEventListener("load", () => {
//       const imageElement = new Image();
//       const imageUrl = reader.result?.toString() || "";
  
//       imageElement.src = imageUrl;
  
//       imageElement.addEventListener("load", (e) => {
//         const target = e.currentTarget as HTMLImageElement;
//         const { naturalWidth, naturalHeight } = target;
        
//         // Check if image resolution is at least 1080 x 1080 pixels
//         if (naturalWidth < 1080 || naturalHeight < 1080) {
//           alert("Image dimensions should be at least 1080x1080 pixels.");
//           setImageSrc(null);  // Reset the image source
//           return;
//         }
  
//         setImageSrc(imageUrl);
//         setModalOpen(true); // Open the modal to crop
//       });
//     });
  
//     reader.readAsDataURL(file);
//   };
  

//   const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
//     const { height, width } = e.currentTarget;
//     const cropWidth = (150 / width) * 100;
//     const crop = makeAspectCrop(
//       {
//         unit: "%",
//         width: cropWidth,
//       },
//       1,
//       height,
//       width
//     );
//     const centerCropImage = centerCrop(crop, height, width);
//     setCrop(centerCropImage);
//   };

//   const onCropImage = () => {
//     if (!imgRef.current || !previewCanvasRef.current || !crop) return;
  
//     setCanvasPreview(
//       imgRef.current,
//       previewCanvasRef.current,
//       convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
//     );
  
//     const canvas = previewCanvasRef.current;
//     const dataUrl = canvas.toDataURL("image/png");  
//     const blob = dataURLtoBlob(dataUrl);  
//     const file = new File([blob], 'avatar.png', { type: 'image/png' });
  
//     // Call the refactored uploadAvatar method
//     uploadAvatar(file)
//     .then((response: any) => {
//       toast.success("preview folder image uploaded successfully!");
//       // Use type assertion to access `data.url` safely
//       const imageUrl = (response as { data: { url: string } })?.data?.url || dataUrl;
//       setCroppedImage(imageUrl);
//       setModalOpen(false);
//     })
//     .catch((error) => {
//       toast.error("Error uploading folder preview!", error.message);
//     });
  
//   };
  

//   const dataURLtoBlob = (dataUrl) => {
//     const byteString = atob(dataUrl.split(',')[1]);
//     const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
//     const ab = new ArrayBuffer(byteString.length);
//     const ia = new Uint8Array(ab);
    
//     for (let i = 0; i < byteString.length; i++) {
//       ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ab], { type: mimeString });
//   };



//   const uploadAvatar = (file: any) => {
//     return new Promise((resolve, reject) => {
//       const req = new XMLHttpRequest();
  
//       // Monitor the upload progress
//       req.upload.addEventListener('progress', (event) => {
//         if (event.lengthComputable) {
//           const percentage = (event.loaded / event.total) * 100;
//           console.log(`Upload progress: ${percentage}%`);
//           // You can set this to state if needed for UI feedback
//         }
//       });
  
//       // Handle the request load event
//       req.addEventListener('load', () => {
//         const success = req.status >= 200 && req.status < 300;
//         if (success) {
//           try {
//             const response = req.response; // response is already parsed as JSON due to responseType
  
//             // Get the media ID from the response and set it
//             const mediaId = response?.data?._id;
//             if (mediaId) {
//               meidaID(mediaId); // Set the mediaID to the response.data._id
//               resolve(mediaId); // Resolve the promise with the mediaId
//             } else {
//               reject("Media ID not found in response");
//             }
//           } catch (err) {
//             reject("Error parsing response");
//           }
//         } else {
//           reject(req.response);
//         }
//       });
  
//       // Handle error event
//       req.addEventListener('error', () => {
//         console.error("Upload error:", req.response);
//         reject(req.response);
//       });
  
//       // Append the file to FormData
//       const formData = new FormData();
//       formData.append('file', file, file.name);
  
//       // Set the response type and open the request
//       req.responseType = 'json';
//       req.open('POST', 'https://api.girls2dream.com/v1/media/photos');  
//       // Update with your API URL
//       const accessToken = authService.getToken() || '';
//       if (accessToken) {
//         req.setRequestHeader('Authorization', `Bearer ${accessToken}`);
//       }
  
//       // Send the request
//       req.send(formData);
//     });
//   };
  
  
  
//   return (
//     <div className="resume-builder">
//       <div className="image-cropper">
//         <input 
//           type="file" 
//           ref={inputRef} 
//           hidden 
//           accept="image/*" 
//           capture="environment" 
//           onChange={onSelectImage} 
//         />
//       <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
//       <figure
//           className="w-[10vw] flex justify-center"
//           onClick={() => inputRef.current?.click()}
//         >
//           {croppedImage ? (
//             <Avatar
//               sx={{
//                 width: '25vw',
//                 height: '25vw',
//               }}
//             >
//               <img src={croppedImage} style={{ objectFit: "cover", objectPosition: 'center', width: '100%', height: '100%' }} alt="profile" />
//             </Avatar>
//           ) : (
//             <img src="https://media.istockphoto.com/id/1354776457/vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo.jpg?s=612x612&w=0&k=20&c=w3OW0wX3LyiFRuDHo9A32Q0IUMtD4yjXEvQlqyYk9O4=" style={{ objectFit: 'cover', width: '60%', height: '40%', objectPosition: 'center', borderRadius: '50%' }} alt="profile" />
//           )}
//         </figure>
//       </div>
//         <Modal
//           open={modalOpen}
//           onClose={() => setModalOpen(false)}
//           aria-labelledby="crop-image-modal"
//           aria-describedby="crop-image-description"
//           style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", overflowY: "auto" }}
//         >
//           <Box
//             sx={{
//               position: "absolute",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               // maxWidth: 600,
//               // width: "100%",
//               objectFit: "contain",
//               bgcolor: "background.paper",
//               boxShadow: 24,
//               p: 4,
//             }}
//           >
//             {imageSrc && (
//               <ReactCrop
//                 crop={crop}
//                 onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
//                 keepSelection
//                 aspect={1}
//                 minWidth={200}
//                 minHeight={200}
//               >
//                 <img
//                   style={{ width: "80vw", maxHeight: "40vw", objectFit: "contain" }}
//                   ref={imgRef}
//                   src={imageSrc}
//                   alt="Selected Image"
//                   onLoad={onImageLoad}
//                 />
//               </ReactCrop>
//             )}
//             <Button style={{ marginTop: "1rem", width: "100%", marginLeft: '' }}
//               variant="contained"
//               color="primary"
//               onClick={onCropImage}
//               sx={{ mt: 2 }}
//             >
//               Crop Image
//             </Button>
//             {crop && (
//               <canvas
//                 ref={previewCanvasRef}
//                 style={{
//                   display: "none",
//                   border: "1px solid black",
//                   objectFit: "contain",
//                   width: 150,
//                   height: 150,
//                 }}
//               />
//             )}
//           </Box>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default ImageCroper;


import React, { useRef, useState } from "react";
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Modal, Button, Box, Avatar } from "@mui/material";
import { toast } from 'react-toastify';
import { authService } from "@services/auth.service";
import { useTranslationContext } from "context/TranslationContext";
import setCanvasPreview from "@components/image-crop/canvas";

const ImageCroper = ({meidaID }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const {setOnImageUploadSuccess} = useTranslationContext()

  const [croppedImage, setCroppedImage] = useState<string | null>( null);

  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
  
      imageElement.src = imageUrl;
  
      imageElement.addEventListener("load", (e) => {
        const target = e.currentTarget as HTMLImageElement;
        const { naturalWidth, naturalHeight } = target;
        
        // Check if image resolution is at least 1080 x 1080 pixels
        if (naturalWidth < 1080 || naturalHeight < 1080) {
          alert("Image dimensions should be at least 1080x1080 pixels.");
          setImageSrc(null);  // Reset the image source
          return;
        }
  
        setImageSrc(imageUrl);
        setModalOpen(true); // Open the modal to crop
      });
    });
  
    reader.readAsDataURL(file);
  };
  

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { height, width } = e.currentTarget;
    const cropWidth = (150 / width) * 100;
    const crop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidth,
      },
      1,
      height,
      width
    );
    const centerCropImage = centerCrop(crop, height, width);
    setCrop(centerCropImage);
  };

  const onCropImage = () => {
    if (!imgRef.current || !previewCanvasRef.current || !crop) return;
  
    setCanvasPreview(
      imgRef.current,
      previewCanvasRef.current,
      convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
    );
  
    const canvas = previewCanvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");  
    const blob = dataURLtoBlob(dataUrl);  
    const file = new File([blob], 'avatar.png', { type: 'image/png' });
  
    // Call the refactored uploadAvatar method
    uploadAvatar(file)
    .then((response: any) => {
      toast.success("folder preview uploaded successfully!"); 
      // Use type assertion to access `data.url` safely
      const imageUrl = (response as { data: { thumbUrl: string } })?.data?.thumbUrl || dataUrl;
      setCroppedImage(imageUrl);
      setModalOpen(false);
    })
    .catch((error) => {
      console.error(error.message, "Error uploading avatar");
      toast.error("Error uploading folder preview!", error.message);
    });
  
  };
  

  const dataURLtoBlob = (dataUrl) => {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };



  const uploadAvatar = (file: any) => {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
  
      // Monitor the upload progress
      req.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          console.log(`Upload progress: ${percentage}%`);
          // You can set this to state if needed for UI feedback
        }
      });
  
      // Handle the request load event
      req.addEventListener('load', () => {
        const success = req.status >= 200 && req.status < 300;
        if (success) {
          try {
            const response = req.response; // response is already parsed as JSON due to responseType
            console.log("Avatar uploaded successfully:", response);
  
            // Get the media ID from the response and set it
            const mediaId = response?.data?._id;
            if (mediaId) {
              meidaID(mediaId); // Set the mediaID to the response.data._id
              resolve(mediaId); // Resolve the promise with the mediaId
            } else {
              reject("Media ID not found in response");
            }
          } catch (err) {
            console.error("Error parsing response:", err);
            reject("Error parsing response");
          }
        } else {
          console.error("Failed to upload avatar:", req.response);
          reject(req.response);
        }
      });
  
      // Handle error event
      req.addEventListener('error', () => {
        console.error("Upload error:", req.response);
        reject(req.response);
      });
  
      // Append the file to FormData
      const formData = new FormData();
      formData.append('file', file, 'folder_preview.png');
  
      // Set the response type and open the request
      req.responseType = 'json';
      req.open('POST', 'https://api.girls2dream.com/v1/media/photos');  
      // Update with your API URL
      const accessToken = authService.getToken() || '';
      if (accessToken) {
        req.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      }
  
      // Send the request
      req.send(formData);
    });
  };
  
  
  
  return (
    <div className="resume-builder">
      <div className="image-cropper">
        <input 
          type="file" 
          ref={inputRef} 
          hidden 
          accept="image/*" 
          capture="environment" 
          onChange={onSelectImage} 
        />
      <div className="flex" style={{ justifyContent: 'center', alignItems: 'center', width: '100%' }}>
      <figure
          className="w-[10vw] flex justify-center"
          onClick={() => inputRef.current?.click()}
        >
          {croppedImage ? (
            <Avatar
              sx={{
                width: '25vw',
                height: '25vw',
              }}
            >
              <img src={croppedImage} style={{ objectFit: "cover", objectPosition: 'center', width: '100%', height: '100%' }} alt="profile" />
            </Avatar>
          ) : (
            <img src="https://media.istockphoto.com/id/1354776457/vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo.jpg?s=612x612&w=0&k=20&c=w3OW0wX3LyiFRuDHo9A32Q0IUMtD4yjXEvQlqyYk9O4=" style={{ objectFit: 'cover', width: '60%', height: '40%', objectPosition: 'center', borderRadius: '50%' }} alt="profile" />
          )}
        </figure>
      </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="crop-image-modal"
          aria-describedby="crop-image-description"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", overflowY: "auto" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              // maxWidth: 600,
              // width: "100%",
              objectFit: "contain",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
            }}
          >
            {imageSrc && (
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                keepSelection
                aspect={1}
                minWidth={200}
                minHeight={200}
              >
                <img
                  style={{ width: "80vw", maxHeight: "40vw", objectFit: "contain" }}
                  ref={imgRef}
                  src={imageSrc}
                  alt="Selected Image"
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            )}
            <Button style={{ marginTop: "1rem", width: "100%", marginLeft: '' }}
              variant="contained"
              color="primary"
              onClick={onCropImage}
              sx={{ mt: 2 }}
            >
              Crop Image
            </Button>
            {crop && (
              <canvas
                ref={previewCanvasRef}
                style={{
                  display: "none",
                  border: "1px solid black",
                  objectFit: "contain",
                  width: 150,
                  height: 150,
                }}
              />
            )}
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default ImageCroper;