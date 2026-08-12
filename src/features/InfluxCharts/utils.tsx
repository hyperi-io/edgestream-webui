import { differenceInMilliseconds, format as formatDate } from 'date-fns';

import type { Series } from './types';

export const getDynamicTimeFormat = (data: Series[]): string => {
  const timestamps = data
    .flatMap((series) =>
      series.data.map((pt) => (pt.x instanceof Date ? pt.x : new Date(pt.x))),
    )
    .sort((a, b) => a.getTime() - b.getTime());

  if (timestamps.length < 2) return 'HH:mm';

  const min = timestamps[0];
  const max = timestamps[timestamps.length - 1];
  const diffMs = differenceInMilliseconds(max, min);

  if (diffMs <= 60 * 1000) return 'HH:mm:ss'; // under 1 min → show seconds
  if (diffMs <= 60 * 60 * 1000) return 'HH:mm'; // under 1 hr → HH:mm
  return 'HH:mm dd/MM/yy'; // over 1 hr → full format
};

export { formatDate };
