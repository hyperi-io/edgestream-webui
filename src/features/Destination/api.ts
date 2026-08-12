import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/destinationSlice';
import { RootState } from 'app/store';

const selectDestinationState = (state: RootState) => state.destination;

export const useGetDestinationItems = () => {
  const dispatch = useAppDispatch();
  const { items: data, loading, errors } = useAppSelector(selectDestinationState);
  return {
    getDestinationItems: () => dispatch(actions.getDestinationItems()),
    data,
    loading: loading.list,
    errors,
  };
};

export const useGetDestinationItem = () => {
  const dispatch = useAppDispatch();
  const { activeItem: data, loading, errors } = useAppSelector(selectDestinationState);
  return {
    getDestinationItem: (name: string) => dispatch(actions.getDestinationItem(name)),
    data,
    loading: loading.item,
    errors,
  };
};

export const useCreateDestination = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectDestinationState);
  return {
    createDestination: (payload: any) => dispatch(actions.createDestination(payload)),
    loading: loading.create,
    errors,
  };
};

export const useUpdateDestination = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectDestinationState);
  return {
    updateDestination: (payload: any) => dispatch(actions.updateDestination(payload)),
    loading: loading.update,
    errors,
  };
};

export const useDeleteDestination = () => {
  const dispatch = useAppDispatch();
  const { loading, errors } = useAppSelector(selectDestinationState);
  return {
    deleteDestination: (name: string) => dispatch(actions.deleteDestination(name)),
    loading: loading.delete,
    errors,
  };
};

export const useGetDestinationTemplate = () => {
  const dispatch = useAppDispatch();
  const { template: data, loading, errors } = useAppSelector(selectDestinationState);
  return {
    getDestinationTemplate: () => dispatch(actions.getDestinationTemplate()),
    data,
    loading: loading.template,
    errors,
  };
};

export const useGetDestinationTemplateItem = () => {
  const dispatch = useAppDispatch();
  const { activeTemplate: data, loading, errors } = useAppSelector(selectDestinationState);
  return {
    getDestinationTemplateItem: (type: string) => dispatch(actions.getDestinationTemplateItem(type)),
    data,
    loading: loading.template,
    errors,
  };
};

export const useGetEventsItems = () => {
  const dispatch = useAppDispatch();
  const { events: data, loading, errors } = useAppSelector(selectDestinationState);
  return {
    getEventsItems: () => dispatch(actions.getEventsItems()),
    data,
    loading: loading.events,
    errors,
  };
};
