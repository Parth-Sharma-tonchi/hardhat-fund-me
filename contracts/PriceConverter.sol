//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getprice(
        AggregatorV3Interface PriceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = PriceFeed.latestRoundData();

        return uint256(price * 1e10); // To convert it into 1e18, because msg.value is in 1e18 decimal places and we have to compare it with it;
    }

    function getversion() internal view returns (uint256) {
        AggregatorV3Interface Pricefeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return Pricefeed.version();
    }

    function getconversionRate(
        uint256 ethamount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethprice = getprice(priceFeed);
        uint256 ethamountInUSD = (ethprice * ethamount) / 1e18;
        return ethamountInUSD;
    }
}
