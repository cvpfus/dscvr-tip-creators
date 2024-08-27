import { useState, useEffect, useRef } from "react";
import { CanvasClient } from "@dscvr-one/canvas-client-sdk";
import { registerCanvasWallet } from "@dscvr-one/canvas-wallet-adapter";

export function useCanvasClient() {
  const [state, setState] = useState({
    client: undefined,
    user: undefined,
    content: undefined,
    isReady: false,
  });
  const initializationStartedRef = useRef(false);

  useEffect(() => {
    if (initializationStartedRef.current) return;

    initializationStartedRef.current = true;

    async function initializeCanvas() {
      const client = new CanvasClient();
      // registerCanvasWallet(client);

      try {
        const response = await client.ready();
        setState({
          client,
          user: response.untrusted.user,
          content: response.untrusted.content,
          isReady: true,
        });
      } catch (_) {
        setState((prev) => ({ ...prev, isReady: true }));
      }
    }

    initializeCanvas();

    return () => {
      if (state.client) {
        state.client.destroy();
      }
    };
  }, []);

  return state;
}
