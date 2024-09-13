import { useQuery } from "@tanstack/react-query";
import useActor from "@/hooks/useActor.js";
import agentService from "@/services/agent.js";

export const useAgentQuery = (username) => {
  const actor = useActor();

  return useQuery({
    queryKey: ["agent", username],
    queryFn: () => agentService.searchUsers(actor, username),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    enabled: username !== "",
  });
};
