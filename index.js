function isElement(el) {
  return el && typeof el == 'object'
    && 'getInnerHtml' in el
    && 'getOuterHtml' in el
    && 'getRawId' in el;
}

module.exports = {

  name: 'unexpected-webdriver',

  installInto: function (expect) {

    // add prism to syntax highlight html
    expect.installPlugin(require('magicpen-prism'));

    expect.addType({
      name: 'WebDriver',
      base: 'object',
      identify: function (value) {
        return value && typeof value == 'object'
          && 'findElement' in value
          && 'executor_' in value
          && 'flow_' in value;
      },
      inspect: function (se, depth, output) {
        output.text('WebDriver', 'jsFunctionName');
      }
    });

    expect.addAssertion(
      '<WebDriver> to find <string>',
      function (expect, driver, sel) {
        return expect.promise(function (res) {
          driver.findElement({ css: sel }).then(res).thenCatch(res);
        })
        .then(function (err) {
          if (err) expect.fail();
        });
      }
    );

    expect.addAssertion(
      '<WebDriver> not to find <string>',
      function (expect, driver, sel) {
        expect.errorMode = 'nested';

        return expect.promise(function () {
          return driver.findElement({ css: sel }).then(function (el) {
            return el.getOuterHtml();
          })
          .thenCatch(function (err) {
            if (err.name != 'NoSuchElementError') throw err;
          });
        })
        .then(function (html) {
          expect.fail(function (output) {
            output.text('but found').sp().code(html, 'html');
          });
        });
      }
    );

    expect.addAssertion(
      '<WebDriver> to wait for <any>',
      function (expect, driver, until) {
        expect.errorMode = 'nested';
        return driver.wait(until).thenCatch(function (err) {
          if (isElement(err.cause)) {
            return err.cause.getOuterHtml().then(function (html) {
              expect.fail(function (output) {
                output.text('but found').sp().code(html, 'html');
              });
            });
          }
          return expect.promise(function () {
            expect.fail(err);
          });
        });
      }
    );

    expect.addAssertion(
      '<function> [when] executed by <WebDriver> <assertion>',
      function (expect, fn, driver) {
        expect.errorMode = 'nested';
        return expect.promise(function () {
          return driver.executeScript(fn);
        })
        .then(function (res) {
          return expect.shift(res);
        });
      }
    );

  }
};
