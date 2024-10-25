import { useState } from 'react';

import Label from '@/components/ui/label';
import Modal from '@/components/ui/modal';
import { type Question } from '@/types/question';

import EditQuestionForm from './EditQuestionForm';

interface EditQuestionModalProps {
  question: Question;
  onEdit: (id: string, values: Omit<Question, 'id'>) => Promise<void>;
}

const EditQuestionModal: React.FC<EditQuestionModalProps> = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Label className="cursor-pointer text-yellow-600" onClick={handleModalOpen}>
        Edit
      </Label>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Question">
        <EditQuestionForm {...props} />
      </Modal>
    </>
  );
};

export default EditQuestionModal;
