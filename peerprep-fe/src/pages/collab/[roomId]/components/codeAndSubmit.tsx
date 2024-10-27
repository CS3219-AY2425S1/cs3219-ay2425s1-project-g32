import { useMemo, useState, type FC } from 'react';

import { InfoIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { runCode } from '@/api/code';
import { LANGUAGES, EXECUTABLE_LANGUAGES } from '@/components/codeEditor/data/languages';
import { THEMES } from '@/components/codeEditor/useThemesExtension';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/loading/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from '@/context/useSession';

import CodeMirrorEditor from './codeEditor';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

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

const formatOutput = (text: string) => {
  if (!text) return '';
  return text.split('\n').map((line) => (
    <span>
      {line}
      <br />
    </span>
  ));
};

const CodeAndSubmit: FC<Props> = () => {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('testCases'); // State to handle tab switching
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>(LANGUAGES.PYTHON);
  const [theme, setTheme] = useState<string>(
    resolvedTheme === 'dark' ? THEMES.SOLARIZED_DARK : THEMES.SOLARIZED_LIGHT
  );
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const executable = useMemo(
    () => Object.values(EXECUTABLE_LANGUAGES).includes(language),
    [language]
  );
  const { sessionData } = useSession();

  const handleRunCode = async () => {
    if (!sessionData) return;
    try {
      setIsCodeRunning(true);
      setError('');
      setActiveTab('testResult');
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
    <div className="flex flex-grow flex-col bg-muted/50 p-4">
      <div className="flex flex-grow flex-col overflow-hidden rounded-lg border bg-background p-4 shadow-md">
        <div className="mb-4 flex justify-between">
          <div className="flex items-center gap-x-2">
            <SidebarTrigger className="text-gray-500" />
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>Language does not support execution currently.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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

        <div className="flex-grow overflow-hidden rounded-lg">
          <CodeMirrorEditor language={language} theme={theme} onCodeChange={setCode} />
        </div>
        {executable && (
          <div className="mt-4 flex justify-end">
            <Button onClick={handleRunCode}>Run Code</Button>
          </div>
        )}
      </div>
      {executable && (
        <div className="mt-6 rounded-lg border bg-background p-4 shadow-md">
          <div className="rounded  p-4">
            <Tabs
              value={activeTab}
              onValueChange={(e) => {
                setActiveTab(e);
              }}
              defaultValue="testCases"
            >
              <TabsList>
                <TabsTrigger value="testCases">Test Cases</TabsTrigger>
                <TabsTrigger value="testResults">Test Results</TabsTrigger>
              </TabsList>
              <TabsContent value="testCases">
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
              </TabsContent>
              <TabsContent value="testResults">
                <div>
                  <div className="rounded border p-4">
                    <div className="font-semibold">Test Output</div>
                    {isCodeRunning ? (
                      <div className="flex justify-center">
                        <Loading />
                      </div>
                    ) : (
                      <div>
                        {formatOutput(error) ||
                          formatOutput(output) ||
                          'Output for the current test cases will be shown here...'}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeAndSubmit;