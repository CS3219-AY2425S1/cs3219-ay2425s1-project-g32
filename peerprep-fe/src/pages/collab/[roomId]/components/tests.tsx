import { useState, type FC } from 'react';

import { runCode } from '@/api/code';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading/loading';
import Separator from '@/components/ui/separator';
import { useSession } from '@/context/useSession';

interface Props {
  language: string;
  code: string;
  expand: () => void;
}

const Output = ({
  loading,
  error,
  output,
}: {
  loading: boolean;
  error: string;
  output: string;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return <div>{output}</div>;
};

const Tests: FC<Props> = ({ expand, language, code }) => {
  const [error, setError] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const { sessionData } = useSession();

  const handleRunCode = async () => {
    if (!sessionData) return;
    try {
      expand();
      setIsCodeRunning(true);
      setError('');
      const res = await runCode(language.toLowerCase(), code, sessionData.accessToken);

      setIsCodeRunning(false);
      if (res.error !== '') {
        setError(res.error);
      } else {
        setOutput(res.output);
      }
    } catch (error) {
      setIsCodeRunning(false);
      setError('An error occurred while running your code. Please try again.');
    }
  };
  return (
    <div className="h-full overflow-scroll rounded-lg border bg-background p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Test Output</div>
        <Button onClick={handleRunCode}>Submit</Button>
      </div>
      <Separator className="my-4" />
      <div className="whitespace-pre-wrap">
        <Output loading={isCodeRunning} error={error} output={output} />
      </div>
    </div>
  );
};

export default Tests;
