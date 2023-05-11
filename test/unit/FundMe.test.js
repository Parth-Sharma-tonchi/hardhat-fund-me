const { getNamedAccounts, ethers, deployments } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1"); // 1 ETH
          beforeEach(async function () {
              // deploy fundme contract
              //using hardhat-deploy
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });
          describe("fund", async function () {
              it("Fails if not sending enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough!"
                  );
              });
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddresstoAmountFunded(
                      deployer
                  );
                  assert.equal(sendValue.toString(), response.toString());
              });
              it("Adds funder to Funder array", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });
              it("withdraws the ETH sent by funder", async function () {
                  //
                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const tracsactionReceipt = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = tracsactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingfundmeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  assert.equal(endingfundmeBalance, 0);
                  // Don't use startDeployerBalance + startFundMeBalance because it's a big number.
                  assert.equal(
                      startDeployerBalance.add(startFundMeBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("allows us to withdraw with multiple Funders", async function () {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Act
                  const transactionResponse = await fundMe.withdraw();
                  const tracsactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = tracsactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const endingfundmeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  assert.equal(endingfundmeBalance.toString(), 0);
                  assert.equal(
                      startFundMeBalance.add(startDeployerBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddresstoAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("cheaper withdraw calling...", async function () {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const tracsactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = tracsactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  const endingfundmeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  assert.equal(endingfundmeBalance.toString(), 0);
                  assert.equal(
                      startFundMeBalance.add(startDeployerBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddresstoAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
              it("Only allows owner to withdraw funds", async () => {
                  const accounts = await ethers.getSigners();
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted;
              });
          });
      });
