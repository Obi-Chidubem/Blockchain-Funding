const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat") // This imports the network type that you ar curently working with.
const { verify } = require("../Utils/verify")
require("dotenv").config()

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre //<- This means hardhat runtime environment
    const { deploy, log } = deployments // deploy can be gotten only from the deployments module.
    const { deployer } = await getNamedAccounts() //<- This returns the account address that deployed this contract.
    const chainId = network.config.chainId

    //------------------To choose between local or live network------------------
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator") // We get the mock contract from the mockdeployer.
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //------------------------------------------------------------------------------

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // This goes into the contructor arguement of the specified contracts (FundMe in this case)
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //----------------------Verification of the contract---------------------------
    // This only works if it is a testnet or a mainnet. Not a localnet
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }

    //----------------------------------------------------------------------------

    log(
        "-----------------------------------------------------------------------------------"
    )
}

module.exports.tags = ["all", "fundme"]
