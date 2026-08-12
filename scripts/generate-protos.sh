#!/bin/bash

# Ensure output directory exists
mkdir -p src/generated

# Path to the proto files
PROTO_DIR="./proto"

# Generate JS and TS files
protoc -I=$PROTO_DIR $PROTO_DIR/observability.proto \
  --js_out=import_style=commonjs,binary:./src/generated \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/generated

echo "✅ gRPC-Web client generated in src/generated"
