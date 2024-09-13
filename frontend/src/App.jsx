import { useState } from "react";
import "@dialectlabs/blinks/index.css";
import "./index.css";
import { Blink } from "@dialectlabs/blinks";
import { Adapter } from "./Adapter.js";
import { useCanvasClient } from "./hooks/useCanvasClient.js";
import { ACTION_API_URL } from "./constants/index.js";
import { useResizeObserver } from "./hooks/useResizeObserver.js";
import FindCreator from "@/components/FindCreator.jsx";
import FeaturedCreators from "@/components/FeaturedCreators.jsx";
import { Button } from "@/components/ui/button.jsx";
import { useCustomAction } from "@/hooks/useCustomAction.js";
import { Analytics } from "@vercel/analytics/react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion.jsx";

const App = () => {
  const [expandedItems, setExpandedItems] = useState([]);

  const { client, user, isReady } = useCanvasClient();

  useResizeObserver(client);

  let adapter;

  if (isReady) {
    adapter = new Adapter(client);
  }

  const { action, setAction, isLoading, refetch, isLoaded, setIsLoaded } =
    useCustomAction({
      url: ACTION_API_URL,
      adapter,
    });

  if (!action)
    return <Loader2 className="flex justify-center animate-spin w-full mt-8" />;

  const handleRefreshBlinks = async () => {
    setIsLoaded(false);
    await refetch();
  };

  return (
    <div className="flex m-4 flex-col md:flex-row items-center md:justify-center md:items-start">
      <Analytics />
      <div className="flex flex-col max-w-[400px] w-full">
        <Button
          onClick={handleRefreshBlinks}
          className="mb-2 rounded-2xl shadow mt-4 md:mt-0"
        >
          Refresh Blinks
        </Button>
        <div className="relative">
          {isLoaded && action ? (
            <Blink
              action={action}
              websiteText={new URL(action.url).hostname}
              securityLevel="all"
            />
          ) : (
            <div className="rounded-2xl shadow border p-4 flex flex-col items-center">
              <Skeleton className="w-full h-[350px]" />
              <Skeleton className="w-28 h-5 self-start mt-4" />
              <Skeleton className="w-32 h-5 self-start mt-4" />
              <Skeleton className="w-20 h-3 self-start mt-2" />
              <Skeleton className="w-40 h-3 self-start mt-4" />
              <Skeleton className="w-36 h-3 self-start mt-2" />
              <Skeleton className="w-40 h-3 self-start mt-2" />
              <Skeleton className="w-36 h-3 self-start mt-2" />
              <div className="w-full flex gap-3">
                <Skeleton className="w-1/2 h-8 self-start mt-4" />
                <Skeleton className="w-1/2 h-8 self-start mt-4" />
              </div>
              <Skeleton className="w-full h-8 self-start mt-4" />
              <Skeleton className="w-full h-12 self-start mt-4" />
            </div>
          )}
        </div>
      </div>

      <div className="ml-0 my-4 h-full max-w-[400px] md:max-w-md md:ml-4 md:my-0 order-first md:order-last w-full">
        <FindCreator
          className="hidden md:block"
          refetch={refetch}
          setIsLoaded={setIsLoaded}
          user={user}
          setExpandedItems={setExpandedItems}
        />
        <FeaturedCreators
          className="hidden md:block"
          refetch={refetch}
          setIsLoaded={setIsLoaded}
          setExpandedItems={setExpandedItems}
        />
        <Accordion
          className="md:hidden"
          type="multiple"
          collapsible="true"
          value={expandedItems}
          onValueChange={setExpandedItems}
        >
          <AccordionItem value="item-1">
            <AccordionTrigger>Find creator</AccordionTrigger>
            <AccordionContent>
              <FindCreator
                className="block md:block"
                refetch={refetch}
                setIsLoaded={setIsLoaded}
                user={user}
                setExpandedItems={setExpandedItems}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Featured Creators</AccordionTrigger>
            <AccordionContent>
              <FeaturedCreators
                className="block md:block"
                refetch={refetch}
                setIsLoaded={setIsLoaded}
                setExpandedItems={setExpandedItems}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default App;
