import { useAppDispatch, useAppSelector } from 'common/hooks';
import { RootState } from 'app/store';
import * as actions from './store/configSlice';

const selectState = (state: RootState) => state.config;

export const useInfluxConfig = () => {
  const dispatch = useAppDispatch();
  const { data: config, loading, error } = useAppSelector(selectState);

  return {
    config,
    error,
    isFetching: !!loading['config/fetch/pending'],
    loadConfig: () => dispatch(actions.fetchConfig()),
  };
};
