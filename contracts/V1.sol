pragma solidity 0.5.17;

import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/upgrades/contracts/ownership/Ownable.sol";

contract V1 is Initializable, OpenZeppelinUpgradesOwnable {
    uint256 public testVariable = 0;

    function initialize(address _owner, uint256 _value) public initializer {
        _transferOwnership(_owner);
        testVariable = _value;
    }
}
