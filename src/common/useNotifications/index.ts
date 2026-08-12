import { notifications } from '@mantine/notifications';
import type { PayloadAction } from '@reduxjs/toolkit';

type JobLike = {
  identifier?: string;
  detail?: string;
  label?: string;
};

/**
 * Utility to turn various API/Redux inputs into a standard notification-friendly object
 */
function toJobLike(input: unknown): JobLike {
  // Handle Redux action payloads
  const payload = (input as PayloadAction<any>)?.payload ?? input;

  if (payload && typeof payload === 'object') {
    const o = payload as any;
    return {
      identifier: o.identifier ?? o.id ?? o.job_id ?? o.uuid,
      detail: o.detail ?? o.message ?? o.description ?? '',
      label: o.label,
    };
  }

  if (typeof payload === 'string') return { detail: payload };
  return { detail: '' };
}

function toErrorMessage(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;

  const anyErr = err as any;

  // If we used rejectWithValue, the payload is inside anyErr
  // check for our specific structure first:
  if (anyErr?.detail) return anyErr.detail;

  // Fallback
  const apiDetail = anyErr?.response?.data?.detail ??
    anyErr?.response?.data?.message ??
    anyErr?.response?.data?.error;

  if (typeof apiDetail === 'string') return apiDetail;
  return anyErr?.message ?? String(err);
}

export const useNotification = () => {
  const showJobNotification = ({ title, description, job }: { title?: string; description?: string; job: unknown }) => {
    const j = toJobLike(job);
    const notifTitle = j.label || title || j.identifier || 'Request submitted';
    const message = [description, j.detail].filter(Boolean).join('\n');

    notifications.show({
      title: notifTitle,
      message,
      position: 'bottom-right',
      autoClose: 5000,
      withBorder: true,
      color: 'blue',
    });
  };

  const showErrorNotification = ({ title, description, error }: { title?: string; description?: string; error?: unknown }) => {
    const message = [description, toErrorMessage(error)].filter(Boolean).join('\n');

    notifications.show({
      title: title || 'Request failed',
      message: message || 'An unexpected error occurred.',
      position: 'bottom-right',
      autoClose: 8000,
      withBorder: true,
      color: 'red',
    });
  };

  const showSuccessNotification = ({ title, description }: { title?: string; description?: string }) => {
    notifications.show({
      title: title || 'Success',
      message: description || '',
      position: 'bottom-right',
      autoClose: 4000,
      withBorder: true,
      color: 'green',
    });
  };

  return { showJobNotification, showErrorNotification, showSuccessNotification };
};
