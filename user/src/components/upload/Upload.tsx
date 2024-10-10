import { Component, createRef, useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from 'src/services/auth.service';

import Dropzone from './Dropzone';
import Progress from './Progress';

interface IUploadConfig {
  multiple?: boolean;
  accept?: string;
}
interface IProps {
  url: string;
  // eslint-disable-next-line react/require-default-props
  onComplete?: Function;
  // eslint-disable-next-line react/require-default-props
  onCompletedAll?: Function;
  // eslint-disable-next-line react/require-default-props
  config?: IUploadConfig;
  // eslint-disable-next-line react/require-default-props
  customFields?: any; // add custom field in form data
  // eslint-disable-next-line react/require-default-props
  onRemove?: Function;
  // eslint-disable-next-line react/require-default-props
  isChecked: boolean;
  // eslint-disable-next-line react/require-default-props
  fileName?: string;
} 

class Upload extends Component<IProps, any> {
  private zoneRef: any = createRef();

  constructor(props: any) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.sendRequest = this.sendRequest.bind(this);

  }

  onFilesAdded(files: any) {
    const notMulti = this.props.config && !this.props.config.multiple;
    this.setState(
      (state: any) => ({
        files: notMulti ? files : state.files.concat(files)
      }),
      () => this.uploadFiles()
    );
  }

  handleChecked(){
    if (!this?.props.isChecked) {
      console.log(this?.props?.isChecked, "checked");
      toast.error('Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      return;
    }
    }
    
    async uploadFiles() {
      if (!this.props.isChecked) {
      console.log(this?.props?.isChecked, "checked");
      toast.error('Bitte wählen Sie das Kontrollkästchen, um fortzufahren.');
      return;
    }
    this.setState({ uploadProgress: {}, uploading: true });
    const promises = this.state.files.map((file) => this.sendRequest(file));
    try {
      const responses = await Promise.all(promises);
      this.props.onCompletedAll && this.props.onCompletedAll(responses);
      this.setState({ successfulUploaded: true, uploading: false });
    } catch (error) {
      toast.error('Upload fehlgeschlagen! Bitte überprüfen Sie es.');
      this.setState({ successfulUploaded: true, uploading: false });
    }
  }

  sendRequest(file: File) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();

      req.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const copy = { ...this.state.uploadProgress };
          copy[file.name] = {
            state: 'pending',
            percentage: (event.loaded / event.total) * 100
          };
          this.setState({ uploadProgress: copy });
        }
      });

      req.addEventListener('load', () => {
        const success = req.status >= 200 && req.status < 300;
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = {
          state: success ? 'done' : 'error',
          percentage: success ? 100 : 0
        };
        this.setState({ uploadProgress: copy });
        if (success) {
          resolve(req.response);
          this.props.onComplete && this.props.onComplete(req.response);
        } else {
          reject(req.response);
        }
      });

      req.addEventListener('error', () => {
        const copy = { ...this.state.uploadProgress };
        copy[file.name] = { state: 'error', percentage: 0 };
        this.setState({ uploadProgress: copy });
        reject(req.response);
      });

      const formData = new FormData();
      formData.append('file', file, this.props.fileName? this.props.fileName : file.name);

      const currentUser = localStorage.getItem('userRegisterationRecords');
      if (currentUser) {
        try {
          const parsedUser = JSON.parse(currentUser);
          if (parsedUser && parsedUser._id) {
            formData.append('id', parsedUser._id); // Append user ID to formData
          }
        } catch (error) {
          console.error('Error parsing current user from localStorage:', error);
        }
      }

      if (this.props.customFields) {
        Object.keys(this.props.customFields).forEach((key) => {
          formData.append(key, this.props.customFields[key]);
        });
      }

      req.responseType = 'json';
    req.open('POST', this.props.url);

      if(!currentUser){
      const accessToken = authService.getToken() || '';
      if (accessToken) {
        req.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      }
      }

      req.send(formData);
    });
  }

  // eslint-disable-next-line consistent-return, react/sort-comp
  renderProgress(file: any) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src="/images/baseline-check_circle_outline-24px.svg"
            style={{
              opacity: uploadProgress && uploadProgress.state === 'done' ? 0.5 : 0
            }}
          />
        </div>
      );
    }
  }

  removeItem(evt: any, index: any) {
    evt.preventDefault();
    const { files } = this.state;
    const { onRemove } = this.props;
    files.splice(index, 1);
    this.setState(
      {
        uploading: false,
        uploadProgress: {},
        successfullUploaded: false,
        files
      },
      // () => {
      //   if (!files.length) {
      //     this?.zoneRef?.current?.resetFileInput();
      //   }
      // }
    );
    onRemove && onRemove(files);
  }

  render() {
    return (
      <div onClick={()=> this.handleChecked()} className="file-upload">
        <Dropzone
          onFilesAdded={this?.onFilesAdded}
          disabled={!this.props.isChecked || this?.state?.uploading || this?.state?.successfullUploaded}
          config={this?.props?.config}
          ref={this?.zoneRef}
        />
        <div className="file-upload-content">
          {this?.state?.files.map((file: any, index: number) => {
            const img = URL.createObjectURL(file);
            return (
              <div key={file?.name} className="Row">
                {file.type.indexOf('image') > -1 && (
                  <>
                    <img src={img} alt="img" className="file-upload-image" />
                    <button type="button" onClick={(evt) => this?.removeItem(evt, index)} className="remove-image">
                    Entfernen
                      {' '}
                      <span className="image-title">Hochgeladenes Bild</span>
                    </button>
                  </>
                )}
                <span className="Filename">{file?.name}</span>
                {this.renderProgress(file)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Upload;
