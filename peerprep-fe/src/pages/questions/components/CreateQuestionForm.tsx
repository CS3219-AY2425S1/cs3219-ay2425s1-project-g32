import React from 'react';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { Button } from '@/components/ui/button';
import Label from '@/components/ui/label';
import { Question } from '@/types/question';

interface CreateQuestionFormProps {
  onSubmit: (values: Omit<Question, 'id'>) => Promise<void>;
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  category: Yup.array()
    .of(Yup.string().required('Category is required'))
    .min(1, 'At least one category is required'),
  complexity: Yup.string()
    .oneOf(['Easy', 'Medium', 'Hard'], 'Invalid complexity level')
    .required('Complexity is required'),
});

const initialValues: Omit<Question, 'id'> = {
  title: '',
  description: '',
  category: [],
  complexity: 'Medium',
  explaination: '',
  sample_input: '',
  sample_output: '',
};

const availableCategories = [
  'Strings',
  'Algorithms',
  'Data Structures',
  'Bit Manipulation',
  'Recursion',
  'Brainteaser',
  'Arrays',
];

const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({ onSubmit }) => {
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ isSubmitting, setFieldValue, values }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <Field
              type="text"
              name="title"
              placeholder="Enter question title"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring focus:ring-opacity-50"
            />
            <ErrorMessage name="title" component="div" className="text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <Field
              as="textarea"
              name="description"
              placeholder="Describe the question in detail"
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:ring focus:ring-opacity-50"
            />
            <ErrorMessage name="description" component="div" className="text-sm text-red-600" />
          </div>

          <div>
            <Label>Category</Label>
            <div role="group" aria-labelledby="checkbox-group">
              {availableCategories.map((category) => (
                <div key={category}>
                  <Label>
                    <Field
                      type="checkbox"
                      name="category"
                      value={category}
                      onChange={() => {
                        const currentCategories = values.category;
                        if (currentCategories.includes(category)) {
                          // Remove category if already selected
                          setFieldValue(
                            'category',
                            currentCategories.filter((cat) => cat !== category)
                          );
                        } else {
                          // Add category if not selected
                          setFieldValue('category', [...currentCategories, category]);
                        }
                      }}
                    />
                    {category}
                  </Label>
                </div>
              ))}
            </div>
            <ErrorMessage name="category" component="div" className="text-sm text-red-600" />
          </div>

          <div>
            <Label>Complexity</Label>
            <div role="group" aria-labelledby="complexity-group">
              <Label>
                <Field type="radio" name="complexity" value="Easy" />
                Easy
              </Label>
              <Label>
                <Field type="radio" name="complexity" value="Medium" />
                Medium
              </Label>
              <Label>
                <Field type="radio" name="complexity" value="Hard" />
                Hard
              </Label>
            </div>
            <ErrorMessage name="complexity" component="div" className="text-sm text-red-600" />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            Create Question
          </Button>
        </Form>
      )}
    </Formik>
  );
};

export default CreateQuestionForm;
