App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../service_shop.json', function(data) {
      var petsRow = $('#serviceRow');
      var petTemplate = $('#serviceTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.shop-stock').text('999');
        petTemplate.find('.btn-service').attr('data-id', data[i].id);
        petTemplate.find('.shop-price').text(data[i].price);

        petsRow.append(petTemplate.html());
      }
    });
    return await App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.enable();
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Service.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var ServiceArtifact = data;
      App.contracts.Service = TruffleContract(ServiceArtifact);

      // Set the provider for our contract
      App.contracts.Service.setProvider(App.web3Provider);

      return App.markAvailibility();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-service', App.purchase);
  },

  markAvailibility: function(services) {
    var serviceInstance;
    const service = [];

    App.contracts.Service.deployed().then(function(instance) {
      serviceInstance = instance;

      return serviceInstance.getStock.call();
    }).then(function(services) {
      //update availability first
      for (i = 0; i < services.length; i++){
        if (service[i] == 0){
          $('.panel-pet').eq(i).find('.shop-stock').text("Sold Out!").attr('disabled', true);
        } else {
          $('.panel-pet').eq(i).find('.shop-stock').text(services[i]);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  purchase: function(event){
    event.preventDefault();
    var serviceId = parseInt($(event.target).data('id'));

    var serviceIdInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Service.deployed().then(function(instance) {
        serviceInstance = instance;

        var price = $('.panel-pet').eq(serviceId).find('.shop-price').text();
        return serviceInstance.purchase(serviceId, {from: account, value: web3.toWei(price, 'ether')});
      }).then(function(result) {
        App.markAvailibility();


      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};


$(function() {
  $(window).load(function() {
    App.init();
  });
});
