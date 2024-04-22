import { Button } from '@nextui-org/react';
import { AlertError } from './alert-error';

export function AlertApiError({ refetch }: { refetch: () => void }) {
  return (
    <AlertError
      content="Error loading data"
      rightComponent={
        <Button
          size="md"
          radius="sm"
          variant="faded"
          className="my-1"
          onPress={refetch}
        >
          Retry
        </Button>
      }
    />
  );
}
