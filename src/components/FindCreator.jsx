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
import { Ban, CheckCheck } from "lucide-react";
import { ACTION_API_URL } from "@/constants/index.js";

const FindCreator = ({ refetch, setIsLoaded }) => {
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
    if (walletResult && walletResult.wallets.length > 0 && selectedUsername) {
      const handleRefetch = async () => {
        let url = new URL(ACTION_API_URL);
        url.searchParams.set("username", selectedUsername);
        let updatedUrl = url.toString();

        setIsLoaded(false);

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
    }, 4000);
  };

  // console.log(walletQueryResult.data);
  console.log(walletResult);

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Find creator</CardTitle>
        <CardDescription>
          Who's your top creator? Find and tip them now!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <Command className="rounded-xl shadow-sm border">
            <CommandInput
              value={username}
              onChangeCapture={(e) => handleSearch(e)}
              placeholder="username (e.g. cvpfus)"
            />
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
      {selectedUsername && walletResult ? (
        <CardFooter>
          <Alert>
            {walletResult.wallets.length > 0 ? (
              <>
                <CheckCheck className="w-5 h-5 stroke-lime-500" />

                <AlertTitle className="text-lime-500">Wallet found</AlertTitle>
                <AlertDescription>
                  You can now tip the creator. 🤩{" "}
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
                  Frames'.{" "}
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
