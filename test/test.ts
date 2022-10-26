/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import { ethers } from "ethers";
import * as dotenv from "dotenv";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { expect } from "chai";
import RootABI from "../build/contracts/contracts/FxStateRootTunnel.sol/FxStateRootTunnel.json"
import ChildABI from "../build/contracts/contracts/FxStateChildTunnel.sol/FxStateChildTunnel.json"

dotenv.config();


const root = "0x557cd0cd1E5adD639f71030D76d413bf041254Ab";
const child = "0x8F97CF0408bf2711B028E3FDc840ab7ad2567aba"

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
        try {
            console.log("updating ....")
            let tx = await rootFactory.updatePrice("0x75Ab5AB1Eef154C0352Fc31D2428Cef80C7F8B33")  // DAI address in goerli
            tx = await tx.wait()
            console.log("--------------tx----------------", tx)
            console.log("update Price now.....")
            
            const id = BigNumber.from(tx.events[0].args['id']).toString();
            const data = tx.events[0].args['data'];
            console.log("seatId",id, root, data)
            try {
                provider = new ethers.providers.JsonRpcProvider(mumbai)
                const signer = new ethers.Wallet(
                    process.env.PRIVATE_KEY as string,
                    provider
                );
                const childContract = new ethers.Contract(
                    child,
                    ChildABI.abi,
                    signer
                );
                console.log("=======create childContract Instance======")
                let tx = await childContract.processMessageFromRoot(id.toString(), root, data)
                console.log(2)
                tx = await tx.wait()
                let price = await childContract.UpdatePrice()
                console.log("=======price=======", price.toString())
                expect(price).to.be.equal(tx.events[1].args['Price'].toString())
            } catch (e) {
                console.error("-----error-----", e)
            }
        } catch(e) {
            console.log("err---------------", e)
        }
    });
});