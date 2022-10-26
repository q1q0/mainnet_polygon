// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {FxBaseRootTunnel} from "./tunnel/FxBaseRootTunnel.sol";

interface IAaveOracle {
    function getAssetPrice(address _asset) external view returns (uint256);
}

/**
 * @title FxStateRootTunnel
 */
contract FxStateRootTunnel is FxBaseRootTunnel {
    bytes public latestData;
    IAaveOracle oracle;

    constructor(address _checkpointManager, address _fxRoot, address _oracle) FxBaseRootTunnel(_checkpointManager, _fxRoot) {
        oracle = IAaveOracle(_oracle);
    }

    function _processMessageFromChild(bytes memory data) internal override {
        latestData = data;
    }

    function sendMessageToChild(bytes memory message) public {
        _sendMessageToChild(message);
    }

    function updatePrice(address tokenAddr) external {
        uint256 price = oracle.getAssetPrice(tokenAddr);
        sendMessageToChild(abi.encodePacked(price));
    }

}
