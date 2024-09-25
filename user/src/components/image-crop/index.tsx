import React, { useRef, useState } from "react";
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Modal, Button, Box, Avatar } from "@mui/material";
import setCanvasPreview from "./canvas";
import { toast } from 'react-toastify';
import { authService } from "@services/auth.service";
import { useTranslationContext } from "context/TranslationContext";

const ImageCroper = () => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [crop, setCrop] = useState<any>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const {setOnImageUploadSuccess, currentUser} = useTranslationContext()
  const userFromLocal = JSON.parse(localStorage.getItem('userRegisterationRecords'))
  const [croppedImage, setCroppedImage] = useState<string | null>(userFromLocal?.avatarUrl || null);

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
        if (naturalWidth < 150 || naturalHeight < 150) {
          alert("Image dimensions should be at least 150x150");
          setImageSrc("");
          return;
        }
        setImageSrc(imageUrl);
        setModalOpen(true);
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
      toast.success("Avatar uploaded successfully!");
      // setImageSrc("");
        setTimeout(() => {
          setOnImageUploadSuccess(true);
        }, 3000);  
      // Use type assertion to access `data.url` safely
      const imageUrl = (response as { data: { url: string } })?.data?.url || dataUrl;
      userFromLocal.avatarUrl = imageUrl
      localStorage.setItem('userRegisterationRecords', JSON.stringify(userFromLocal));
      // setActiveStep(3)
      setCroppedImage(imageUrl);
      setModalOpen(false);
    })
    .catch((error) => {
      toast.error("Error uploading avatar!");
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
          console.log("Avatar uploaded successfully:", req.response);
          resolve(req.response);
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
      formData.append('file', file, file.name);
      formData.append('id', currentUser._id);
  
      // Set the response type and open the request
      req.responseType = 'json';
      req.open('POST', 'https://api.girls2dream.com/v1/users/update-avatar');  // Update with your API URL
  
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
              <img src={croppedImage} style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }} alt="profile" />
            </Avatar>
          ) : (
            <img src="/images/no-image.png" style={{ objectFit: 'cover', objectPosition: 'center', borderRadius: '50%' }} alt="profile" />
          )}
        </figure>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          aria-labelledby="crop-image-modal"
          aria-describedby="crop-image-description"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              maxWidth: 600,
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
                  style={{ width: "100%" }}
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