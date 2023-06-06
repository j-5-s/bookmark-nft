import { expect, use } from "chai"
import { ethers, waffle } from "hardhat"
import { prepareContracts, prepareSigners } from "./utils/prepare"

use(waffle.solidity)

describe("ERC721 Contract", function () {
    beforeEach(async function () {
        await prepareSigners(this)
        await prepareContracts(this, this.bob)
    })


    describe("Deploy", function () {
      it("should mint contract", async function() {
        expect(await this.contract1.description()).to.equal("description");
      })
      
    });
})
