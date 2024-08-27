import { CanvasClient } from "@dscvr-one/canvas-client-sdk";
import * as base58 from "bs58";
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";

const CANVAS_CHAIN_ID = "solana:103";
const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const base64tobase58 = (base64) => {
  return base58.encode(Buffer.from(base64, "base64"));
};

const parseTransaction = (base58Tx) => {
  const txUint8Array = base58.decode(base58Tx);

  try {
    return VersionedTransaction.deserialize(txUint8Array);
  } catch (error) {
    console.error("Error parsing transaction:", error);
    return null;
  }
};

const addMemoTracker = async (base64Tx, address) => {
  let base58Tx = base64tobase58(base64Tx);

  try {
    const tx = parseTransaction(base58Tx);

    //can't compose already signed transactions
    let isSigned = tx.signatures.some((sig) => sig.some((s) => s > 0));
    if (isSigned) {
      return base58Tx;
    }

    //handle tx with lookup tables later
    if (tx.message.addressTableLookups.length > 0) {
      return base58Tx;
    }

    const txMessage = TransactionMessage.decompile(tx.message);
    txMessage.instructions.push(
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from("dscvr.one", "utf8"),
        keys: [
          {
            pubkey: new PublicKey(address),
            isSigner: true,
            isWritable: false,
          },
        ],
      }),
    );

    const newMessage =
      tx.version === "legacy"
        ? txMessage.compileToLegacyMessage()
        : txMessage.compileToV0Message();

    let newTx = new VersionedTransaction(newMessage);

    const serializedNewTransaction = newTx.serialize();

    if (serializedNewTransaction.byteLength > 1232) {
      return base58Tx;
    }
    return base58.encode(serializedNewTransaction);
  } catch (error) {
    console.error("Error adding memo tracker:", error);
    return base58Tx;
  }
};

export class Adapter {
  constructor(canvasClient, chainId = CANVAS_CHAIN_ID) {
    if (!canvasClient) {
      this.canvasClient = new CanvasClient();
      this.canvasClient.ready().then(() => {
        console.log("Canvas client ready");
      });
    } else {
      this.canvasClient = canvasClient;
    }

    this.chainId = chainId;
  }

  connect = async (_) => {
    try {
      if (!this.canvasClient) {
        throw new Error("Canvas client not initialized");
      }

      let response = await this.canvasClient.connectWallet(this.chainId);
      if (!response?.untrusted.success) {
        throw new Error("Failed to connect wallet");
      }
      this.address = response.untrusted.address;
      return response.untrusted.address;
    } catch (error) {
      console.error("Connection error:", error);
      return null;
    }
  };

  signTransaction = async (tx, _) => {
    try {
      console.log("signTransaction", tx, this.address);
      const results = await this.canvasClient.signAndSendTransaction({
        unsignedTx: await addMemoTracker(tx, this.address),
        awaitCommitment: "confirmed",
        chainId: this.chainId,
      });

      if (!results?.untrusted.success) {
        throw new Error("Failed to sign transaction");
      }
      return { signature: results.untrusted.signedTx };
    } catch (error) {
      console.error("Transaction signing error:", error);
      return { error: "Failed to sign transaction" };
    }
  };

  confirmTransaction = async (_, __) => {
    try {
      return new Promise((resolve, ___) => {
        setTimeout(() => {
          resolve(true);
        }, 5000);
      });
    } catch (error) {
      console.error("Transaction confirmation error:", error);
    }
  };
}
