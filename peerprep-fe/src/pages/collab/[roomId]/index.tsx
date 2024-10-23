import React, { useState } from 'react';

import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import Skeleton from '@/components/ui/skeleton';

import CodeEditor from './codeEditor';

export default function QuestionAnswerPage() {
  const [activeTab, setActiveTab] = useState('testCases'); // State to handle tab switching
  const router = useRouter();
  const { roomId } = router.query;

  const question = {
    title: 'Question Title',
    description:
      'Question Details Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet lorem at nisi vehicula sagittis. Nullam a venenatis mi. Aliquam faucibus ipsum orci, ut varius ante laoreet ac...',
  };

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

  return (
    <div className="flex flex-grow gap-x-4 bg-gray-100 p-4">
      <div className="w-[450px] rounded-md bg-white p-4 shadow-md">
        <div className="mb-2 text-2xl font-bold">{question.title}</div>
        <div className="mb-4 text-gray-600">{question.description}</div>
        <div className="mb-4 flex h-40 items-center justify-center rounded border border-gray-300 p-4">
          <div>Graph Visualization Placeholder</div>
        </div>
      </div>
      <div className="col-span-auto flex-grow  overflow-scroll rounded-md bg-white p-4 shadow-md">
        <div className="mb-6">
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
            <CodeEditor roomId={roomId as string} />
          )}
          <div className="mt-4 flex justify-end">
            <Button>Run Code</Button>
          </div>
        </div>
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
}
