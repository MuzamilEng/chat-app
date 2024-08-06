/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState } from 'react';
import { Modal } from 'react-bootstrap';

interface IProps {
  image: string;
}

function ImageBox({
  image
}: IProps) {
  const [show, setShow] = useState(false);

  return (
    <Modal
      onHide={() => setShow(false)}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={show}
    >
      <Modal.Body className="text-center">
        <img src={image} className="img-fluid-custom" onClick={() => setShow(false)} width="100%" alt="" />
      </Modal.Body>
    </Modal>
  );
}

export default ImageBox;
