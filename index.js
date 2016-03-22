function isWebElement(obj) {
  return obj && typeof obj == 'object'
    && 'getId' in obj
    && 'getOuterHtml' in obj;
}

module.exports = {

  name: 'unexpected-webdriver',

  installInto(expect) {

    expect.addType({
      name: 'WebElement',
      base: 'object',
      identify: isWebElement,
      inspect(se, depth, output) {
        output.text('WebElement', 'jsFunctionName');
      }
    });

    expect.addAssertion(
      '<WebElement> to exist',
      (expect, el) => expect(Promise.resolve(el), 'to be fulfilled')
    );

    expect.addAssertion(
      '<WebElement> to be visible',
      (expect, el) => expect(el.isDisplayed(), 'to be fulfilled with', true)
    );

    expect.addAssertion(
      '<WebElement> to contain text <string+>',
      function (expect, el) {
        const texts = Array.prototype.slice.call(arguments, 2);
        const args = [el.getText(), 'when fulfilled', 'to contain'].concat(texts);
        return expect.apply(expect, args);
      }
    );

    expect.addAssertion(
      '<WebElement> to contain text <regexp>',
      (expect, el, pattern) => expect(el.getText(), 'when fulfilled', 'to match', pattern)
    );

    expect.addAssertion(
      '<WebElement> to contain html <string+>',
      function (expect, el) {
        const texts = Array.prototype.slice.call(arguments, 2);
        const args = [el.getInnerHtml(), 'when fulfilled', 'to contain'].concat(texts);
        return expect.apply(expect, args);
      }
    );

    expect.addAssertion(
      '<WebElement> to contain html <regexp>',
      (expect, el, pattern) => expect(el.getInnerHtml(), 'when fulfilled', 'to match', pattern)
    );

  }
};
