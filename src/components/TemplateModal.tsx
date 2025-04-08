import { FC } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface TemplateModalProps {
  show: boolean;
  onHide: () => void;
  errorMessage: string;
  templateId: string | null;
  templateName: string;
  setTemplateName: React.Dispatch<React.SetStateAction<string>>;
  saveTemplate: (templateName: string) => void;
}

const TemplateModal: FC<TemplateModalProps> = ({
  show,
  onHide,
  errorMessage,
  templateId,
  templateName,
  setTemplateName,
  saveTemplate,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Save Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

        <Form.Group controlId="templateNameInput">
          <Form.Label>Template Name:</Form.Label>
          <Form.Control
            type="text"
            value={templateId ? templateName : ''}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Enter template name"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            saveTemplate(templateName);
          }}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateModal;
