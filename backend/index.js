import express from "express";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createPostResponse, actionCorsMiddleware } from "@solana/actions";
import {

  DEFAULT_SOL_AMOUNT,
  DEFAULT_SOL_ADDRESS,
  PORT,
  SOLANA_USERS,
} from "./constants/index.js";
import { getUserInfo } from "./services/userService.js";
import { shuffleArray } from "./utils/shuffleArray.js";
import { formatFollowerCount } from "./utils/formatFollowerCount.js";

const connection = new Connection(clusterApiUrl("devnet"));

const app = express();
app.use(express.json());

app.use(actionCorsMiddleware());

// Routes
app.get("/actions.json", getActionsJson);
app.get("/api/actions/tip-sol", getTipSol);
app.post("/api/actions/tip-sol", postTipSol);

// Route handlers
function getActionsJson(req, res) {
  const payload = {
    rules: [
      { pathPattern: "/*", apiPath: "/api/actions/*" },
      { pathPattern: "/api/actions/**", apiPath: "/api/actions/**" },
    ],
  };
  res.json(payload);
}

async function getTipSol(req, res) {
  try {
    const { userInfo } = await validatedGetQueryParams(req.query);
    console.log(userInfo);

    const baseHref = `/api/actions/tip-sol?to=${userInfo.address}`;

    let bio = "";
    if (userInfo.bio) {
      bio = userInfo.bio;
    }

    const description = `${formatFollowerCount(
      userInfo.followerCount
    )} followers${bio ? "\n\n" : ""}${bio}`;

    const minimumTipLamports =
      await connection.getMinimumBalanceForRentExemption(0);

    const minimumTipSol = minimumTipLamports / LAMPORTS_PER_SOL;

    const payload = {
      type: "action",
      title: `${userInfo.username} on DSCVR`,
      icon: userInfo.iconUrl,
      description,
      links: {
        actions: [
          { label: "Tip 0.01 SOL", href: `${baseHref}&amount=0.01` },
          { label: "Tip 0.1 SOL", href: `${baseHref}&amount=0.1` },
          { label: "Tip 1 SOL", href: `${baseHref}&amount=1` },
          {
            label: "Send Tip",
            href: `${baseHref}&amount={amount}`,
            parameters: [
              {
                name: "amount",
                label: "Enter custom amount",
                required: true,
                type: "number",
                min: minimumTipSol, 
              },
            ],
          },
        ],
      },
    };

    res.json(payload);
  } catch (err) {
    console.error(err?.message);
    res.status(500).json({ message: err?.message || err });
  }
}

async function postTipSol(req, res) {
  try {
    const { amount, toPubkey } = validatedPostQueryParams(req.query);
    const { account } = req.body;

    if (!account) {
      throw new Error('Invalid "account" provided');
    }

    const fromPubkey = new PublicKey(account);
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0
    );

    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw new Error(`Account may not be rent exempt: ${toPubkey.toBase58()}`);
    }

    // create an instruction to transfer native SOL from one wallet to another
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: fromPubkey,
      toPubkey: toPubkey,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // create a legacy transaction
    const transaction = new Transaction({
      feePayer: fromPubkey,
      blockhash,
      lastValidBlockHeight,
    }).add(transferSolInstruction);

    const payload = await createPostResponse({
      fields: {
        transaction,
        message: `You've tipped ${amount} SOL to ${toPubkey.toBase58()}`,
      },
    });

    res.json(payload);
  } catch (err) {
    res.status(400).json({ error: err.message || "An unknown error occurred" });
  }
}

async function validatedGetQueryParams(query) {
  let userInfo;
  let userIcon;

  if (query.username) {
    const response = await getUserInfo(query.username);

    if (response.data.errors || !response.data.data.userByName)
      throw new Error("Error fetching user info");

    const userByName = response.data.data.userByName;
    const userWallets = userByName.wallets;
    userIcon = userByName.iconUrl;

    if (!userIcon) {
      userIcon = `https://ui-avatars.com/api/?name=${query.username}&size=256&background=random`;
    }

    if (userWallets.length === 0)
      throw new Error("User has not paired the wallet");

    const userSolanaWallet = userWallets.find(
      (wallet) => wallet.walletChainType === "solana" && wallet.isPrimary
    );

    if (!userSolanaWallet) throw new Error("Wallet chain is not supported");

    userInfo = {
      username: userByName.username,
      bio: userByName.bio,
      followerCount: userByName.followerCount,
      address: userSolanaWallet.address,
      iconUrl: userIcon,
    };
  } else {
    const selectedUser = shuffleArray(SOLANA_USERS)[0];
    const response = await getUserInfo(selectedUser);
    const userByName = response.data.data.userByName;
    const userWallets = userByName.wallets;
    userIcon = userByName.iconUrl;

    if (!userIcon) {
      userIcon = `https://ui-avatars.com/api/?name=${userByName.username}&size=256&background=random`;
    }

    const userSolanaWallet = userWallets.find(
      (wallet) => wallet.walletChainType === "solana" && wallet.isPrimary
    );

    userInfo = {
      username: userByName.username,
      bio: userByName.bio,
      followerCount: userByName.followerCount,
      address: userSolanaWallet.address,
      iconUrl: userIcon,
    };
  }

  return { userInfo };
}

function validatedPostQueryParams(query) {
  let toPubkey = new PublicKey(DEFAULT_SOL_ADDRESS);
  let amount = DEFAULT_SOL_AMOUNT;

  if (query.to) {
    try {
      toPubkey = new PublicKey(query.to);
    } catch (err) {
      throw new Error("Invalid input query parameter: to");
    }
  }

  try {
    if (query.amount) {
      amount = parseFloat(query.amount);
    }
    if (amount <= 0) throw new Error("amount is too small");
  } catch (err) {
    throw new Error("Invalid input query parameter: amount");
  }

  return { toPubkey, amount };
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
