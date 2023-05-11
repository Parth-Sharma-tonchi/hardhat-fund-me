const networkconfig = {
    11155111: {
        name: "Sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
}

const developmentChains = ["localhost", "hardhat"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000

module.exports = {
    networkconfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
}
