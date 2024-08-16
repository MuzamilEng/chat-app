import { Component, createRef } from 'react';

class Dropzone extends Component<any, any> {
  private fileInputRef: any;

  constructor(props: any) {
    super(props);
    this.fileInputRef = createRef();

    this.openFileDialog = this.openFileDialog.bind(this);
    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  componentDidMount() {
    if (this.props.config && !this.props.config.multiple) {
      this.fileInputRef.current.removeAttribute('multiple');
    }
  }

  onFilesAdded(evt: any) {
    if (this.props.disabled) return;
    const { files } = evt.target;
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files);
      this.props.onFilesAdded(array);
    }
  }

  onDragOver(event: any) {
    event.preventDefault();
  }

  onDragLeave(event: any) {
    event.preventDefault();
  }

  onDrop(event: any) {
    event.preventDefault();
    if (this.props.disabed) return;
    const { files } = event.dataTransfer;
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files);
      this.props.onFilesAdded(array);
    }
  }

  openFileDialog() {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  }

  fileListToArray(list: any) {
    const array = [] as any;
    for (let i = 0; i < list.length; i += 1) {
      array.push(list.item(i));
    }
    return array;
  }

  getLangFromUrl = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const lang = path.split('/')[1];
      return lang && lang.length === 2 ? lang : 'en';
    }
    return 'en';
  };
  

  render() {
    const lang = this.getLangFromUrl();
    return (
      <div
        className="image-upload-wrap"
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.openFileDialog}
        style={{ cursor: this.props.disabled ? 'default' : 'pointer' }}
      >
        <input
          ref={this.fileInputRef}
          className="FileInput"
          type="file"
          multiple
          accept={this.props.config.accept || '*/*'}
          onChange={this.onFilesAdded}
        />
        <div className="drag-text">
          <h3>{lang === 'en' ? "Drag & Drop or click here" : "Ziehen Sie eine Datei hierhin oder wählen Sie 'Bild hinzufügen'."}</h3>
        </div>
      </div>
    );
  }
}

export default Dropzone;
