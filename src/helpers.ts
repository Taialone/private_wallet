import { Elusiv, SEED_MESSAGE } from "@elusiv/sdk";
import { sign } from "@noble/ed25519";
import { Connection, Keypair } from "@solana/web3.js";

export async function getParams(): Promise<{
  elusiv: Elusiv;
  keyPair: Keypair;
  connection: Connection;
}> {
  const connection = new Connection("https://api.devnet.solana.com");
  // Add your own private key here
  const srk = "4vABrbsmdgki6Ncwkm2YCWPPESQQExBNhnLS1w1sHa4mYdDPv9myuUw2FMXZjMHS8mxwVw6KvigLbc4UHYEXRsKG"
  const buffer = Buffer.from(srk);
  const keyPair = Keypair.fromSecretKey(
    new Uint8Array(buffer)
  );
  const seed = getSignedSeed(keyPair);
  console.log(seed);

  const elusiv = await Elusiv.getElusivInstance(
    seed,
    keyPair.publicKey,
    connection,
    "devnet"
  );

  return {
    elusiv,
    keyPair,
    connection,
  };
}

function getSignedSeed(keyPair: Keypair) {
    return sign(
      Buffer.from(SEED_MESSAGE, "utf-8"),
      keyPair.secretKey.slice(0, 32)
    );
};