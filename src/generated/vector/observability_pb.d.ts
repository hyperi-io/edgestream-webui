import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"
import * as event_pb from './event_pb'; // proto import: "event.proto"


export class GetMetaRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMetaRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetMetaRequest): GetMetaRequest.AsObject;
  static serializeBinaryToWriter(message: GetMetaRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMetaRequest;
  static deserializeBinaryFromReader(message: GetMetaRequest, reader: jspb.BinaryReader): GetMetaRequest;
}

export namespace GetMetaRequest {
  export type AsObject = {
  };
}

export class GetMetaResponse extends jspb.Message {
  getVersion(): string;
  setVersion(value: string): GetMetaResponse;

  getHostname(): string;
  setHostname(value: string): GetMetaResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMetaResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetMetaResponse): GetMetaResponse.AsObject;
  static serializeBinaryToWriter(message: GetMetaResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMetaResponse;
  static deserializeBinaryFromReader(message: GetMetaResponse, reader: jspb.BinaryReader): GetMetaResponse;
}

export namespace GetMetaResponse {
  export type AsObject = {
    version: string;
    hostname: string;
  };
}

export class GetAllocationTracingStatusRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAllocationTracingStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAllocationTracingStatusRequest): GetAllocationTracingStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetAllocationTracingStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAllocationTracingStatusRequest;
  static deserializeBinaryFromReader(message: GetAllocationTracingStatusRequest, reader: jspb.BinaryReader): GetAllocationTracingStatusRequest;
}

export namespace GetAllocationTracingStatusRequest {
  export type AsObject = {
  };
}

export class GetAllocationTracingStatusResponse extends jspb.Message {
  getEnabled(): boolean;
  setEnabled(value: boolean): GetAllocationTracingStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAllocationTracingStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetAllocationTracingStatusResponse): GetAllocationTracingStatusResponse.AsObject;
  static serializeBinaryToWriter(message: GetAllocationTracingStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAllocationTracingStatusResponse;
  static deserializeBinaryFromReader(message: GetAllocationTracingStatusResponse, reader: jspb.BinaryReader): GetAllocationTracingStatusResponse;
}

export namespace GetAllocationTracingStatusResponse {
  export type AsObject = {
    enabled: boolean;
  };
}

export class GetComponentsRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): GetComponentsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetComponentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetComponentsRequest): GetComponentsRequest.AsObject;
  static serializeBinaryToWriter(message: GetComponentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetComponentsRequest;
  static deserializeBinaryFromReader(message: GetComponentsRequest, reader: jspb.BinaryReader): GetComponentsRequest;
}

export namespace GetComponentsRequest {
  export type AsObject = {
    limit: number;
  };
}

export class GetComponentsResponse extends jspb.Message {
  getComponentsList(): Array<Component>;
  setComponentsList(value: Array<Component>): GetComponentsResponse;
  clearComponentsList(): GetComponentsResponse;
  addComponents(value?: Component, index?: number): Component;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetComponentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetComponentsResponse): GetComponentsResponse.AsObject;
  static serializeBinaryToWriter(message: GetComponentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetComponentsResponse;
  static deserializeBinaryFromReader(message: GetComponentsResponse, reader: jspb.BinaryReader): GetComponentsResponse;
}

export namespace GetComponentsResponse {
  export type AsObject = {
    componentsList: Array<Component.AsObject>;
  };
}

export class Component extends jspb.Message {
  getComponentId(): string;
  setComponentId(value: string): Component;

  getComponentType(): ComponentType;
  setComponentType(value: ComponentType): Component;

  getOnType(): string;
  setOnType(value: string): Component;

  getOutputsList(): Array<Output>;
  setOutputsList(value: Array<Output>): Component;
  clearOutputsList(): Component;
  addOutputs(value?: Output, index?: number): Output;

  getMetrics(): ComponentMetrics | undefined;
  setMetrics(value?: ComponentMetrics): Component;
  hasMetrics(): boolean;
  clearMetrics(): Component;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Component.AsObject;
  static toObject(includeInstance: boolean, msg: Component): Component.AsObject;
  static serializeBinaryToWriter(message: Component, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Component;
  static deserializeBinaryFromReader(message: Component, reader: jspb.BinaryReader): Component;
}

export namespace Component {
  export type AsObject = {
    componentId: string;
    componentType: ComponentType;
    onType: string;
    outputsList: Array<Output.AsObject>;
    metrics?: ComponentMetrics.AsObject;
  };
}

export class Output extends jspb.Message {
  getOutputId(): string;
  setOutputId(value: string): Output;

  getSentEventsTotal(): number;
  setSentEventsTotal(value: number): Output;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Output.AsObject;
  static toObject(includeInstance: boolean, msg: Output): Output.AsObject;
  static serializeBinaryToWriter(message: Output, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Output;
  static deserializeBinaryFromReader(message: Output, reader: jspb.BinaryReader): Output;
}

export namespace Output {
  export type AsObject = {
    outputId: string;
    sentEventsTotal: number;
  };
}

export class ComponentMetrics extends jspb.Message {
  getReceivedBytesTotal(): number;
  setReceivedBytesTotal(value: number): ComponentMetrics;
  hasReceivedBytesTotal(): boolean;
  clearReceivedBytesTotal(): ComponentMetrics;

  getReceivedEventsTotal(): number;
  setReceivedEventsTotal(value: number): ComponentMetrics;
  hasReceivedEventsTotal(): boolean;
  clearReceivedEventsTotal(): ComponentMetrics;

  getSentBytesTotal(): number;
  setSentBytesTotal(value: number): ComponentMetrics;
  hasSentBytesTotal(): boolean;
  clearSentBytesTotal(): ComponentMetrics;

  getSentEventsTotal(): number;
  setSentEventsTotal(value: number): ComponentMetrics;
  hasSentEventsTotal(): boolean;
  clearSentEventsTotal(): ComponentMetrics;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ComponentMetrics.AsObject;
  static toObject(includeInstance: boolean, msg: ComponentMetrics): ComponentMetrics.AsObject;
  static serializeBinaryToWriter(message: ComponentMetrics, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ComponentMetrics;
  static deserializeBinaryFromReader(message: ComponentMetrics, reader: jspb.BinaryReader): ComponentMetrics;
}

export namespace ComponentMetrics {
  export type AsObject = {
    receivedBytesTotal?: number;
    receivedEventsTotal?: number;
    sentBytesTotal?: number;
    sentEventsTotal?: number;
  };

  export enum ReceivedBytesTotalCase {
    _RECEIVED_BYTES_TOTAL_NOT_SET = 0,
    RECEIVED_BYTES_TOTAL = 1,
  }

  export enum ReceivedEventsTotalCase {
    _RECEIVED_EVENTS_TOTAL_NOT_SET = 0,
    RECEIVED_EVENTS_TOTAL = 2,
  }

  export enum SentBytesTotalCase {
    _SENT_BYTES_TOTAL_NOT_SET = 0,
    SENT_BYTES_TOTAL = 3,
  }

  export enum SentEventsTotalCase {
    _SENT_EVENTS_TOTAL_NOT_SET = 0,
    SENT_EVENTS_TOTAL = 4,
  }
}

export class StreamComponentAllocatedBytesRequest extends jspb.Message {
  getIntervalMs(): number;
  setIntervalMs(value: number): StreamComponentAllocatedBytesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamComponentAllocatedBytesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamComponentAllocatedBytesRequest): StreamComponentAllocatedBytesRequest.AsObject;
  static serializeBinaryToWriter(message: StreamComponentAllocatedBytesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamComponentAllocatedBytesRequest;
  static deserializeBinaryFromReader(message: StreamComponentAllocatedBytesRequest, reader: jspb.BinaryReader): StreamComponentAllocatedBytesRequest;
}

export namespace StreamComponentAllocatedBytesRequest {
  export type AsObject = {
    intervalMs: number;
  };
}

export class StreamComponentMetricsRequest extends jspb.Message {
  getIntervalMs(): number;
  setIntervalMs(value: number): StreamComponentMetricsRequest;

  getMetric(): MetricName;
  setMetric(value: MetricName): StreamComponentMetricsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamComponentMetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamComponentMetricsRequest): StreamComponentMetricsRequest.AsObject;
  static serializeBinaryToWriter(message: StreamComponentMetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamComponentMetricsRequest;
  static deserializeBinaryFromReader(message: StreamComponentMetricsRequest, reader: jspb.BinaryReader): StreamComponentMetricsRequest;
}

export namespace StreamComponentMetricsRequest {
  export type AsObject = {
    intervalMs: number;
    metric: MetricName;
  };
}

export class TotalMetric extends jspb.Message {
  getValue(): number;
  setValue(value: number): TotalMetric;

  getOutputTotalsMap(): jspb.Map<string, number>;
  clearOutputTotalsMap(): TotalMetric;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TotalMetric.AsObject;
  static toObject(includeInstance: boolean, msg: TotalMetric): TotalMetric.AsObject;
  static serializeBinaryToWriter(message: TotalMetric, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TotalMetric;
  static deserializeBinaryFromReader(message: TotalMetric, reader: jspb.BinaryReader): TotalMetric;
}

export namespace TotalMetric {
  export type AsObject = {
    value: number;
    outputTotalsMap: Array<[string, number]>;
  };
}

export class ThroughputMetric extends jspb.Message {
  getValue(): number;
  setValue(value: number): ThroughputMetric;

  getOutputThroughputsMap(): jspb.Map<string, number>;
  clearOutputThroughputsMap(): ThroughputMetric;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ThroughputMetric.AsObject;
  static toObject(includeInstance: boolean, msg: ThroughputMetric): ThroughputMetric.AsObject;
  static serializeBinaryToWriter(message: ThroughputMetric, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ThroughputMetric;
  static deserializeBinaryFromReader(message: ThroughputMetric, reader: jspb.BinaryReader): ThroughputMetric;
}

export namespace ThroughputMetric {
  export type AsObject = {
    value: number;
    outputThroughputsMap: Array<[string, number]>;
  };
}

export class StreamComponentMetricsResponse extends jspb.Message {
  getComponentId(): string;
  setComponentId(value: string): StreamComponentMetricsResponse;

  getTotal(): TotalMetric | undefined;
  setTotal(value?: TotalMetric): StreamComponentMetricsResponse;
  hasTotal(): boolean;
  clearTotal(): StreamComponentMetricsResponse;

  getThroughput(): ThroughputMetric | undefined;
  setThroughput(value?: ThroughputMetric): StreamComponentMetricsResponse;
  hasThroughput(): boolean;
  clearThroughput(): StreamComponentMetricsResponse;

  getValueCase(): StreamComponentMetricsResponse.ValueCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamComponentMetricsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamComponentMetricsResponse): StreamComponentMetricsResponse.AsObject;
  static serializeBinaryToWriter(message: StreamComponentMetricsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamComponentMetricsResponse;
  static deserializeBinaryFromReader(message: StreamComponentMetricsResponse, reader: jspb.BinaryReader): StreamComponentMetricsResponse;
}

export namespace StreamComponentMetricsResponse {
  export type AsObject = {
    componentId: string;
    total?: TotalMetric.AsObject;
    throughput?: ThroughputMetric.AsObject;
  };

  export enum ValueCase {
    VALUE_NOT_SET = 0,
    TOTAL = 2,
    THROUGHPUT = 3,
  }
}

export class StreamHeartbeatRequest extends jspb.Message {
  getIntervalMs(): number;
  setIntervalMs(value: number): StreamHeartbeatRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamHeartbeatRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamHeartbeatRequest): StreamHeartbeatRequest.AsObject;
  static serializeBinaryToWriter(message: StreamHeartbeatRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamHeartbeatRequest;
  static deserializeBinaryFromReader(message: StreamHeartbeatRequest, reader: jspb.BinaryReader): StreamHeartbeatRequest;
}

export namespace StreamHeartbeatRequest {
  export type AsObject = {
    intervalMs: number;
  };
}

export class StreamHeartbeatResponse extends jspb.Message {
  getUtc(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUtc(value?: google_protobuf_timestamp_pb.Timestamp): StreamHeartbeatResponse;
  hasUtc(): boolean;
  clearUtc(): StreamHeartbeatResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamHeartbeatResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamHeartbeatResponse): StreamHeartbeatResponse.AsObject;
  static serializeBinaryToWriter(message: StreamHeartbeatResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamHeartbeatResponse;
  static deserializeBinaryFromReader(message: StreamHeartbeatResponse, reader: jspb.BinaryReader): StreamHeartbeatResponse;
}

export namespace StreamHeartbeatResponse {
  export type AsObject = {
    utc?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class StreamUptimeRequest extends jspb.Message {
  getIntervalMs(): number;
  setIntervalMs(value: number): StreamUptimeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamUptimeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamUptimeRequest): StreamUptimeRequest.AsObject;
  static serializeBinaryToWriter(message: StreamUptimeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamUptimeRequest;
  static deserializeBinaryFromReader(message: StreamUptimeRequest, reader: jspb.BinaryReader): StreamUptimeRequest;
}

export namespace StreamUptimeRequest {
  export type AsObject = {
    intervalMs: number;
  };
}

export class StreamUptimeResponse extends jspb.Message {
  getUptimeSeconds(): number;
  setUptimeSeconds(value: number): StreamUptimeResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamUptimeResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamUptimeResponse): StreamUptimeResponse.AsObject;
  static serializeBinaryToWriter(message: StreamUptimeResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamUptimeResponse;
  static deserializeBinaryFromReader(message: StreamUptimeResponse, reader: jspb.BinaryReader): StreamUptimeResponse;
}

export namespace StreamUptimeResponse {
  export type AsObject = {
    uptimeSeconds: number;
  };
}

export class StreamComponentAllocatedBytesResponse extends jspb.Message {
  getComponentId(): string;
  setComponentId(value: string): StreamComponentAllocatedBytesResponse;

  getAllocatedBytes(): number;
  setAllocatedBytes(value: number): StreamComponentAllocatedBytesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamComponentAllocatedBytesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamComponentAllocatedBytesResponse): StreamComponentAllocatedBytesResponse.AsObject;
  static serializeBinaryToWriter(message: StreamComponentAllocatedBytesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamComponentAllocatedBytesResponse;
  static deserializeBinaryFromReader(message: StreamComponentAllocatedBytesResponse, reader: jspb.BinaryReader): StreamComponentAllocatedBytesResponse;
}

export namespace StreamComponentAllocatedBytesResponse {
  export type AsObject = {
    componentId: string;
    allocatedBytes: number;
  };
}

export class StreamOutputEventsRequest extends jspb.Message {
  getOutputsPatternsList(): Array<string>;
  setOutputsPatternsList(value: Array<string>): StreamOutputEventsRequest;
  clearOutputsPatternsList(): StreamOutputEventsRequest;
  addOutputsPatterns(value: string, index?: number): StreamOutputEventsRequest;

  getInputsPatternsList(): Array<string>;
  setInputsPatternsList(value: Array<string>): StreamOutputEventsRequest;
  clearInputsPatternsList(): StreamOutputEventsRequest;
  addInputsPatterns(value: string, index?: number): StreamOutputEventsRequest;

  getLimit(): number;
  setLimit(value: number): StreamOutputEventsRequest;

  getIntervalMs(): number;
  setIntervalMs(value: number): StreamOutputEventsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamOutputEventsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamOutputEventsRequest): StreamOutputEventsRequest.AsObject;
  static serializeBinaryToWriter(message: StreamOutputEventsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamOutputEventsRequest;
  static deserializeBinaryFromReader(message: StreamOutputEventsRequest, reader: jspb.BinaryReader): StreamOutputEventsRequest;
}

export namespace StreamOutputEventsRequest {
  export type AsObject = {
    outputsPatternsList: Array<string>;
    inputsPatternsList: Array<string>;
    limit: number;
    intervalMs: number;
  };
}

export class StreamOutputEventsResponse extends jspb.Message {
  getTappedEvent(): TappedEvent | undefined;
  setTappedEvent(value?: TappedEvent): StreamOutputEventsResponse;
  hasTappedEvent(): boolean;
  clearTappedEvent(): StreamOutputEventsResponse;

  getNotification(): EventNotification | undefined;
  setNotification(value?: EventNotification): StreamOutputEventsResponse;
  hasNotification(): boolean;
  clearNotification(): StreamOutputEventsResponse;

  getEventCase(): StreamOutputEventsResponse.EventCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamOutputEventsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: StreamOutputEventsResponse): StreamOutputEventsResponse.AsObject;
  static serializeBinaryToWriter(message: StreamOutputEventsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamOutputEventsResponse;
  static deserializeBinaryFromReader(message: StreamOutputEventsResponse, reader: jspb.BinaryReader): StreamOutputEventsResponse;
}

export namespace StreamOutputEventsResponse {
  export type AsObject = {
    tappedEvent?: TappedEvent.AsObject;
    notification?: EventNotification.AsObject;
  };

  export enum EventCase {
    EVENT_NOT_SET = 0,
    TAPPED_EVENT = 1,
    NOTIFICATION = 2,
  }
}

export class TappedEvent extends jspb.Message {
  getComponentId(): string;
  setComponentId(value: string): TappedEvent;

  getComponentType(): string;
  setComponentType(value: string): TappedEvent;

  getComponentKind(): string;
  setComponentKind(value: string): TappedEvent;

  getEvent(): event_pb.EventWrapper | undefined;
  setEvent(value?: event_pb.EventWrapper): TappedEvent;
  hasEvent(): boolean;
  clearEvent(): TappedEvent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TappedEvent.AsObject;
  static toObject(includeInstance: boolean, msg: TappedEvent): TappedEvent.AsObject;
  static serializeBinaryToWriter(message: TappedEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TappedEvent;
  static deserializeBinaryFromReader(message: TappedEvent, reader: jspb.BinaryReader): TappedEvent;
}

export namespace TappedEvent {
  export type AsObject = {
    componentId: string;
    componentType: string;
    componentKind: string;
    event?: event_pb.EventWrapper.AsObject;
  };
}

export class EventNotification extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): EventNotification;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventNotification.AsObject;
  static toObject(includeInstance: boolean, msg: EventNotification): EventNotification.AsObject;
  static serializeBinaryToWriter(message: EventNotification, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventNotification;
  static deserializeBinaryFromReader(message: EventNotification, reader: jspb.BinaryReader): EventNotification;
}

export namespace EventNotification {
  export type AsObject = {
    message: string;
  };
}

export enum ComponentType {
  COMPONENT_TYPE_UNSPECIFIED = 0,
  COMPONENT_TYPE_SOURCE = 1,
  COMPONENT_TYPE_TRANSFORM = 2,
  COMPONENT_TYPE_SINK = 3,
}
export enum MetricName {
  METRIC_NAME_UNSPECIFIED = 0,
  METRIC_NAME_RECEIVED_EVENTS_THROUGHPUT = 1,
  METRIC_NAME_SENT_EVENTS_THROUGHPUT = 2,
  METRIC_NAME_RECEIVED_BYTES_THROUGHPUT = 3,
  METRIC_NAME_SENT_BYTES_THROUGHPUT = 4,
  METRIC_NAME_RECEIVED_EVENTS_TOTAL = 5,
  METRIC_NAME_SENT_EVENTS_TOTAL = 6,
  METRIC_NAME_RECEIVED_BYTES_TOTAL = 7,
  METRIC_NAME_SENT_BYTES_TOTAL = 8,
  METRIC_NAME_ERRORS_TOTAL = 9,
}
