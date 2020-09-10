pragma solidity 0.5.17;

import "./V1.sol";

contract V2 is V1 {
    function setVariable(uint256 _value) external {
        testVariable = _value;
    }
}
