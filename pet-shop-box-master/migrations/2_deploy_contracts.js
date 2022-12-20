var Adoption = artifacts.require("Adoption");
var Service = artifacts.require("Service");

module.exports = function(deployer) {
  deployer.deploy(Adoption);

  // Add service contract for "shop's side service"
  deployer.deploy(Service);
};
