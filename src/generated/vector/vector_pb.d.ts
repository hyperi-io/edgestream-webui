import * as jspb from 'google-protobuf'

import * as event_pb from './event_pb'; // proto import: "event.proto"


export class PushEventsRequest extends jspb.Message {
  getEventsList(): Array<event_pb.EventWrapper>;
  setEventsList(value: Array<event_pb.EventWrapper>): PushEventsRequest;
  clearEventsList(): PushEventsRequest;
  addEvents(value?: event_pb.EventWrapper, index?: number): event_pb.EventWrapper;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PushEventsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PushEventsRequest): PushEventsRequest.AsObject;
  static serializeBinaryToWriter(message: PushEventsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PushEventsRequest;
  static deserializeBinaryFromReader(message: PushEventsRequest, reader: jspb.BinaryReader): PushEventsRequest;
}

export namespace PushEventsRequest {
  export type AsObject = {
    eventsList: Array<event_pb.EventWrapper.AsObject>;
  };
}

export class PushEventsResponse extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PushEventsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PushEventsResponse): PushEventsResponse.AsObject;
  static serializeBinaryToWriter(message: PushEventsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PushEventsResponse;
  static deserializeBinaryFromReader(message: PushEventsResponse, reader: jspb.BinaryReader): PushEventsResponse;
}

export namespace PushEventsResponse {
  export type AsObject = {
  };
}

export class HealthCheckRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HealthCheckRequest.AsObject;
  static toObject(includeInstance: boolean, msg: HealthCheckRequest): HealthCheckRequest.AsObject;
  static serializeBinaryToWriter(message: HealthCheckRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HealthCheckRequest;
  static deserializeBinaryFromReader(message: HealthCheckRequest, reader: jspb.BinaryReader): HealthCheckRequest;
}

export namespace HealthCheckRequest {
  export type AsObject = {
  };
}

export class HealthCheckResponse extends jspb.Message {
  getStatus(): ServingStatus;
  setStatus(value: ServingStatus): HealthCheckResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HealthCheckResponse.AsObject;
  static toObject(includeInstance: boolean, msg: HealthCheckResponse): HealthCheckResponse.AsObject;
  static serializeBinaryToWriter(message: HealthCheckResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HealthCheckResponse;
  static deserializeBinaryFromReader(message: HealthCheckResponse, reader: jspb.BinaryReader): HealthCheckResponse;
}

export namespace HealthCheckResponse {
  export type AsObject = {
    status: ServingStatus;
  };
}

export enum ServingStatus {
  SERVING = 0,
  NOT_SERVING = 1,
}
