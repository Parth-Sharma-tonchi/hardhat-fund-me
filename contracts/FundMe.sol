// SPDX-License-Identifier: MIT
// 1. Pragma
pragma solidity ^0.8.8;
// 2. Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// 3. Interfaces, Libraries, Contracts
error FundMe__NotOwner();

/**@title A sample Funding Contract
 * @author Patrick Collins
 * @notice This contract is for creating a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // Type declarations:
    using PriceConverter for uint256;

    //state variables:
    uint256 public constant MINIMUM_USD = 50;
    address[] private s_funders;
    mapping(address => uint256) private s_addresstoAmountFunded;
    address private immutable i_owner;
    AggregatorV3Interface private s_priceFeed;

    // Events(we haven't)

    modifier thisi_owner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Functions Order:
    //// constructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view / pure

    constructor(address s_priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress);
    }

    function fund() public payable {
        require(
            msg.value.getconversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough!"
        );
        s_funders.push(msg.sender);
        s_addresstoAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public payable thisi_owner {
        for (
            uint256 funderindex = 0;
            funderindex < s_funders.length;
            funderindex++
        ) {
            address funder = s_funders[funderindex];
            s_addresstoAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        // payable(msg.sender).transfer(address(this).balance);

        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "send failed");

        (bool callsuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callsuccess, "call failed");
    }

    function cheaperWithdraw() public payable thisi_owner {
        address[] memory funders = s_funders;
        for (
            uint256 funders_index = 0;
            funders_index < funders.length;
            funders_index++
        ) {
            address funder = funders[funders_index];
            s_addresstoAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }

    function getAddresstoAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addresstoAmountFunded[funder];
    }
}
