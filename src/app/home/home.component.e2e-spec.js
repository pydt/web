describe('Home', function () {

  beforeEach(function () {
    browser.get('/');
  });

  it('should have <pydt-home>', function () {
    var home = element(by.css('pydt-app pydt-home'));
    expect(home.isPresent()).toEqual(true);
    expect(home.getText()).toEqual("Home Works!");
  });

});
