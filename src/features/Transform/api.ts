import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/transformSlice';
import { RootState } from 'app/store';

const selectTransformState = (state: RootState) => state.transform;

export const useGetTransformItems = () => {
  const dispatch = useAppDispatch();
  const { items: data, loading, errors } = useAppSelector(selectTransformState);
  return {
    getTransformItems: () => dispatch(actions.getTransformItems()),
    data,
    loading: loading.list,
    errors,
  };
};

export const useGetTransformParents = () => {
  const dispatch = useAppDispatch();
  const { parents: data, loading, errors } = useAppSelector(selectTransformState);
  return {
    getTransformParents: () => dispatch(actions.getTransformParents()),
    data,
    loading: loading.parents,
    errors,
  };
};

export const useCreateTransform = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectTransformState);
  return {
    createTransform: (payload: any) => dispatch(actions.createTransform(payload)),
    loading: loading.create,
    errors,
  };
};

export const useUpdateTransform = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectTransformState);
  return {
    updateTransform: (payload: any) => dispatch(actions.updateTransform(payload)),
    loading: loading.update,
    errors,
  };
};

export const useDeleteTransform = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectTransformState);
  return {
    deleteTransform: (input: any) => dispatch(actions.deleteTransform(input)),
    loading: loading.delete,
    errors,
  };
};
