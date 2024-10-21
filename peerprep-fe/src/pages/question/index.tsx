import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import CodeEditor from './codeEditor';

const FormSchema = z.object({
  codeInput: z.string().min(1, 'Input your answer.'),
});

export default function QuestionAnswerPage() {
  /* eslint-disable-next-line no-unused-vars */
  const [_, setCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState('testCases'); // State to handle tab switching

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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      codeInput: '',
    },
  });

  const onSubmit = () => {
    console.log(form.getValues('codeInput'));
  };

  return (
    <div className="flex h-screen bg-gray-100 p-4">
      {/* Left Panel - Problem Statement */}
      <div className="w-1/3 rounded-md bg-white p-4 shadow-md">
        <div className="mb-2 text-2xl font-bold">{question.title}</div>
        <div className="mb-4 text-gray-600">{question.description}</div>

        {/* Graph / Visual Representation */}
        <div className="mb-4 flex h-40 items-center justify-center rounded border border-gray-300 p-4">
          {/* Placeholder for Graph */}
          <div>Graph Visualization Placeholder</div>
        </div>
      </div>

      {/* Right Panel - Code Editor and Results */}
      <div className="ml-4 flex flex-1 flex-col rounded-md bg-white p-4 shadow-md">
        {/* Code Editor Section */}
        <CodeEditor roomId="roomId" />
        {/* Submit Button */}
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={onSubmit}
            className="cursor-pointer rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
          >
            Run Code
          </button>
        </div>

        {/* Test Cases and Test Results Section */}
        <div className="h-1/2 rounded bg-gray-50 p-4">
          {/* Tabs */}
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

          {/* Tab Content */}
          {activeTab === 'testCases' ? (
            <div>
              {/* Test Cases Content */}
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
              {/* Test Result Content */}
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
