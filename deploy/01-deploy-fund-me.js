// traditionally we do.
//imports
//async main
//calling main

//but now with hardhat-deploy-ethers
//we can do this
//async function deployfunc(){
//     console.log("Hi!")
//     hre.deployments
//     hre.getNamedAccounts()
// }
// module.exports = deployfunc

//we also can do this.
// module.exports = async (hre) => {
//     const { getNamedAccount, deployments } = hre
// }
const { getNamedAccounts } = require("hardhat")
const { networkconfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        let ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkconfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]
    const fundme = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundme.address, args)
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
