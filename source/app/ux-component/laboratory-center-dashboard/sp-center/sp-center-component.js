(function () {
  'use strict';

  angular
    .module('normalizerjs.uxComponent')
    .component('spCenter', {
      templateUrl: 'app/ux-component/laboratory-center-dashboard/sp-center/sp-center-template.html',
      bindings: {
        fieldCenter: '<'
      },
      controller: Controller
    });

  Controller.$inject = [

  ];

  function Controller() {
    var self = this;

    self.$onInit = onInit;

    function onInit() { }
  }
}());
