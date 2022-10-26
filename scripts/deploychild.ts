import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
import * as dotenv from "dotenv";
import config  from "../config/config.json";

dotenv.config();

async function main() {
  let fxChild;

  const network = await ethers.provider.getNetwork();

  if (network.chainId === 137) {
    // Polygon Mainnet
    fxChild = config.mainnet.fxChild.address;
  } else if (network.chainId === 80001) {
    // Mumbai Testnet
    fxChild = config.testnet.fxChild.address;
  } else {
    return;
  }

  const ERC20 = await ethers.getContractFactory("FxStateChildTunnel");
  const erc20 = await ERC20.deploy(fxChild);
  await erc20.deployTransaction.wait();
  console.log("ERC20ChildTunnel deployed to:", erc20.address);
  let tx = await erc20.setFxRootTunnel("0x557cd0cd1E5adD639f71030D76d413bf041254Ab")
  await tx.wait()
  console.log(
    "npx hardhat verify --network mumbai",
    erc20.address,
    fxChild,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
