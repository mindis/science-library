'use strict';

describe('Directive: itaHeader', function () {

  // load the directive's module
  beforeEach(module('itapapersApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ita-header></ita-header>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the itaHeader directive');
  }));
});
