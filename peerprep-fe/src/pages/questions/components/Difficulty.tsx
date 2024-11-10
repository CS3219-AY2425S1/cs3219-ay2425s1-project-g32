import { type FC } from 'react';

const Difficulty: FC<{ difficulty: string }> = ({ difficulty }) => {
  let className = '';
  switch (difficulty) {
    case 'Easy':
      className = 'text-green-600';
      break;
    case 'Medium':
      className = 'text-orange-500';
      break;
    case 'Hard':
      className = 'text-red-600';
      break;
    default:
      break;
  }
  return <span className={className}>{difficulty}</span>;
};

export default Difficulty;
