import { useEffect, useRef } from "react";

export const useResizeObserver = (canvasClient) => {
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    if (canvasClient) {
      resizeObserverRef.current = new ResizeObserver(() =>
        canvasClient.resize(),
      );
      resizeObserverRef.current.observe(document.body);

      return () => {
        resizeObserverRef.current.disconnect();
        canvasClient.destroy();
      };
    }
  }, [canvasClient]);
};
