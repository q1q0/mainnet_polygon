/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Web3Provider, } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { expect } from "chai";
import config from "../config/config.json";
import RootABI from "../build/contracts/contracts/FxStateRootTunnel.sol/FxStateRootTunnel.json"
import ChildABI from "../build/contracts/contracts/FxStateChildTunnel.sol/FxStateChildTunnel.json"
import StateABI from "../ABI/stateSender.json"
import { POSClient,use } from "@maticnetwork/maticjs"
import { Web3ClientPlugin } from '@maticnetwork/maticjs-ethers'
import HDWalletProvider from "@truffle/hdwallet-provider";

dotenv.config();


const root = "0xfD45A8b3159402d215003eD4df2989E131E1f7Fa";
const child = "0x03CDE5711Abf08BaB5c7e8fD9275F6fE7241e946"
const StateSender = "0xEAa852323826C71cd7920C3b4c007184234c3945"

describe("Multichain Test", function () {

    let account1: SignerWithAddress;
    const etherURL = `https://goerli.infura.io/v3/${process.env.INFURA_KEY}`
    const mumbai = `https://matic-testnet-archive-rpc.bwarelabs.com`

    beforeEach(async function () {

    });

    it("Multichain testing", async function () {

        let provider = new ethers.providers.JsonRpcProvider(etherURL)
        const signer = new ethers.Wallet(
            process.env.PRIVATE_KEY as string,
            provider
        );
        const rootFactory = new ethers.Contract(
            root,
            RootABI.abi,
            signer
        );
        // const stateContract = new ethers.Contract(StateSender, StateABI, signer)

        // console.log("updating ....")
        let tx = await rootFactory.updatePrice("0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6")  // weth address in goerli
        tx = await tx.wait()
        console.log("--------------tx----------------",tx)
        // console.log("update Price now.....")

        // let topic = ethers.utils.id("StateSynced(uint256,address,bytes)");

        // let filter = {
        //     address: root,
        //     topics: [topic]
        // }
        // console.log("-----------------filter on----------------")
        // provider.on(filter, (result) => {
        //     console.log(result)
        // });

        // stateContract.on("StateSynced", async(id, contractAddress, data) => {
        //     console.log("------StateSynced----", id.toString())
        //     console.log(contractAddress)
        //     console.log(data)
        //     console.log("\n")
        //     provider = new ethers.providers.JsonRpcProvider(mumbai)
        //     console.log("=======switching network======")
        //     const signer = new ethers.Wallet(
        //         process.env.PRIVATE_KEY as string,
        //         provider
        //     );
        //     const childContract = new ethers.Contract(
        //         child,
        //         ChildABI.abi,
        //         signer
        //     );
        //     console.log("=======create childContract Instance======")
        //     try{
        //         let tx = await childContract.processMessageFromRoot(id.toString(), root, data)
        //         tx = await tx.wait()
        //         let price = await childContract.UpdatePrice()
        //         console.log("=======price=======",price.toString())
        //     } catch(e) {
        //         console.error("-----error-----", e)
        //     }
        // });

        use(Web3ClientPlugin)

        const posClient = new POSClient();
        provider = new ethers.providers.JsonRpcProvider(etherURL)
        let childProvider = new ethers.providers.JsonRpcProvider(mumbai)

        await posClient.init({
            network: 'testnet',  // 'testnet' or 'mainnet'
            version: 'mumbai', // 'mumbai' or 'v1'
            parent: {
              provider: new HDWalletProvider(process.env.PRIVATE_KEY as string, etherURL),
              defaultConfig: {
                from: root
              }
            },
            child: {
              provider: new HDWalletProvider(process.env.PRIVATE_KEY as string, mumbai),
              defaultConfig: {
                from: child
              }
            },
            log: true
        });
        console.log(tx)
        const res = await posClient.exitUtil.buildPayloadForExit(tx.transactionHash, tx.data, true)
        console.log(res)
    });
});