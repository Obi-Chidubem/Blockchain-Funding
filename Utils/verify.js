const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    try {
        console.log("Verifying Contract...")
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already Veriified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
