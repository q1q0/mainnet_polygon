// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FxBaseChildTunnel} from "./tunnel/FxBaseChildTunnel.sol";

/**
 * @title FxStateChildTunnel
 */
contract FxStateChildTunnel is FxBaseChildTunnel {
    uint256 public latestStateId;
    address public latestRootMessageSender;
    bytes public latestData;
    uint256 updatePrice;

    constructor(address _fxChild) FxBaseChildTunnel(_fxChild) {
    }

    function _processMessageFromRoot(
        uint256,
        address sender,
        bytes memory data
    ) internal override validateSender(sender) {
        bytes memory _data;
        (latestRootMessageSender, ,_data) = abi.decode(data, (address, address, bytes));
        updatePrice = abi.decode(_data, (uint256));
    }

    function sendMessageToRoot(bytes memory message) public {
        _sendMessageToRoot(message);
    }

    function UpdatePrice() external view returns(uint256) {
        return updatePrice;
    }
}
