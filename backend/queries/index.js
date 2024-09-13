export const DSCVR_USER = `
    query ($username: String!) {
      userByName(name: $username) {
        id
        username
        bio
        followerCount
        wallets {
          walletChainType
          walletType
          address
          isPrimary
        }
        iconUrl
      }
    }
`