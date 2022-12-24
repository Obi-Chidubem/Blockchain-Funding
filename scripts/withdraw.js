const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Withdrawing....")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait("1") //<- Use this and the transactionReciept mainly in the scripts.
    console.log("Done")
}

main() //<- Use only when you aren't inerested in exporting the modules using module.export.
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
