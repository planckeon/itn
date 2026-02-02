import { useState, useEffect, memo } from "react";
import { onWasmStateChange, getWasmLoadingState } from "../physics/wasmBridge";

/**
 * Shows a subtle loading indicator while WASM is initializing.
 * Disappears once WASM is ready or after fallback is activated.
 */
const WasmLoadingIndicator = memo(() => {
  const [state, setState] = useState(getWasmLoadingState());
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onWasmStateChange((newState) => {
      setState(newState);
      
      if (newState === 'loading') {
        setVisible(true);
        setFadeOut(false);
      } else if (newState === 'ready' || newState === 'failed') {
        // Fade out after a brief delay
        setFadeOut(true);
        setTimeout(() => setVisible(false), 500);
      }
    });
    
    return unsubscribe;
  }, []);

  if (!visible) return null;

  const statusText = state === 'loading' 
    ? '⚡ Loading physics engine...'
    : state === 'ready'
    ? '✓ Physics engine ready'
    : '⚠ Using fallback engine';

  const statusColor = state === 'loading'
    ? 'text-blue-400'
    : state === 'ready'
    ? 'text-green-400'
    : 'text-amber-400';

  return (
    <div
      className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        fadeOut ? 'opacity-0 translate-y-[-10px]' : 'opacity-100'
      }`}
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium"
        style={{
          background: 'rgba(20, 20, 30, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {state === 'loading' && (
          <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
        )}
        <span className={statusColor}>{statusText}</span>
      </div>
    </div>
  );
});

WasmLoadingIndicator.displayName = "WasmLoadingIndicator";

export default WasmLoadingIndicator;
