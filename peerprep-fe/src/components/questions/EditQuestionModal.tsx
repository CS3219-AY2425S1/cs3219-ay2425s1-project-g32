import { useEffect, useLayoutEffect, useState } from 'react';
import { type Question } from '@/types/question';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import CreateQuestionForm from './CreateQuestionForm';
import EditQuestionForm from './EditQuestionForm';
import Label from '../ui/label';

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
