const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

//This script is running the mocks inside of the mocks folder. Don't take them out, you dummy.

const DECIMALS = 8 // This is necessary because of the mockAggregator we wil be using.
const INITIAL_ANSWER = 200000000000

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deplying Mocks.")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks Deployed.")
        log(
            "------------------------------------------------------------------------------------"
        )
    }
}

module.exports.tags = ["all", "mocks"]
