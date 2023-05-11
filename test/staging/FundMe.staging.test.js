const { getNamedAccounts, network, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          const sendValue = ethers.utils.parseEther("0.07");
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("fund and withdraws balance", async function () {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingfundmeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingfundmeBalance.toString(), "0");
          });
      });
