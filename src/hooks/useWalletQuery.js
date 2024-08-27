import { useQuery } from "@apollo/client";
import { USER_WALLET_ADDRESS } from "@/queries/index.js";

export const useWalletQuery = (name, isSkipped) => {
  return useQuery(USER_WALLET_ADDRESS, {
    variables: {
      name,
    },
    skip: isSkipped,
  });
};
