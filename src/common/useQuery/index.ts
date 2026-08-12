import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type QueryObject = {
  [key: string]: number | string | boolean | undefined;
};

export interface IQuery<Params> {
  params: Params;
  patchQuery: (key: string, value: string | number) => void;
  patchQueryObject: (obj: QueryObject, replace?: boolean) => void;
  removeQuery: (key: string | string[], obj?: QueryObject) => void;
  clearQuery: () => void;
}

const useQuery = <
  Params extends { [K in keyof Params]?: string },
>(): IQuery<Params> => {
  const { search, pathname } = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => {
    const searchParams = new URLSearchParams(search);
    const obj: any = {};
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
    return obj as Params;
  }, [search]);

  const clearQuery = () => {
    navigate({ pathname, search: '' });
  };

  const patchQuery = (key: string, value: string | number) => {
    const p = new URLSearchParams(search);
    p.set(key, String(value));
    navigate({ pathname, search: `?${p.toString()}` });
  };

  const patchQueryObject = (object: QueryObject, replace?: boolean) => {
    const p = new URLSearchParams(replace ? '' : search);
    Object.keys(object).forEach((key) => {
      const val = object[key];
      if (val === undefined) {
        p.delete(key);
      } else {
        p.set(key, String(val));
      }
    });
    navigate({ pathname, search: `?${p.toString()}` });
  };

  const removeQuery = (key: string | string[], object?: QueryObject) => {
    const p = new URLSearchParams(search);
    if (Array.isArray(key)) {
      key.forEach((k) => p.delete(k));
    } else {
      p.delete(key);
    }

    if (object) {
      Object.keys(object).forEach((objKey) => {
        p.set(objKey, String(object[objKey]));
      });
    }

    navigate({ pathname, search: `?${p.toString()}` });
  };

  return {
    params,
    patchQuery,
    patchQueryObject,
    removeQuery,
    clearQuery,
  };
};

export default useQuery;
