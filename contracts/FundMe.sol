// This program will help us learn how to:
// Get Funds
// Withdraw funds
// Set a minimum fundong value in usd on a smart contract.

//<- Pragma and identifier
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

//<- imports
import "./PriceConverter.sol";
import "hardhat/console.sol";

//<- error codes
error FundMe__NotOwner();

//<- interface and libraries

/** @title A crowd funding contract
 *  @author Obi Chidubem Michael
 *  @notice This is simple demo for a funding project
 *  @dev This implements price feeds as our library
 */

contract FundMe {
    //<- Type declarations
    using PriceConverter for uint256;

    //<- State variables
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    address[] private s_funders;
    mapping(address => uint256) private s_senderAddressToAmountSent;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    // solidity modifiers
    modifier onlyOwner() {
        //require(msg.sender == i_owner, "You're not the owner.");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner(); //<- This is far cheaper than rquires. Use them when you can
        }
        _; // this underscore represents the original function code.
    }

    constructor(address priceFeedAddress) {
        // whatever is inside here takes precedence over every other part of the contract
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        i_owner = msg.sender;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // You must tag the function as payable when you want to use it to send eth
    // Contracts can hold funds just like wallets
    function fund() public payable {
        // The require call is basically an if else statment. Same as the revert call.
        // If the require is not met, then the entire fucntion will be undone and whatever gas remaining after the require will be returned.
        // msg.sender and msg.value are universally accessible functions.

        // msg.value.getConversionRate == getConversionRate(msg.value)
        // This works because any function called on an object has that object as its first variable
        // if the function needs more than one variable input, then teh first input will be the method and every other input will be in the brackets.
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Not enough"
        ); // value is in terms of ether, so it has to be converted to usd.
        s_funders.push(msg.sender);
        s_senderAddressToAmountSent[msg.sender] += msg.value;
    }

    // withdraw function
    function withdraw() public onlyOwner {
        // require(msg.sender == owner, "You're not the owner. Go away.");
        // for loop: Parameters - starting index; checking index; step amount.
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_senderAddressToAmountSent[funder] = 0;
        }
        // reset the array
        s_funders = new address[](0); // This means that funders is a brand new address array with 0 objects in it.
        // actually withdrawing the funds

        /* 
        // Transfer method.
        payable(msg.address).transfer(address(this).balance); // basically; transfer the balance of this contracts's address to this msg.sender
        // Send method.
        bool sendSuccess = payable(msg.sender).transfer(address(this).balance);
        require(sendSuccess, "Send Failed"); // this reverts teh tanscation is the sending fails.
        // Call method.
        */

        (bool callSuccess /*bytes memory dataReturned*/, ) = payable(msg.sender)
            .call{value: address(this).balance}("");
        require(callSuccess, "Call Failed"); // The call method - unlike recieve and fallback - does not have a gas limit.
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory m_funders = s_funders; //mappings cannot be in memory. its just too damn wierd.
        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address funder = m_funders[funderIndex];
            s_senderAddressToAmountSent[funder] = 0;
        }
        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        //<- This is used to retrieve private variables
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getSendertoAmountMapping(
        address funder
    ) public view returns (uint256) {
        return s_senderAddressToAmountSent[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
