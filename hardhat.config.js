require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("hardhat-gas-reporter")

const PRIVATE_KEY = process.env.PRIVATE_KEY

module.exports = {
    solidity: {
        compilers: [{ version: "0.8.17" }, { version: "0.6.6" }],
    },
    networks: {
        goerli: {
            url: process.env.GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    gasReporter: {
        //<- Runs whenever we run a contract call
        enabled: true, //This  gives us how much gas we used in a contract.
        outputFile: "gas-Report.txt", // The gas report wil be sent to this file.
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
        token: "ETH",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}
