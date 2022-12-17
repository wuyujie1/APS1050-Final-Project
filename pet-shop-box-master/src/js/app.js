App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

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
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },


  handleSlider: function(value) {
    if (value != "0"){
      for (i = 0; i < 16; i++) {
        if ($('.col-lg-3').eq(i).find('.pet-age').text() !== value.toString()) {
          $('.col-lg-3').eq(i).hide();
        } if ($('.col-lg-3').eq(i).find('.pet-age').text() == value.toString()) {
          var location = $('.col-lg-3').eq(i).find('.pet-location').text()
          if (document.getElementById(location).checked){
            var breed = $('.col-lg-3').eq(i).find('.pet-breed').text()
            if (document.getElementById(breed).checked){
              $('.col-lg-3').eq(i).show();
            }
          }
        }
      };
    } else {
      for (i = 0; i < 16; i++) {
        var location = $('.col-lg-3').eq(i).find('.pet-location').text()
        if (document.getElementById(location).checked){
          var breed = $('.col-lg-3').eq(i).find('.pet-breed').text()
          if (document.getElementById(breed).checked){
            $('.col-lg-3').eq(i).show();
          }
        }
      };
    }
    App.markAdopted();
  },

  handleBreedCheckbox: function(breed) {
    var age = document.getElementById('ageSlider').value;

    if (document.getElementById(breed).checked) {
      for (i = 0; i < 16; i++) {
        if ($('.col-lg-3').eq(i).find('.pet-breed').text() == breed) {
          var location = $('.col-lg-3').eq(i).find('.pet-location').text()
          if (document.getElementById(location).checked){
            $('.col-lg-3').eq(i).show();
          }
        }
      };
      if (age !== '0'){
        App.handleSlider(age);
      }
    } else {
      if (age !== '0'){
        App.handleSlider(age);
      }
      for (i = 0; i < 16; i++) {
        if ($('.col-lg-3').eq(i).find('.pet-breed').text() == breed) {
          $('.col-lg-3').eq(i).hide();
        }
        }
      };

      App.markAdopted();
    },

    handleLocationCheckbox: function(location) {
      var age = document.getElementById('ageSlider').value;

      if (document.getElementById(location).checked) {
        for (i = 0; i < 16; i++) {
          if ($('.col-lg-3').eq(i).find('.pet-location').text() == location) {
            var breed = $('.col-lg-3').eq(i).find('.pet-breed').text()
            if (document.getElementById(breed).checked){
              $('.col-lg-3').eq(i).show();
            }
          }
        };
        if (age !== '0'){
          App.handleSlider(age);
        }
      } else {
        if (age !== '0'){
          App.handleSlider(age);
        }
        for (i = 0; i < 16; i++) {
          if ($('.col-lg-3').eq(i).find('.pet-location').text() == location) {
            $('.col-lg-3').eq(i).hide();
          }
          }
        };

        App.markAdopted();
      },


  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
          $('.col-lg-3').eq(i).hide();
        }
      };
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {

        return App.markAdopted();
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
