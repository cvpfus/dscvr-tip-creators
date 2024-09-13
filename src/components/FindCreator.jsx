import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.jsx";
import { useEffect, useRef, useState } from "react";
import { useAgentQuery } from "@/hooks/useAgentQuery.js";
import { useWalletQuery } from "@/hooks/useWalletQuery.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.jsx";
import { Ban, CheckCheck, Loader2 } from "lucide-react";
import { ACTION_API_URL } from "@/constants/index.js";
import { cn } from "@/lib/utils.js";

const FindCreator = ({
  refetch,
  setIsLoaded,
  user,
  setExpandedItems,
  className,
}) => {
  const [username, setUsername] = useState("");
  const [selectedUsername, setSelectedUsername] = useState(null);

  const userQueryResult = useAgentQuery(username);

  const walletQueryResult = useWalletQuery(selectedUsername, !selectedUsername);

  const timeoutRef = useRef(null);

  const searchResult = userQueryResult.data ? userQueryResult.data : null;

  let walletResult = walletQueryResult.data
    ? walletQueryResult.data?.userByName
    : null;

  if (walletQueryResult.error) {
    walletResult = {
      wallets: [],
    };
  }

  useEffect(() => {
    if (
      walletResult &&
      walletResult.wallets.length > 0 &&
      selectedUsername &&
      selectedUsername !== user?.username
    ) {
      const handleRefetch = async () => {
        let url = new URL(ACTION_API_URL);
        url.searchParams.set("username", selectedUsername);
        let updatedUrl = url.toString();

        setIsLoaded(false);

        setExpandedItems([]);

        await refetch(updatedUrl);
      };

      handleRefetch();
    }
  }, [walletResult, selectedUsername]);

  const handleSearch = ({ target }) => {
    setUsername(target.value);
    setSelectedUsername("");
  };

  const handleUserClick = (user) => {
    setSelectedUsername(user);
    setUsername("");

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setSelectedUsername("");
    }, 5000);
  };

  return (
    <Card className={cn("rounded-2xl", className)}>
      <CardHeader>
        <CardTitle>Find creator</CardTitle>
        <CardDescription>
          Who's your top creator? Find and tip them now!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Command className="rounded-xl shadow-sm border relative">
            <CommandInput
              value={username}
              onChangeCapture={(e) => handleSearch(e)}
              placeholder="username (e.g. cvpfus)"
            />
            {selectedUsername &&
              selectedUsername !== user?.username &&
              !walletResult && (
                <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin" />
                </div>
              )}

            {!searchResult && username && (
              <div className="flex justify-center py-1">
                <Loader2 className="animate-spin w-4 h-4" />
              </div>
            )}

            <CommandList>
              {searchResult && username ? (
                <CommandGroup>
                  {searchResult.map((user) => {
                    return (
                      <CommandItem
                        key={user.username}
                        className="hover:cursor-pointer"
                        onClickCapture={() => handleUserClick(user.username)}
                      >
                        {user.username}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </div>
      </CardContent>
      {selectedUsername === user?.username && (
        <CardFooter>
          <Alert>
            <Ban className="w-5 h-5 stroke-red-500" />
            <AlertTitle className="text-red-500">Oops!</AlertTitle>
            <AlertDescription>You can't tip to yourself. 😆</AlertDescription>
          </Alert>
        </CardFooter>
      )}
      {selectedUsername &&
      selectedUsername !== user?.username &&
      walletResult ? (
        <CardFooter>
          <Alert>
            {walletResult.wallets.length > 0 ? (
              <>
                <CheckCheck className="w-5 h-5 stroke-lime-500" />

                <AlertTitle className="text-lime-500">Wallet found</AlertTitle>
                <AlertDescription>
                  You can now tip the creator. 🤩
                </AlertDescription>
              </>
            ) : (
              <>
                <Ban className="w-5 h-5 stroke-red-500" />
                <AlertTitle className="text-red-500">
                  Wallet not found
                </AlertTitle>
                <AlertDescription>
                  The creator needs to pair their wallet or enable 'Allow
                  Frames'.
                </AlertDescription>
              </>
            )}
          </Alert>
        </CardFooter>
      ) : null}
    </Card>
  );
};

export default FindCreator;
