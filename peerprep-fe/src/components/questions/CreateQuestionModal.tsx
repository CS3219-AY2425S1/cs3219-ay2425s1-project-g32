import { useEffect, useLayoutEffect, useState } from 'react';
import { type Question } from '@/types/question';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import CreateQuestionForm from './CreateQuestionForm';

interface CreateQuestionModalProps {
  onSubmit: (values: Omit<Question, 'id'>) => Promise<void>;
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({ onSubmit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button variant="default" onClick={handleModalOpen}>
        Add Question
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Question">
        <CreateQuestionForm onSubmit={onSubmit} />
      </Modal>
    </>
  );
};

export default CreateQuestionModal;
