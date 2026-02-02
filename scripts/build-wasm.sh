#!/bin/bash
# Build WASM module and copy to public folder

set -e

echo "🦀 Building Rust WASM module..."
cd crates/nufast-wasm
~/.cargo/bin/wasm-pack build --target web --release

echo "📦 Copying WASM to public folder..."
mkdir -p ../../public/wasm
cp pkg/nufast_wasm_bg.wasm ../../public/wasm/
cp pkg/nufast_wasm.js ../../public/wasm/

echo "✅ WASM build complete!"
ls -la ../../public/wasm/
