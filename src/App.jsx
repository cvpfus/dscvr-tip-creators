import { useEffect, useState } from "react";
import Login from "./components/Login.jsx";
import "@dialectlabs/blinks/index.css";
import "./index.css";
import { Action, Blink } from "@dialectlabs/blinks";
import { Adapter } from "./Adapter.js";
import { useCanvasClient } from "./hooks/useCanvasClient.js";
import { ACTION_API_URL } from "./constants/index.js";
import { useResizeObserver } from "./hooks/useResizeObserver.js";
import FindCreator from "@/components/FindCreator.jsx";
import RecommendedCreators from "@/components/RecommendedCreators.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useAction } from "@dialectlabs/blinks";
import { useCustomAction } from "@/hooks/useCustomAction.js";
import { Loader2 } from "lucide-react";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // const [loaded, setIsLoaded] = useState(true);

  const { client, isReady } = useCanvasClient();

  useResizeObserver(client);

  let adapter;

  if (client) {
    adapter = new Adapter(client);
  }

  const { action, setAction, isLoading, refetch, isLoaded, setIsLoaded } =
    useCustomAction({
      url: ACTION_API_URL,
      adapter,
    });

  if (!isLoggedIn)
    return <Login setIsLoggedIn={setIsLoggedIn} adapter={adapter} />;

  if (isLoading)
    return <Loader2 className="flex justify-center animate-spin w-full mt-8" />;

  const handleRefreshBlinks = async () => {
    setIsLoaded(false);
    await refetch();
  };

  return (
    <div className="flex m-4">
      <div className="flex flex-col max-w-[400px] w-full">
        <Button
          onClick={handleRefreshBlinks}
          className="mb-2 rounded-2xl shadow"
          variant="outline"
        >
          Refresh Blinks
        </Button>
        <div className="relative">
          {isLoaded ? (
            <Blink
              action={action}
              websiteText={new URL(ACTION_API_URL).host}
              securityLevel="all"
            />
          ) : (
            <div className="absolute left-1/2 transform translate-x-1/2 top-8">
              <Loader2 className="animate-spin" />
            </div>
          )}
        </div>
      </div>

      <div className="ml-4 h-full">
        <FindCreator refetch={refetch} setIsLoaded={setIsLoaded} />
        <RecommendedCreators refetch={refetch} setIsLoaded={setIsLoaded} />
      </div>
    </div>
  );
};

export default App;
