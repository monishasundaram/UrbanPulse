import fs from "fs";

async function main() {
  console.log("Deploying GrievanceRegistry...");

  const { createWalletClient, createPublicClient, http } = await import("viem");
  const { hardhat } = await import("viem/chains");
  const { privateKeyToAccount } = await import("viem/accounts");

  // Use first hardhat test account
  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );

  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http("http://127.0.0.1:8545"),
  });

  // Read contract artifacts
  const artifact = JSON.parse(
    fs.readFileSync(
      "./artifacts/contracts/GrievanceRegistry.sol/GrievanceRegistry.json",
      "utf8"
    )
  );

  // Deploy contract
  const hash = await walletClient.deployContract({
    abi: artifact.abi,
    bytecode: artifact.bytecode,
    args: [],
  });

  console.log("Transaction hash:", hash);

  // Wait for deployment
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("GrievanceRegistry deployed to:", receipt.contractAddress);

  fs.writeFileSync(
    "./contract-address.json",
    JSON.stringify({ address: receipt.contractAddress }, null, 2)
  );
  console.log("✅ Contract address saved to contract-address.json!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
