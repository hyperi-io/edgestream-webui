import { DateTime } from 'luxon';
import { notifications } from '@mantine/notifications';

/**
 * Standardized API Error Handler
 * Designed to parse FastAPI/Pydantic error structures and display Mantine notifications.
 */
export const handleAPIError = (error: any, errorTitle: string) => {

  console.error('[API Error]', errorTitle, error);

  const errorResponse = error?.response;

  const showError = (message: string, description?: string) => {
    notifications.show({
      title: message,
      message: description ?? '',
      color: 'red',
      autoClose: 10000,
      withBorder: true,
      position: 'bottom-left',
    });
  };

  if (errorResponse) {
    const { detail } = errorResponse.data ?? {};
    const status = errorResponse.status;

    if (status === 401) {
      showError('Unauthorized', 'Your session may have expired. Please log in again.');
      return;
    }

    if (status === 500) {
      showError('Server Error', 'The backend encountered an internal issue. Please try again later.');
      return;
    }

    // Handle FastAPI style detail: string
    if (typeof detail === 'string') {
      showError(errorTitle, detail);
      return;
    }

    // Handle FastAPI style detail: Array<{ msg, loc, type }>
    if (Array.isArray(detail)) {
      detail.forEach((err: any) => {
        showError(errorTitle, err.msg || 'Validation error occurred');
      });
      return;
    }

    showError(errorTitle, `Error ${status}: Unspecified server error.`);
  }
  else {
    showError(
      `Connection Error: ${errorTitle}`,
      error?.message ?? 'Unable to reach the server. Check your connection.'
    );
  }
};

/** ---------- Date Utilities ---------- */

export function newDate(increment: any): Date {
  return DateTime.now().plus(increment).toJSDate();
}

export function newDateString(increment: any): string | null {
  return DateTime.now().plus(increment).toISO();
}
