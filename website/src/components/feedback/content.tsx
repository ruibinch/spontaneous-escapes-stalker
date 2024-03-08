'use client';
import { Button, Input, Textarea, cn } from '@nextui-org/react';
import axios from 'axios';
import { useState } from 'react';
import { PageHeader } from '../common/page-header';
import { CommonStyles } from '../common/styles';
import { AlertInfo } from '../common/alert-info';
import { AlertError } from '../common/alert-error';

interface FeedbackFormFields {
  email: string;
  message: string;
}

export function FeedbackContent() {
  const [isFeedbackSent, setFeedbackSent] = useState(false);
  const [isError, setError] = useState(false);

  const handleSubmit = async ({ email, message }: FeedbackFormFields) => {
    const response = await axios.post('/api/feedback', { email, message });
    if (response.status === 200) {
      setFeedbackSent(true);
    } else {
      setError(true);
    }
  };

  return (
    <div>
      <PageHeader title="Feedback" />

      <div className={cn(CommonStyles.Page())}>
        {isFeedbackSent ? (
          <AlertInfo content="Thanks for your feedback!" />
        ) : (
          <FeedbackForm isError={isError} handleSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}

function FeedbackForm({
  isError,
  handleSubmit,
}: {
  isError: boolean;
  handleSubmit: (fields: FeedbackFormFields) => void;
}) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  console.log('disabled:', !email || !message);

  const onSubmit = () => {
    handleSubmit({ email, message });
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        {isError && (
          <AlertError content="Error submitting feedback, please try again in a while" />
        )}

        <div className="flex flex-col gap-2">
          <p className="font-semibold">Email</p>

          <Input
            size="sm"
            radius="sm"
            variant="bordered"
            classNames={{
              mainWrapper: 'md:w-3/4',
            }}
            value={email}
            onValueChange={setEmail}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-semibold">Message</p>

          <Textarea
            size="lg"
            radius="sm"
            variant="bordered"
            classNames={{
              base: 'md:w-3/4',
            }}
            value={message}
            onValueChange={setMessage}
          />
        </div>
      </div>

      <Button
        size="md"
        radius="sm"
        color="primary"
        className="mt-8"
        isDisabled={!email || !message}
        onPress={onSubmit}
      >
        Submit
      </Button>
    </div>
  );
}
