import { config } from "dotenv";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Goerli } from "@thirdweb-dev/chains";
import { LocalWalletNode } from "@thirdweb-dev/wallets/evm/wallets/local-wallet-node";
import { SmartWallet, SmartWalletConfig } from "@thirdweb-dev/wallets";

config();

const chain = Guapcoinx;
const factoryAddress = "0x32A35267fFf9319bE3b07A75a0A6aC053d902745"; // AccountFactory
const secretKey = process.env.THIRDWEB_SECRET_KEY as string;

const main = async () => {
  if (!secretKey) {
    throw new Error(
      "No API Key found, get one from https://thirdweb.com/dashboard"
    );
  }
  console.log("Running on", chain.slug, "with factory", factoryAddress);

  // ---- Connecting to a Smart Wallet ----

  // Load or create personal wallet
  const adminWallet = new LocalWalletNode();
  await adminWallet.loadOrCreate({
    strategy: "encryptedJson",
    password: "password",
  });
  const adminWalletAddress = await adminWallet.getAddress();
  console.log("Admin wallet address:", adminWalletAddress);

  // Configure the smart wallet
  const config: SmartWalletConfig = {
    chain,
    factoryAddress,
    secretKey,
    gasless: true,
  };

  // Connect the smart wallet
  const smartWallet = new SmartWallet(config);
  await smartWallet.connect({
    personalWallet: adminWallet,
  });

  // ---- Using the Smart Wallet ----

  // Use the SDK normally to perform transactions with the smart wallet
  const sdk = await ThirdwebSDK.fromWallet(smartWallet, chain, {
    secretKey: secretKey,
  });

  console.log("Smart Account address:", await sdk.wallet.getAddress());
  console.log("Balance:", (await sdk.wallet.balance()).displayValue);

  // ---- Creating Session Keys ---- (This section is optional and can be removed if you don't need session keys)

  console.log("-------------------------");

  // Generate a session key that can be used by the smart wallet
  const sessionWallet = new LocalWalletNode();
  sessionWallet.generate();
  const sessionKey = await sessionWallet.getAddress();

  console.log("Creating Session key:", sessionKey);

  await smartWallet.createSessionKey(sessionKey);

  console.log("Session key added successfully!");

  // Fetch all signers on the smart wallet
  let signers = await smartWallet.getAllActiveSigners();
  console.log("Smart wallet now has", signers.length, "active signers");

  // Revoking session key (This is also optional)
  console.log("Revoking Session key:", sessionKey);
  await smartWallet.revokeSessionKey(sessionKey);

  console.log("Session key revoked successfully!");
  signers = await smartWallet.getAllActiveSigners();
  console.log("Smart wallet now has", signers.length, "active signer");
};

main();
