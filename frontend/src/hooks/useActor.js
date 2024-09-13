import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "@/constants/did.js";
import { AGENT_HOST, CANISTER_ID } from "@/constants/index.js";
import { useMemo } from "react";

const useActor = () => {
  return useMemo(() => {
    const agent = HttpAgent.createSync({
      host: AGENT_HOST,
      verifyQuerySignatures: false,
    });
    return Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });
  }, []);
};

export default useActor;
