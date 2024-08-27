import { useEffect, useState } from "react";
import { Action } from "@dialectlabs/blinks";
import { ACTION_API_URL } from "@/constants/index.js";

export const useCustomAction = ({ url, adapter }) => {
  const [action, setAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);

  const refetch = async (url = ACTION_API_URL) => {
    const newAction = await Action.fetch(url);
    setAction(newAction);
    setIsLoaded(false);
    setTimeout(() => {
      setIsLoaded(true);
    }, 0);
  };

  useEffect(() => {
    setIsLoading(true);
    let ignore = false;

    Action.fetch(url, undefined)
      .then((action) => {
        if (ignore) {
          return;
        }
        setAction(action);
      })
      .catch((e) => {
        console.error("Failed to fetch action", e);
        setAction(null);
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  useEffect(() => {
    action?.setAdapter(adapter);
  }, [action, adapter]);

  return { action, setAction, isLoading, refetch, isLoaded, setIsLoaded };
};
