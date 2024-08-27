import { gql } from "@apollo/client";
export const USER_WALLET_ADDRESS = gql`
  query ($name: String!) {
    userByName(name: $name) {
      id
      username
      followerCount
      iconUrl
      wallets {
        walletChainType
        walletType
        address
        isPrimary
      }
    }
  }
`;
