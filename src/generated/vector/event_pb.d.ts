import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"


export class EventArray extends jspb.Message {
  getLogs(): LogArray | undefined;
  setLogs(value?: LogArray): EventArray;
  hasLogs(): boolean;
  clearLogs(): EventArray;

  getMetrics(): MetricArray | undefined;
  setMetrics(value?: MetricArray): EventArray;
  hasMetrics(): boolean;
  clearMetrics(): EventArray;

  getTraces(): TraceArray | undefined;
  setTraces(value?: TraceArray): EventArray;
  hasTraces(): boolean;
  clearTraces(): EventArray;

  getEventsCase(): EventArray.EventsCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventArray.AsObject;
  static toObject(includeInstance: boolean, msg: EventArray): EventArray.AsObject;
  static serializeBinaryToWriter(message: EventArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventArray;
  static deserializeBinaryFromReader(message: EventArray, reader: jspb.BinaryReader): EventArray;
}

export namespace EventArray {
  export type AsObject = {
    logs?: LogArray.AsObject;
    metrics?: MetricArray.AsObject;
    traces?: TraceArray.AsObject;
  };

  export enum EventsCase {
    EVENTS_NOT_SET = 0,
    LOGS = 1,
    METRICS = 2,
    TRACES = 3,
  }
}

export class LogArray extends jspb.Message {
  getLogsList(): Array<Log>;
  setLogsList(value: Array<Log>): LogArray;
  clearLogsList(): LogArray;
  addLogs(value?: Log, index?: number): Log;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogArray.AsObject;
  static toObject(includeInstance: boolean, msg: LogArray): LogArray.AsObject;
  static serializeBinaryToWriter(message: LogArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogArray;
  static deserializeBinaryFromReader(message: LogArray, reader: jspb.BinaryReader): LogArray;
}

export namespace LogArray {
  export type AsObject = {
    logsList: Array<Log.AsObject>;
  };
}

export class MetricArray extends jspb.Message {
  getMetricsList(): Array<Metric>;
  setMetricsList(value: Array<Metric>): MetricArray;
  clearMetricsList(): MetricArray;
  addMetrics(value?: Metric, index?: number): Metric;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MetricArray.AsObject;
  static toObject(includeInstance: boolean, msg: MetricArray): MetricArray.AsObject;
  static serializeBinaryToWriter(message: MetricArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MetricArray;
  static deserializeBinaryFromReader(message: MetricArray, reader: jspb.BinaryReader): MetricArray;
}

export namespace MetricArray {
  export type AsObject = {
    metricsList: Array<Metric.AsObject>;
  };
}

export class TraceArray extends jspb.Message {
  getTracesList(): Array<Trace>;
  setTracesList(value: Array<Trace>): TraceArray;
  clearTracesList(): TraceArray;
  addTraces(value?: Trace, index?: number): Trace;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TraceArray.AsObject;
  static toObject(includeInstance: boolean, msg: TraceArray): TraceArray.AsObject;
  static serializeBinaryToWriter(message: TraceArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TraceArray;
  static deserializeBinaryFromReader(message: TraceArray, reader: jspb.BinaryReader): TraceArray;
}

export namespace TraceArray {
  export type AsObject = {
    tracesList: Array<Trace.AsObject>;
  };
}

export class EventWrapper extends jspb.Message {
  getLog(): Log | undefined;
  setLog(value?: Log): EventWrapper;
  hasLog(): boolean;
  clearLog(): EventWrapper;

  getMetric(): Metric | undefined;
  setMetric(value?: Metric): EventWrapper;
  hasMetric(): boolean;
  clearMetric(): EventWrapper;

  getTrace(): Trace | undefined;
  setTrace(value?: Trace): EventWrapper;
  hasTrace(): boolean;
  clearTrace(): EventWrapper;

  getEventCase(): EventWrapper.EventCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventWrapper.AsObject;
  static toObject(includeInstance: boolean, msg: EventWrapper): EventWrapper.AsObject;
  static serializeBinaryToWriter(message: EventWrapper, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventWrapper;
  static deserializeBinaryFromReader(message: EventWrapper, reader: jspb.BinaryReader): EventWrapper;
}

export namespace EventWrapper {
  export type AsObject = {
    log?: Log.AsObject;
    metric?: Metric.AsObject;
    trace?: Trace.AsObject;
  };

  export enum EventCase {
    EVENT_NOT_SET = 0,
    LOG = 1,
    METRIC = 2,
    TRACE = 3,
  }
}

export class Log extends jspb.Message {
  getFieldsMap(): jspb.Map<string, Value>;
  clearFieldsMap(): Log;

  getValue(): Value | undefined;
  setValue(value?: Value): Log;
  hasValue(): boolean;
  clearValue(): Log;

  getMetadata(): Value | undefined;
  setMetadata(value?: Value): Log;
  hasMetadata(): boolean;
  clearMetadata(): Log;

  getMetadataFull(): Metadata | undefined;
  setMetadataFull(value?: Metadata): Log;
  hasMetadataFull(): boolean;
  clearMetadataFull(): Log;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Log.AsObject;
  static toObject(includeInstance: boolean, msg: Log): Log.AsObject;
  static serializeBinaryToWriter(message: Log, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Log;
  static deserializeBinaryFromReader(message: Log, reader: jspb.BinaryReader): Log;
}

export namespace Log {
  export type AsObject = {
    fieldsMap: Array<[string, Value.AsObject]>;
    value?: Value.AsObject;
    metadata?: Value.AsObject;
    metadataFull?: Metadata.AsObject;
  };
}

export class Trace extends jspb.Message {
  getFieldsMap(): jspb.Map<string, Value>;
  clearFieldsMap(): Trace;

  getMetadata(): Value | undefined;
  setMetadata(value?: Value): Trace;
  hasMetadata(): boolean;
  clearMetadata(): Trace;

  getMetadataFull(): Metadata | undefined;
  setMetadataFull(value?: Metadata): Trace;
  hasMetadataFull(): boolean;
  clearMetadataFull(): Trace;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Trace.AsObject;
  static toObject(includeInstance: boolean, msg: Trace): Trace.AsObject;
  static serializeBinaryToWriter(message: Trace, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Trace;
  static deserializeBinaryFromReader(message: Trace, reader: jspb.BinaryReader): Trace;
}

export namespace Trace {
  export type AsObject = {
    fieldsMap: Array<[string, Value.AsObject]>;
    metadata?: Value.AsObject;
    metadataFull?: Metadata.AsObject;
  };
}

export class ValueMap extends jspb.Message {
  getFieldsMap(): jspb.Map<string, Value>;
  clearFieldsMap(): ValueMap;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValueMap.AsObject;
  static toObject(includeInstance: boolean, msg: ValueMap): ValueMap.AsObject;
  static serializeBinaryToWriter(message: ValueMap, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValueMap;
  static deserializeBinaryFromReader(message: ValueMap, reader: jspb.BinaryReader): ValueMap;
}

export namespace ValueMap {
  export type AsObject = {
    fieldsMap: Array<[string, Value.AsObject]>;
  };
}

export class ValueArray extends jspb.Message {
  getItemsList(): Array<Value>;
  setItemsList(value: Array<Value>): ValueArray;
  clearItemsList(): ValueArray;
  addItems(value?: Value, index?: number): Value;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValueArray.AsObject;
  static toObject(includeInstance: boolean, msg: ValueArray): ValueArray.AsObject;
  static serializeBinaryToWriter(message: ValueArray, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValueArray;
  static deserializeBinaryFromReader(message: ValueArray, reader: jspb.BinaryReader): ValueArray;
}

export namespace ValueArray {
  export type AsObject = {
    itemsList: Array<Value.AsObject>;
  };
}

export class Value extends jspb.Message {
  getRawBytes(): Uint8Array | string;
  getRawBytes_asU8(): Uint8Array;
  getRawBytes_asB64(): string;
  setRawBytes(value: Uint8Array | string): Value;
  hasRawBytes(): boolean;
  clearRawBytes(): Value;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Value;
  hasTimestamp(): boolean;
  clearTimestamp(): Value;

  getInteger(): number;
  setInteger(value: number): Value;
  hasInteger(): boolean;
  clearInteger(): Value;

  getFloat(): number;
  setFloat(value: number): Value;
  hasFloat(): boolean;
  clearFloat(): Value;

  getBoolean(): boolean;
  setBoolean(value: boolean): Value;
  hasBoolean(): boolean;
  clearBoolean(): Value;

  getMap(): ValueMap | undefined;
  setMap(value?: ValueMap): Value;
  hasMap(): boolean;
  clearMap(): Value;

  getArray(): ValueArray | undefined;
  setArray(value?: ValueArray): Value;
  hasArray(): boolean;
  clearArray(): Value;

  getNull(): ValueNull;
  setNull(value: ValueNull): Value;
  hasNull(): boolean;
  clearNull(): Value;

  getKindCase(): Value.KindCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Value.AsObject;
  static toObject(includeInstance: boolean, msg: Value): Value.AsObject;
  static serializeBinaryToWriter(message: Value, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Value;
  static deserializeBinaryFromReader(message: Value, reader: jspb.BinaryReader): Value;
}

export namespace Value {
  export type AsObject = {
    rawBytes?: Uint8Array | string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    integer?: number;
    pb_float?: number;
    pb_boolean?: boolean;
    map?: ValueMap.AsObject;
    array?: ValueArray.AsObject;
    pb_null?: ValueNull;
  };

  export enum KindCase {
    KIND_NOT_SET = 0,
    RAW_BYTES = 1,
    TIMESTAMP = 2,
    INTEGER = 4,
    FLOAT = 5,
    BOOLEAN = 6,
    MAP = 7,
    ARRAY = 8,
    NULL = 9,
  }
}

export class DatadogOriginMetadata extends jspb.Message {
  getOriginProduct(): number;
  setOriginProduct(value: number): DatadogOriginMetadata;
  hasOriginProduct(): boolean;
  clearOriginProduct(): DatadogOriginMetadata;

  getOriginCategory(): number;
  setOriginCategory(value: number): DatadogOriginMetadata;
  hasOriginCategory(): boolean;
  clearOriginCategory(): DatadogOriginMetadata;

  getOriginService(): number;
  setOriginService(value: number): DatadogOriginMetadata;
  hasOriginService(): boolean;
  clearOriginService(): DatadogOriginMetadata;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DatadogOriginMetadata.AsObject;
  static toObject(includeInstance: boolean, msg: DatadogOriginMetadata): DatadogOriginMetadata.AsObject;
  static serializeBinaryToWriter(message: DatadogOriginMetadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DatadogOriginMetadata;
  static deserializeBinaryFromReader(message: DatadogOriginMetadata, reader: jspb.BinaryReader): DatadogOriginMetadata;
}

export namespace DatadogOriginMetadata {
  export type AsObject = {
    originProduct?: number;
    originCategory?: number;
    originService?: number;
  };

  export enum OriginProductCase {
    _ORIGIN_PRODUCT_NOT_SET = 0,
    ORIGIN_PRODUCT = 1,
  }

  export enum OriginCategoryCase {
    _ORIGIN_CATEGORY_NOT_SET = 0,
    ORIGIN_CATEGORY = 2,
  }

  export enum OriginServiceCase {
    _ORIGIN_SERVICE_NOT_SET = 0,
    ORIGIN_SERVICE = 3,
  }
}

export class Secrets extends jspb.Message {
  getEntriesMap(): jspb.Map<string, string>;
  clearEntriesMap(): Secrets;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Secrets.AsObject;
  static toObject(includeInstance: boolean, msg: Secrets): Secrets.AsObject;
  static serializeBinaryToWriter(message: Secrets, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Secrets;
  static deserializeBinaryFromReader(message: Secrets, reader: jspb.BinaryReader): Secrets;
}

export namespace Secrets {
  export type AsObject = {
    entriesMap: Array<[string, string]>;
  };
}

export class OutputId extends jspb.Message {
  getComponent(): string;
  setComponent(value: string): OutputId;

  getPort(): string;
  setPort(value: string): OutputId;
  hasPort(): boolean;
  clearPort(): OutputId;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OutputId.AsObject;
  static toObject(includeInstance: boolean, msg: OutputId): OutputId.AsObject;
  static serializeBinaryToWriter(message: OutputId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OutputId;
  static deserializeBinaryFromReader(message: OutputId, reader: jspb.BinaryReader): OutputId;
}

export namespace OutputId {
  export type AsObject = {
    component: string;
    port?: string;
  };

  export enum PortCase {
    _PORT_NOT_SET = 0,
    PORT = 2,
  }
}

export class Metadata extends jspb.Message {
  getValue(): Value | undefined;
  setValue(value?: Value): Metadata;
  hasValue(): boolean;
  clearValue(): Metadata;

  getDatadogOriginMetadata(): DatadogOriginMetadata | undefined;
  setDatadogOriginMetadata(value?: DatadogOriginMetadata): Metadata;
  hasDatadogOriginMetadata(): boolean;
  clearDatadogOriginMetadata(): Metadata;

  getSourceId(): string;
  setSourceId(value: string): Metadata;
  hasSourceId(): boolean;
  clearSourceId(): Metadata;

  getSourceType(): string;
  setSourceType(value: string): Metadata;
  hasSourceType(): boolean;
  clearSourceType(): Metadata;

  getUpstreamId(): OutputId | undefined;
  setUpstreamId(value?: OutputId): Metadata;
  hasUpstreamId(): boolean;
  clearUpstreamId(): Metadata;

  getSecrets(): Secrets | undefined;
  setSecrets(value?: Secrets): Metadata;
  hasSecrets(): boolean;
  clearSecrets(): Metadata;

  getSourceEventId(): Uint8Array | string;
  getSourceEventId_asU8(): Uint8Array;
  getSourceEventId_asB64(): string;
  setSourceEventId(value: Uint8Array | string): Metadata;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Metadata.AsObject;
  static toObject(includeInstance: boolean, msg: Metadata): Metadata.AsObject;
  static serializeBinaryToWriter(message: Metadata, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Metadata;
  static deserializeBinaryFromReader(message: Metadata, reader: jspb.BinaryReader): Metadata;
}

export namespace Metadata {
  export type AsObject = {
    value?: Value.AsObject;
    datadogOriginMetadata?: DatadogOriginMetadata.AsObject;
    sourceId?: string;
    sourceType?: string;
    upstreamId?: OutputId.AsObject;
    secrets?: Secrets.AsObject;
    sourceEventId: Uint8Array | string;
  };

  export enum SourceIdCase {
    _SOURCE_ID_NOT_SET = 0,
    SOURCE_ID = 3,
  }

  export enum SourceTypeCase {
    _SOURCE_TYPE_NOT_SET = 0,
    SOURCE_TYPE = 4,
  }
}

export class Metric extends jspb.Message {
  getName(): string;
  setName(value: string): Metric;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): Metric;
  hasTimestamp(): boolean;
  clearTimestamp(): Metric;

  getTagsV1Map(): jspb.Map<string, string>;
  clearTagsV1Map(): Metric;

  getTagsV2Map(): jspb.Map<string, TagValues>;
  clearTagsV2Map(): Metric;

  getKind(): Metric.Kind;
  setKind(value: Metric.Kind): Metric;

  getCounter(): Counter | undefined;
  setCounter(value?: Counter): Metric;
  hasCounter(): boolean;
  clearCounter(): Metric;

  getGauge(): Gauge | undefined;
  setGauge(value?: Gauge): Metric;
  hasGauge(): boolean;
  clearGauge(): Metric;

  getSet(): Set | undefined;
  setSet(value?: Set): Metric;
  hasSet(): boolean;
  clearSet(): Metric;

  getDistribution1(): Distribution1 | undefined;
  setDistribution1(value?: Distribution1): Metric;
  hasDistribution1(): boolean;
  clearDistribution1(): Metric;

  getAggregatedHistogram1(): AggregatedHistogram1 | undefined;
  setAggregatedHistogram1(value?: AggregatedHistogram1): Metric;
  hasAggregatedHistogram1(): boolean;
  clearAggregatedHistogram1(): Metric;

  getAggregatedSummary1(): AggregatedSummary1 | undefined;
  setAggregatedSummary1(value?: AggregatedSummary1): Metric;
  hasAggregatedSummary1(): boolean;
  clearAggregatedSummary1(): Metric;

  getDistribution2(): Distribution2 | undefined;
  setDistribution2(value?: Distribution2): Metric;
  hasDistribution2(): boolean;
  clearDistribution2(): Metric;

  getAggregatedHistogram2(): AggregatedHistogram2 | undefined;
  setAggregatedHistogram2(value?: AggregatedHistogram2): Metric;
  hasAggregatedHistogram2(): boolean;
  clearAggregatedHistogram2(): Metric;

  getAggregatedSummary2(): AggregatedSummary2 | undefined;
  setAggregatedSummary2(value?: AggregatedSummary2): Metric;
  hasAggregatedSummary2(): boolean;
  clearAggregatedSummary2(): Metric;

  getSketch(): Sketch | undefined;
  setSketch(value?: Sketch): Metric;
  hasSketch(): boolean;
  clearSketch(): Metric;

  getAggregatedHistogram3(): AggregatedHistogram3 | undefined;
  setAggregatedHistogram3(value?: AggregatedHistogram3): Metric;
  hasAggregatedHistogram3(): boolean;
  clearAggregatedHistogram3(): Metric;

  getAggregatedSummary3(): AggregatedSummary3 | undefined;
  setAggregatedSummary3(value?: AggregatedSummary3): Metric;
  hasAggregatedSummary3(): boolean;
  clearAggregatedSummary3(): Metric;

  getNamespace(): string;
  setNamespace(value: string): Metric;

  getIntervalMs(): number;
  setIntervalMs(value: number): Metric;

  getMetadata(): Value | undefined;
  setMetadata(value?: Value): Metric;
  hasMetadata(): boolean;
  clearMetadata(): Metric;

  getMetadataFull(): Metadata | undefined;
  setMetadataFull(value?: Metadata): Metric;
  hasMetadataFull(): boolean;
  clearMetadataFull(): Metric;

  getValueCase(): Metric.ValueCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Metric.AsObject;
  static toObject(includeInstance: boolean, msg: Metric): Metric.AsObject;
  static serializeBinaryToWriter(message: Metric, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Metric;
  static deserializeBinaryFromReader(message: Metric, reader: jspb.BinaryReader): Metric;
}

export namespace Metric {
  export type AsObject = {
    name: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    tagsV1Map: Array<[string, string]>;
    tagsV2Map: Array<[string, TagValues.AsObject]>;
    kind: Metric.Kind;
    counter?: Counter.AsObject;
    gauge?: Gauge.AsObject;
    set?: Set.AsObject;
    distribution1?: Distribution1.AsObject;
    aggregatedHistogram1?: AggregatedHistogram1.AsObject;
    aggregatedSummary1?: AggregatedSummary1.AsObject;
    distribution2?: Distribution2.AsObject;
    aggregatedHistogram2?: AggregatedHistogram2.AsObject;
    aggregatedSummary2?: AggregatedSummary2.AsObject;
    sketch?: Sketch.AsObject;
    aggregatedHistogram3?: AggregatedHistogram3.AsObject;
    aggregatedSummary3?: AggregatedSummary3.AsObject;
    namespace: string;
    intervalMs: number;
    metadata?: Value.AsObject;
    metadataFull?: Metadata.AsObject;
  };

  export enum Kind {
    INCREMENTAL = 0,
    ABSOLUTE = 1,
  }

  export enum ValueCase {
    VALUE_NOT_SET = 0,
    COUNTER = 5,
    GAUGE = 6,
    SET = 7,
    DISTRIBUTION1 = 8,
    AGGREGATED_HISTOGRAM1 = 9,
    AGGREGATED_SUMMARY1 = 10,
    DISTRIBUTION2 = 12,
    AGGREGATED_HISTOGRAM2 = 13,
    AGGREGATED_SUMMARY2 = 14,
    SKETCH = 15,
    AGGREGATED_HISTOGRAM3 = 16,
    AGGREGATED_SUMMARY3 = 17,
  }
}

export class TagValues extends jspb.Message {
  getValuesList(): Array<TagValue>;
  setValuesList(value: Array<TagValue>): TagValues;
  clearValuesList(): TagValues;
  addValues(value?: TagValue, index?: number): TagValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TagValues.AsObject;
  static toObject(includeInstance: boolean, msg: TagValues): TagValues.AsObject;
  static serializeBinaryToWriter(message: TagValues, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TagValues;
  static deserializeBinaryFromReader(message: TagValues, reader: jspb.BinaryReader): TagValues;
}

export namespace TagValues {
  export type AsObject = {
    valuesList: Array<TagValue.AsObject>;
  };
}

export class TagValue extends jspb.Message {
  getValue(): string;
  setValue(value: string): TagValue;
  hasValue(): boolean;
  clearValue(): TagValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TagValue.AsObject;
  static toObject(includeInstance: boolean, msg: TagValue): TagValue.AsObject;
  static serializeBinaryToWriter(message: TagValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TagValue;
  static deserializeBinaryFromReader(message: TagValue, reader: jspb.BinaryReader): TagValue;
}

export namespace TagValue {
  export type AsObject = {
    value?: string;
  };

  export enum ValueCase {
    _VALUE_NOT_SET = 0,
    VALUE = 1,
  }
}

export class Counter extends jspb.Message {
  getValue(): number;
  setValue(value: number): Counter;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Counter.AsObject;
  static toObject(includeInstance: boolean, msg: Counter): Counter.AsObject;
  static serializeBinaryToWriter(message: Counter, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Counter;
  static deserializeBinaryFromReader(message: Counter, reader: jspb.BinaryReader): Counter;
}

export namespace Counter {
  export type AsObject = {
    value: number;
  };
}

export class Gauge extends jspb.Message {
  getValue(): number;
  setValue(value: number): Gauge;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Gauge.AsObject;
  static toObject(includeInstance: boolean, msg: Gauge): Gauge.AsObject;
  static serializeBinaryToWriter(message: Gauge, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Gauge;
  static deserializeBinaryFromReader(message: Gauge, reader: jspb.BinaryReader): Gauge;
}

export namespace Gauge {
  export type AsObject = {
    value: number;
  };
}

export class Set extends jspb.Message {
  getValuesList(): Array<string>;
  setValuesList(value: Array<string>): Set;
  clearValuesList(): Set;
  addValues(value: string, index?: number): Set;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Set.AsObject;
  static toObject(includeInstance: boolean, msg: Set): Set.AsObject;
  static serializeBinaryToWriter(message: Set, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Set;
  static deserializeBinaryFromReader(message: Set, reader: jspb.BinaryReader): Set;
}

export namespace Set {
  export type AsObject = {
    valuesList: Array<string>;
  };
}

export class Distribution1 extends jspb.Message {
  getValuesList(): Array<number>;
  setValuesList(value: Array<number>): Distribution1;
  clearValuesList(): Distribution1;
  addValues(value: number, index?: number): Distribution1;

  getSampleRatesList(): Array<number>;
  setSampleRatesList(value: Array<number>): Distribution1;
  clearSampleRatesList(): Distribution1;
  addSampleRates(value: number, index?: number): Distribution1;

  getStatistic(): StatisticKind;
  setStatistic(value: StatisticKind): Distribution1;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Distribution1.AsObject;
  static toObject(includeInstance: boolean, msg: Distribution1): Distribution1.AsObject;
  static serializeBinaryToWriter(message: Distribution1, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Distribution1;
  static deserializeBinaryFromReader(message: Distribution1, reader: jspb.BinaryReader): Distribution1;
}

export namespace Distribution1 {
  export type AsObject = {
    valuesList: Array<number>;
    sampleRatesList: Array<number>;
    statistic: StatisticKind;
  };
}

export class Distribution2 extends jspb.Message {
  getSamplesList(): Array<DistributionSample>;
  setSamplesList(value: Array<DistributionSample>): Distribution2;
  clearSamplesList(): Distribution2;
  addSamples(value?: DistributionSample, index?: number): DistributionSample;

  getStatistic(): StatisticKind;
  setStatistic(value: StatisticKind): Distribution2;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Distribution2.AsObject;
  static toObject(includeInstance: boolean, msg: Distribution2): Distribution2.AsObject;
  static serializeBinaryToWriter(message: Distribution2, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Distribution2;
  static deserializeBinaryFromReader(message: Distribution2, reader: jspb.BinaryReader): Distribution2;
}

export namespace Distribution2 {
  export type AsObject = {
    samplesList: Array<DistributionSample.AsObject>;
    statistic: StatisticKind;
  };
}

export class DistributionSample extends jspb.Message {
  getValue(): number;
  setValue(value: number): DistributionSample;

  getRate(): number;
  setRate(value: number): DistributionSample;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DistributionSample.AsObject;
  static toObject(includeInstance: boolean, msg: DistributionSample): DistributionSample.AsObject;
  static serializeBinaryToWriter(message: DistributionSample, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DistributionSample;
  static deserializeBinaryFromReader(message: DistributionSample, reader: jspb.BinaryReader): DistributionSample;
}

export namespace DistributionSample {
  export type AsObject = {
    value: number;
    rate: number;
  };
}

export class AggregatedHistogram1 extends jspb.Message {
  getBucketsList(): Array<number>;
  setBucketsList(value: Array<number>): AggregatedHistogram1;
  clearBucketsList(): AggregatedHistogram1;
  addBuckets(value: number, index?: number): AggregatedHistogram1;

  getCountsList(): Array<number>;
  setCountsList(value: Array<number>): AggregatedHistogram1;
  clearCountsList(): AggregatedHistogram1;
  addCounts(value: number, index?: number): AggregatedHistogram1;

  getCount(): number;
  setCount(value: number): AggregatedHistogram1;

  getSum(): number;
  setSum(value: number): AggregatedHistogram1;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedHistogram1.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedHistogram1): AggregatedHistogram1.AsObject;
  static serializeBinaryToWriter(message: AggregatedHistogram1, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedHistogram1;
  static deserializeBinaryFromReader(message: AggregatedHistogram1, reader: jspb.BinaryReader): AggregatedHistogram1;
}

export namespace AggregatedHistogram1 {
  export type AsObject = {
    bucketsList: Array<number>;
    countsList: Array<number>;
    count: number;
    sum: number;
  };
}

export class AggregatedHistogram2 extends jspb.Message {
  getBucketsList(): Array<HistogramBucket>;
  setBucketsList(value: Array<HistogramBucket>): AggregatedHistogram2;
  clearBucketsList(): AggregatedHistogram2;
  addBuckets(value?: HistogramBucket, index?: number): HistogramBucket;

  getCount(): number;
  setCount(value: number): AggregatedHistogram2;

  getSum(): number;
  setSum(value: number): AggregatedHistogram2;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedHistogram2.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedHistogram2): AggregatedHistogram2.AsObject;
  static serializeBinaryToWriter(message: AggregatedHistogram2, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedHistogram2;
  static deserializeBinaryFromReader(message: AggregatedHistogram2, reader: jspb.BinaryReader): AggregatedHistogram2;
}

export namespace AggregatedHistogram2 {
  export type AsObject = {
    bucketsList: Array<HistogramBucket.AsObject>;
    count: number;
    sum: number;
  };
}

export class AggregatedHistogram3 extends jspb.Message {
  getBucketsList(): Array<HistogramBucket3>;
  setBucketsList(value: Array<HistogramBucket3>): AggregatedHistogram3;
  clearBucketsList(): AggregatedHistogram3;
  addBuckets(value?: HistogramBucket3, index?: number): HistogramBucket3;

  getCount(): number;
  setCount(value: number): AggregatedHistogram3;

  getSum(): number;
  setSum(value: number): AggregatedHistogram3;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedHistogram3.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedHistogram3): AggregatedHistogram3.AsObject;
  static serializeBinaryToWriter(message: AggregatedHistogram3, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedHistogram3;
  static deserializeBinaryFromReader(message: AggregatedHistogram3, reader: jspb.BinaryReader): AggregatedHistogram3;
}

export namespace AggregatedHistogram3 {
  export type AsObject = {
    bucketsList: Array<HistogramBucket3.AsObject>;
    count: number;
    sum: number;
  };
}

export class HistogramBucket extends jspb.Message {
  getUpperLimit(): number;
  setUpperLimit(value: number): HistogramBucket;

  getCount(): number;
  setCount(value: number): HistogramBucket;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistogramBucket.AsObject;
  static toObject(includeInstance: boolean, msg: HistogramBucket): HistogramBucket.AsObject;
  static serializeBinaryToWriter(message: HistogramBucket, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistogramBucket;
  static deserializeBinaryFromReader(message: HistogramBucket, reader: jspb.BinaryReader): HistogramBucket;
}

export namespace HistogramBucket {
  export type AsObject = {
    upperLimit: number;
    count: number;
  };
}

export class HistogramBucket3 extends jspb.Message {
  getUpperLimit(): number;
  setUpperLimit(value: number): HistogramBucket3;

  getCount(): number;
  setCount(value: number): HistogramBucket3;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistogramBucket3.AsObject;
  static toObject(includeInstance: boolean, msg: HistogramBucket3): HistogramBucket3.AsObject;
  static serializeBinaryToWriter(message: HistogramBucket3, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistogramBucket3;
  static deserializeBinaryFromReader(message: HistogramBucket3, reader: jspb.BinaryReader): HistogramBucket3;
}

export namespace HistogramBucket3 {
  export type AsObject = {
    upperLimit: number;
    count: number;
  };
}

export class AggregatedSummary1 extends jspb.Message {
  getQuantilesList(): Array<number>;
  setQuantilesList(value: Array<number>): AggregatedSummary1;
  clearQuantilesList(): AggregatedSummary1;
  addQuantiles(value: number, index?: number): AggregatedSummary1;

  getValuesList(): Array<number>;
  setValuesList(value: Array<number>): AggregatedSummary1;
  clearValuesList(): AggregatedSummary1;
  addValues(value: number, index?: number): AggregatedSummary1;

  getCount(): number;
  setCount(value: number): AggregatedSummary1;

  getSum(): number;
  setSum(value: number): AggregatedSummary1;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedSummary1.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedSummary1): AggregatedSummary1.AsObject;
  static serializeBinaryToWriter(message: AggregatedSummary1, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedSummary1;
  static deserializeBinaryFromReader(message: AggregatedSummary1, reader: jspb.BinaryReader): AggregatedSummary1;
}

export namespace AggregatedSummary1 {
  export type AsObject = {
    quantilesList: Array<number>;
    valuesList: Array<number>;
    count: number;
    sum: number;
  };
}

export class AggregatedSummary2 extends jspb.Message {
  getQuantilesList(): Array<SummaryQuantile>;
  setQuantilesList(value: Array<SummaryQuantile>): AggregatedSummary2;
  clearQuantilesList(): AggregatedSummary2;
  addQuantiles(value?: SummaryQuantile, index?: number): SummaryQuantile;

  getCount(): number;
  setCount(value: number): AggregatedSummary2;

  getSum(): number;
  setSum(value: number): AggregatedSummary2;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedSummary2.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedSummary2): AggregatedSummary2.AsObject;
  static serializeBinaryToWriter(message: AggregatedSummary2, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedSummary2;
  static deserializeBinaryFromReader(message: AggregatedSummary2, reader: jspb.BinaryReader): AggregatedSummary2;
}

export namespace AggregatedSummary2 {
  export type AsObject = {
    quantilesList: Array<SummaryQuantile.AsObject>;
    count: number;
    sum: number;
  };
}

export class AggregatedSummary3 extends jspb.Message {
  getQuantilesList(): Array<SummaryQuantile>;
  setQuantilesList(value: Array<SummaryQuantile>): AggregatedSummary3;
  clearQuantilesList(): AggregatedSummary3;
  addQuantiles(value?: SummaryQuantile, index?: number): SummaryQuantile;

  getCount(): number;
  setCount(value: number): AggregatedSummary3;

  getSum(): number;
  setSum(value: number): AggregatedSummary3;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AggregatedSummary3.AsObject;
  static toObject(includeInstance: boolean, msg: AggregatedSummary3): AggregatedSummary3.AsObject;
  static serializeBinaryToWriter(message: AggregatedSummary3, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AggregatedSummary3;
  static deserializeBinaryFromReader(message: AggregatedSummary3, reader: jspb.BinaryReader): AggregatedSummary3;
}

export namespace AggregatedSummary3 {
  export type AsObject = {
    quantilesList: Array<SummaryQuantile.AsObject>;
    count: number;
    sum: number;
  };
}

export class SummaryQuantile extends jspb.Message {
  getQuantile(): number;
  setQuantile(value: number): SummaryQuantile;

  getValue(): number;
  setValue(value: number): SummaryQuantile;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SummaryQuantile.AsObject;
  static toObject(includeInstance: boolean, msg: SummaryQuantile): SummaryQuantile.AsObject;
  static serializeBinaryToWriter(message: SummaryQuantile, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SummaryQuantile;
  static deserializeBinaryFromReader(message: SummaryQuantile, reader: jspb.BinaryReader): SummaryQuantile;
}

export namespace SummaryQuantile {
  export type AsObject = {
    quantile: number;
    value: number;
  };
}

export class Sketch extends jspb.Message {
  getAgentDdSketch(): Sketch.AgentDDSketch | undefined;
  setAgentDdSketch(value?: Sketch.AgentDDSketch): Sketch;
  hasAgentDdSketch(): boolean;
  clearAgentDdSketch(): Sketch;

  getSketchCase(): Sketch.SketchCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Sketch.AsObject;
  static toObject(includeInstance: boolean, msg: Sketch): Sketch.AsObject;
  static serializeBinaryToWriter(message: Sketch, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Sketch;
  static deserializeBinaryFromReader(message: Sketch, reader: jspb.BinaryReader): Sketch;
}

export namespace Sketch {
  export type AsObject = {
    agentDdSketch?: Sketch.AgentDDSketch.AsObject;
  };

  export class AgentDDSketch extends jspb.Message {
    getCount(): number;
    setCount(value: number): AgentDDSketch;

    getMin(): number;
    setMin(value: number): AgentDDSketch;

    getMax(): number;
    setMax(value: number): AgentDDSketch;

    getSum(): number;
    setSum(value: number): AgentDDSketch;

    getAvg(): number;
    setAvg(value: number): AgentDDSketch;

    getKList(): Array<number>;
    setKList(value: Array<number>): AgentDDSketch;
    clearKList(): AgentDDSketch;
    addK(value: number, index?: number): AgentDDSketch;

    getNList(): Array<number>;
    setNList(value: Array<number>): AgentDDSketch;
    clearNList(): AgentDDSketch;
    addN(value: number, index?: number): AgentDDSketch;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AgentDDSketch.AsObject;
    static toObject(includeInstance: boolean, msg: AgentDDSketch): AgentDDSketch.AsObject;
    static serializeBinaryToWriter(message: AgentDDSketch, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AgentDDSketch;
    static deserializeBinaryFromReader(message: AgentDDSketch, reader: jspb.BinaryReader): AgentDDSketch;
  }

  export namespace AgentDDSketch {
    export type AsObject = {
      count: number;
      min: number;
      max: number;
      sum: number;
      avg: number;
      kList: Array<number>;
      nList: Array<number>;
    };
  }


  export enum SketchCase {
    SKETCH_NOT_SET = 0,
    AGENT_DD_SKETCH = 1,
  }
}

export enum ValueNull {
  NULL_VALUE = 0,
}
export enum StatisticKind {
  HISTOGRAM = 0,
  SUMMARY = 1,
}
