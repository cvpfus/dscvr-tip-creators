import { useEffect, useRef, useState } from "react";

export const useResizeObserver = (canvasClient) => {
  const resizeObserverRef = useRef(null);
  const lastHeightRef = useRef(0);

  useEffect(() => {
    if (canvasClient) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (document.body.offsetHeight > lastHeightRef.current) {
          canvasClient.resize();
          lastHeightRef.current = document.body.offsetHeight;
        }
      });
      resizeObserverRef.current.observe(document.body);

      return () => {
        resizeObserverRef.current.disconnect();
        canvasClient.destroy();
      };
    }
  }, [canvasClient]);
};
