pragma solidity ^0.5.0;

contract Service {
uint[5] stock = [999, 999, 30, 25, 50];

// Change stock
function purchase(uint serviceId) public payable returns (uint) {
  require(serviceId >= 0 && serviceId <= 4);

  stock[serviceId]-=1;

  return stock[serviceId];
}

// Retrieving the stocks
function getStock() public view returns (uint[5] memory) {
  return stock;
}
}
