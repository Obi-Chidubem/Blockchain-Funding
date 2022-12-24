//<- A test for only the local or hardhat network
const { deployments, ethers, getNamedAccounts, network } = require("hardhat") //<- We call this so that we can use it to deploy our contract.
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          //<- This tells us what we are going to be working on and then what we will do to it.
          let FundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") // <- This is a way to add ethereum without conversion needed
          beforeEach(async function () {
              //<- This will happen before each of the it's below
              // const accounts =  ethers,getSigners() <- Another way to get teh acount privatekey from our hardhat config
              deployer = (await getNamedAccounts()).deployer //<- This will immediately tell us which account is deploying this contract.
              await deployments.fixture(["all"]) //<- This is gotten from the tags in the deploy files. it deploy's everything in deploy folder with just this one line.
              FundMe = await ethers.getContract("FundMe", deployer) //<- This returns the most recently deployed iteration of the signified contract
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await FundMe.getPriceFeed() //<- most variables can be called like functions in the tests.
                  assert.equal(response, mockV3Aggregator.address) //<- Passes the test if 'response' is equal to mockV3Aggregator.address
              })
          })
          describe("fund", async function () {
              it("fails if you don't send enough eth", async function () {
                  await expect(FundMe.fund()).to.be.revertedWith("Not enough")
              })
              it("updates the amount funded data structure", async function () {
                  await FundMe.fund({ value: sendValue })
                  const response = await FundMe.getSendertoAmountMapping(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("adds funder to the array of getFunder", async () => {
                  await FundMe.fund({ value: sendValue })
                  const response = await FundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", async () => {
              beforeEach(async () => {
                  await FundMe.fund({ value: sendValue }) // this costs gas
              })

              it("withdraw ETH from a single founder", async () => {
                  // Arrange
                  const startingFundmeBalance =
                      await FundMe.provider.getBalance(
                          FundMe.address //<- returns the balance of this address in the Fundme contract
                      )
                  const deployerStartingBalance =
                      await FundMe.provider.getBalance(deployer)
                  // Act
                  const withdrawResponse = await FundMe.withdraw() // this costs gas
                  const transactionReciept = await withdrawResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice) // Don't forget to multiply these two whenever you are trying t get gas cost

                  const endingFundmeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundmeBalance, 0)
                  assert.equal(
                      startingFundmeBalance
                          .add(deployerStartingBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("withdraw with multiple getFunder", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners() // This allows us to retrieve all the accounts from the hardhat node
                  for (let i = 1; i < 6; i++) {
                      // Start from one here because the zero'th account is taken by the deployer.
                      const fundmeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundmeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundmeBalance =
                      await FundMe.provider.getBalance(
                          FundMe.address //<- returns the balance of this address in the Fundme contract
                      )
                  const deployerStartingBalance =
                      await FundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponse = await FundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundmeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundmeBalance, 0)
                  assert.equal(
                      startingFundmeBalance
                          .add(deployerStartingBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(FundMe.getFunder(0)).to.be.reverted //checking if the deployer in the getFunder array is set back to zero
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getSendertoAmountMapping(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const alien = accounts[1]
                  const aliencontract = await FundMe.connect(alien) // This helps to run the sontract locally using the acounts[1]
                  await expect(
                      aliencontract.withdraw()
                  ).to.be.revertedWithCustomError(
                      aliencontract,
                      "FundMe__NotOwner"
                  )
              })

              it("cheaperWithdraw ETH from a single founder", async () => {
                  // Arrange
                  const startingFundmeBalance =
                      await FundMe.provider.getBalance(
                          FundMe.address //<- returns the balance of this address in the Fundme contract
                      )
                  const deployerStartingBalance =
                      await FundMe.provider.getBalance(deployer)
                  // Act
                  const withdrawResponse = await FundMe.cheaperWithdraw() // this costs gas
                  const transactionReciept = await withdrawResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice) // Don't forget to multiply these two whenever you are trying t get gas cost

                  const endingFundmeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundmeBalance, 0)
                  assert.equal(
                      startingFundmeBalance
                          .add(deployerStartingBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Runs a cheaper withdrawal", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners() // This allows us to retrieve all the accounts from the hardhat node
                  for (let i = 1; i < 6; i++) {
                      // Start from one here because the zero'th account is taken by the deployer.
                      const fundmeConnectedContract = await FundMe.connect(
                          accounts[i]
                      )
                      await fundmeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundmeBalance =
                      await FundMe.provider.getBalance(
                          FundMe.address //<- returns the balance of this address in the Fundme contract
                      )
                  const deployerStartingBalance =
                      await FundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponse = await FundMe.cheaperWithdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundmeBalance = await FundMe.provider.getBalance(
                      FundMe.address
                  )
                  const endingDeployerBalance =
                      await FundMe.provider.getBalance(deployer)

                  // Assert
                  assert.equal(endingFundmeBalance, 0)
                  assert.equal(
                      startingFundmeBalance
                          .add(deployerStartingBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(FundMe.getFunder(0)).to.be.reverted //checking if the deployer in the getFunder array is set back to zero
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await FundMe.getSendertoAmountMapping(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
