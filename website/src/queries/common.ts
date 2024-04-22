import { isAxiosError } from 'axios';

export const getErrorStatusCode = (err: unknown) => {
  if (isAxiosError(err)) {
    return err.response?.status;
  }
  return 500;
};
