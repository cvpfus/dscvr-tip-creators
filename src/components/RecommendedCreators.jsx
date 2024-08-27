import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.jsx";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command.jsx";
import { Button } from "@/components/ui/button.jsx";
import { RefreshCw, Loader2 } from "lucide-react";
import { ACTION_API_URL, SOLANA_USERS } from "@/constants/index.js";
import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";
import { USER_WALLET_ADDRESS } from "@/queries/index.js";
import { formatFollowerCount, shuffleArray } from "@/lib/utils.js";

const RecommendedCreators = ({ refetch, setIsLoaded }) => {
  const [results, setResults] = useState([]);
  const [topTen, setTopTen] = useState([]);
  const [execute] = useLazyQuery(USER_WALLET_ADDRESS);

  useEffect(() => {
    const queryAll = async () => {
      const results = await Promise.all(
        shuffleArray(SOLANA_USERS).map((user) =>
          execute({ variables: { name: user } }),
        ),
      );
      const filteredResults = results
        .filter((res) => res.data)
        .map((res) => res.data.userByName);

      const topTenCreators = filteredResults.slice(0, 10);

      setTopTen(topTenCreators);
      setResults(filteredResults);
    };

    queryAll();
  }, [USER_WALLET_ADDRESS]);

  const handleRefresh = () => {
    const topTen = shuffleArray(results).slice(0, 10);
    setTopTen(topTen);
  };

  const handleUserClick = async (username) => {
    let url = new URL(ACTION_API_URL);
    url.searchParams.set("username", username);
    let updatedUrl = url.toString();

    setIsLoaded(false);

    await refetch(updatedUrl);
  };

  return (
    <Card className="rounded-2xl mt-4">
      <CardHeader>
        <CardTitle>Featured creators</CardTitle>
        <CardDescription>
          Don't know which creator to tip? See featured creators below.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          onClick={handleRefresh}
          className="self-center p-2"
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
        {topTen.length === 0 && (
          <Loader2 className="animate-spin self-center mt-4" />
        )}

        <Command>
          <CommandList>
            <CommandGroup>
              {topTen
                ? topTen.map((user, index) => (
                    <CommandItem
                      key={user.username}
                      className="hover:cursor-pointer"
                      onClickCapture={() => handleUserClick(user.username)}
                    >
                      <div className="flex gap-2 items-center">
                        <div className="min-w-5">{index + 1}.</div>
                        <img
                          src={
                            user.iconUrl
                              ? user.iconUrl
                              : `https://ui-avatars.com/api/?name=${user.username}&size=256&background=random`
                          }
                          alt="avatar"
                          className="overflow-hidden rounded-full w-9 h-9"
                        />
                        <div>
                          <h4 className="text-sm font-semibold">
                            {user.username}
                          </h4>
                          <h5 className="text-xs">{`${formatFollowerCount(user.followerCount)} followers`}</h5>
                        </div>
                      </div>
                    </CommandItem>
                  ))
                : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </CardContent>
    </Card>
  );
};

export default RecommendedCreators;
