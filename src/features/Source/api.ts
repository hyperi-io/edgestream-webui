import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/sourceSlice';
import { RootState } from 'app/store';

const selectSourceState = (state: RootState) => state.source;

export const useGetSourceItems = () => {
  const dispatch = useAppDispatch();
  const { items: data, loading, errors } = useAppSelector(selectSourceState);
  return {
    getSourceItems: () => dispatch(actions.getSourceItems()),
    data,
    loading: loading.list,
    errors,
  };
};

export const useGetSourceItem = () => {
  const dispatch = useAppDispatch();
  const { activeItem: data, loading, errors } = useAppSelector(selectSourceState);
  return {
    getSourceItem: (name: string) => dispatch(actions.getSourceItem(name)),
    data,
    loading: loading.item,
    errors,
  };
};

export const useCreateSource = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectSourceState);
  return {
    createSource: (payload: any) => dispatch(actions.createSource(payload)),
    loading: loading.create,
    errors,
  };
};

export const useUpdateSource = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectSourceState);
  return {
    updateSource: (payload: any) => dispatch(actions.updateSource(payload)),
    loading: loading.update,
    errors,
  };
};

export const useUpdateSourceSettings = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectSourceState);
  return {
    updateSourceSettings: (payload: any) => dispatch(actions.updateSourceSettings(payload)),
    loading: loading.update,
    errors,
  };
};

export const useDeleteSource = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectSourceState);
  return {
    deleteSource: (name: string) => dispatch(actions.deleteSource(name)),
    loading: loading.delete,
    errors,
  };
};

export const useGetSourceTemplate = () => {
  const dispatch = useAppDispatch();
  const { template: data, loading, errors } = useAppSelector(selectSourceState);
  return {
    getSourceTemplate: () => dispatch(actions.getSourceTemplate()),
    data,
    loading: loading.template,
    errors,
  };
};

export const useGetSourceTemplateItem = () => {
  const dispatch = useAppDispatch();
  const { activeTemplate: data, loading, errors } = useAppSelector(selectSourceState);
  return {
    getSourceTemplateItem: (type: string) => dispatch(actions.getSourceTemplateItem(type)),
    data,
    loading: loading.template,
    errors,
  };
};
