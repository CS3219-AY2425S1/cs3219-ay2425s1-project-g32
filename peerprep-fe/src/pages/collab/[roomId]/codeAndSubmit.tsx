import { useState, type FC } from 'react';

import { LANGUAGES } from '@/components/codeEditor/data/languages';
import { THEMES } from '@/components/codeEditor/useThemesExtension';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Skeleton from '@/components/ui/skeleton';

import CodeEditor from './codeEditor';

interface Props {
  roomId: string;
}

const testCases = [
  {
    id: 1,
    description: 'Test case 1',
    inputs: { x: 5, y: 1, nums: [1, 2, 3, 4, 5] },
    expectedOutput: [6],
  },
  {
    id: 2,
    description: 'Test case 2',
    inputs: { x: 10, y: 2, nums: [2, 3, 5, 7, 11] },
    expectedOutput: [12],
  },
];

const CodeAndSubmit: FC<Props> = ({ roomId }) => {
  const [activeTab, setActiveTab] = useState('testCases'); // State to handle tab switching
  const [language, setLanguage] = useState<string>(LANGUAGES.PYTHON);
  const [theme, setTheme] = useState<string>(THEMES.SOLARIZED_LIGHT);

  return (
    <div className="flex-grow overflow-scroll rounded-md ">
      <div className="flex flex-col rounded-lg bg-white p-4 shadow-md">
        <div className="mb-4 flex justify-between">
          <Select value={language} onValueChange={(v) => setLanguage(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LANGUAGES).map((language) => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={theme} onValueChange={(v) => setTheme(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(THEMES).map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {theme}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!roomId ? (
          <div className="flex flex-col gap-y-4">
            <Skeleton className="h-4 w-1/2" />
            {[...Array.from<number>({ length: 8 })]
              .map((_, i) => i)
              .map((v: number) => (
                <Skeleton key={v} className="h-4" />
              ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg">
            <CodeEditor roomId={roomId} language={language} theme={theme} />
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button>Run Code</Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg bg-white p-4 shadow-md">
        <div className="rounded bg-gray-50 p-4">
          <div className="mb-2 flex">
            <button
              type="button"
              onClick={() => setActiveTab('testCases')}
              className={`mr-2 cursor-pointer rounded px-4 py-2 ${
                activeTab === 'testCases' ? 'bg-gray-300' : ''
              }`}
            >
              Test Cases
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('testResult')}
              className={`cursor-pointer rounded px-4 py-2 ${
                activeTab === 'testResult' ? 'bg-gray-300' : ''
              }`}
            >
              Test Result
            </button>
          </div>
          {activeTab === 'testCases' ? (
            <div>
              {testCases.map((testCase) => (
                <div key={testCase.id} className="mb-2 rounded border p-4">
                  <div className="font-semibold">{testCase.description}</div>
                  <div>
                    <div className="font-medium">Inputs:</div> x = {testCase.inputs.x}, y ={' '}
                    {testCase.inputs.y}, nums = [{testCase.inputs.nums.join(', ')}]
                  </div>
                  <div>
                    <div className="font-medium">Expected Output:</div>{' '}
                    {testCase.expectedOutput.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div className="rounded border p-4">
                <div className="font-semibold">Test Output</div>
                <div>Output for the current test cases will be shown here...</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeAndSubmit;
