pragma solidity ^0.5.0;

contract Adoption {
address[16] public adopters;
uint contractBalance;
address public nullAddr = 0x0000000000000000000000000000000000000000;
event Deposite(address indexed from, uint amount);

// Adopting a pet
function adopt(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 15);

  adopters[petId] = msg.sender;

  return petId;
}

// Relisting a pet
function relist(uint petId) public returns (uint) {
  require(petId >= 0 && petId <= 15);

  if (adopters[petId] == msg.sender){
    adopters[petId] = nullAddr;

    return 255;
  }
}

// Retrieving the adopters
function getAdopters() public view returns (address[16] memory) {
  return adopters;
}

function donate() external payable {
	emit Deposite(msg.sender,msg.value);


    }
function() external payable {}



}
