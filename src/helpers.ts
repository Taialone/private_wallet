import { Elusiv, SEED_MESSAGE } from "@elusiv/sdk";
import { sign } from "@noble/ed25519";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
// import base58 from 'base-58';

export async function getParams(): Promise<{
  elusiv: Elusiv;
  keyPair: Keypair;
  connection: Connection;
}> {
  const connection = new Connection("https://api.devnet.solana.com");
  // Add your own private key here
  const bs58 = require('bs58');
  const secretKeyString = '3YE5C9T7ec4zkDuMqY18YrW9y39JaRxMyL3AJpRtGbkMdzf9CtqT75MVmUpB43xdUJRbB2dpVcoX6U9i2b3a7vnA'
  const secretKey = bs58.decode(secretKeyString)
   const keyPair = Keypair.fromSecretKey(
    new Uint8Array(secretKey)
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