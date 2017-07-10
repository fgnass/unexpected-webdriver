'use strict';

const fs = require('fs');
const path = require('path');

function isWebElement(obj) {
  return obj && typeof obj === 'object'
    && 'getId' in obj
    && 'getAttribute' in obj;
}

function isWebDriver(obj) {
  return obj && typeof obj === 'object'
    && 'controlFlow' in obj
    && 'executeScript' in obj
    && 'findElement' in obj;
}


module.exports = (options) => {

  let filecounter = 1;
  const outPath = options && options.screenshots;

  function takeScreenshot(driver) {
    if (!outPath) return Promise.resolve();

    return driver.takeScreenshot().then(image => new Promise(resolve => {
      const filename = path.join(outPath, `screenshot-${filecounter++}.png`);
      fs.writeFile(filename, image, { encoding: 'base64', flag: 'w' }, writeErr => {
        if (writeErr) {
          // eslint-disable-next-line
          console.log('Error writing screenshot: ', writeErr);
        }
        resolve(filename);
      });
    }));
  }

  function failWithScreenshot(obj) {
    const driver = isWebElement(obj) ? obj.getDriver() : obj;
    return (err) => takeScreenshot(driver).then((filename) => {
      err.screenshot = filename;
      return Promise.reject(err);
    });
  }

  return {
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

      expect.addType({
        name: 'WebDriver',
        base: 'object',
        identify: isWebDriver,
        inspect(se, depth, output) {
          output.text('WebDriver', 'jsFunctionName');
        }
      });

      expect.addAssertion(
        '<WebElement> to exist',
        (expect, el) => expect(Promise.resolve(el), 'to be fulfilled')
          .catch(failWithScreenshot(el)));

      expect.addAssertion(
        '<WebDriver> to locate <Promise>',
        (expect, driver, promise) => {
          expect.errorMode = 'bubble';
          return expect(promise, 'when fulfilled', 'to be a', 'WebElement')
            .catch(failWithScreenshot(driver));
        });

      expect.addAssertion(
        '<WebElement> to be visible',
        (expect, el) => {
          expect.errorMode = 'bubble';
          return expect(el, 'to exist').then(() => {
            expect.errorMode = 'default';
            return expect(el.isDisplayed(), 'to be fulfilled with', true)
              .catch(failWithScreenshot(el));
          });
        }
      );

      expect.addAssertion(
        '<WebElement> to contain text <string+>',
        function (expect, el) {
          const texts = Array.prototype.slice.call(arguments, 2);
          const args = [el.getText(), 'when fulfilled', 'to contain'].concat(texts);
          return expect.apply(expect, args).catch(failWithScreenshot(el));
        }
      );

      expect.addAssertion(
        '<WebElement> to contain text <regexp>',
        (expect, el, pattern) => expect(el.getText(), 'when fulfilled', 'to match', pattern)
          .catch(failWithScreenshot(el))
      );

      expect.addAssertion(
        '<WebElement> to contain html <string+>',
        function (expect, el) {
          const texts = Array.prototype.slice.call(arguments, 2);
          const args = [el.getAttribute('innerHTML'), 'when fulfilled', 'to contain'].concat(texts);
          return expect.apply(expect, args).catch(failWithScreenshot(el));
        }
      );

      expect.addAssertion(
        '<WebElement> to contain html <regexp>',
        (expect, el, pattern) => expect(
            el.getAttribute('innerHTML'),
            'when fulfilled',
            'to match', pattern
          )
          .catch(failWithScreenshot(el))
      );

      expect.addAssertion(
        '<WebElement> [not] to have attribute <string>',
        (expect, el, name) =>
          expect(el.getAttribute(name), 'when fulfilled', '[not] to be a string')
      );

      expect.addAssertion(
        '<WebElement> to have attribute <string> <string>',
        (expect, el, name, value) =>
          expect(el.getAttribute(name), 'when fulfilled', 'to be', value)
      );
    }
  };
};
