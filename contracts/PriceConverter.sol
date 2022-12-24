//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        /** This contract needs to interact with another contract outside this one. so we need two things.
         * ABI
         * Address 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419 (Go to Ethereum data feeds and grab the address from there)
         */
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // 1 ETH in terms of USD
        // Remember there are eight decimal places behind the value
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethtodollarPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethtodollarPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }

    // the recieve() and fallback() special funtions
    // recieve cannot have any parameters. It must be external and payable
}
