import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from 'common/hooks';
import * as actions from './store/eventMonitorSlice';
import { ObservabilityServiceClient } from 'generated/vector/ObservabilityServiceClientPb';
import {
  GetComponentsRequest,
  StreamComponentMetricsRequest,
  MetricName,
  ComponentType
} from 'generated/vector/observability_pb';

const COMPONENT_TYPE_MAP: Record<number, string> = {
  [ComponentType.COMPONENT_TYPE_SOURCE]: 'Source',
  [ComponentType.COMPONENT_TYPE_TRANSFORM]: 'Transform',
  [ComponentType.COMPONENT_TYPE_SINK]: 'Sink',
};

export const useEventMonitor = () => {
  const dispatch = useAppDispatch();
  const state = useAppSelector(actions.selectEventMonitor);

  const streamRef = useRef<any>(null);
  const reconnectRef = useRef<any>(null);

  const client = useMemo(() =>
      new ObservabilityServiceClient(`${window.location.origin}/grpc`, null, { format: 'text' }),
    []);

  const fetchInitialState = useCallback(() => {
    dispatch(actions.setLoading(true));
    const req = new GetComponentsRequest();
    client.getComponents(req, {}, (err, response) => {
      if (err) {
        dispatch(actions.setStreamError(`Fetch failed: ${err.message}`));
        return;
      }
      const components = response.getComponentsList().map(c => ({
        key: c.getComponentId(),
        componentId: c.getComponentId(),
        onType: c.getOnType(),
        componentType: COMPONENT_TYPE_MAP[c.getComponentType()] || 'Unknown',
        receivedEventsTotal: '0',
        sentEventsTotal: '0',
        sentBytesTotal: '0',
        errorsTotal: 0,
      }));
      dispatch(actions.setInitialRows(components));
    });
  }, [client, dispatch]);

  const startStream = useCallback(() => {
    if (streamRef.current) streamRef.current.cancel();

    const req = new StreamComponentMetricsRequest();
    req.setIntervalMs(1000);
    req.setMetric(MetricName.METRIC_NAME_SENT_EVENTS_TOTAL);

    const stream = client.streamComponentMetrics(req, { 'x-grpc-web': '1' });
    streamRef.current = stream;

    stream.on('data', (res) => {
      const total = res.getTotal();
      if (total) {
        dispatch(actions.updateMetrics({
          componentId: res.getComponentId(),
          value: String(total.getValue())
        }));
      }
    });

    stream.on('error', (err: any) => {
      if (err.code !== 1) { // 1 = cancelled
        reconnectRef.current = setTimeout(startStream, 5000);
      }
    });
  }, [client, dispatch]);

  useEffect(() => {
    fetchInitialState();
    startStream();
    return () => {
      if (streamRef.current) streamRef.current.cancel();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [fetchInitialState, startStream]);

  return { ...state, refetch: fetchInitialState };
};
