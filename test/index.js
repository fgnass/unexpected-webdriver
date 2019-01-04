/* eslint-env mocha */
'use strict';
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const sut = require('..');
const unexpected = require('unexpected')
  .clone();

const driver = new webdriver.Builder().forBrowser('firefox').build();

unexpected.addAssertion(
  '<Promise> to be rejected with message <string|regexp>',
  (expect, promise, message) => expect(promise, 'when rejected', 'to have message', message)
);

describe('unexpected-webdriver', () => {

  beforeEach(() => driver.get(`file://${__dirname}/fixture.html`));

  after(() => {
    driver.quit();
  });

  context('assertions', () => {

    const expect = unexpected.clone().use(sut());

    describe('to exist', () => {
      it('should assert existing elements', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(el, 'to exist');
      });

      it('should report non-existing elements', () => {
        const el = driver.findElement({ id: 'not-there' });
        const assertion = expect(el, 'to exist');
        return expect(assertion, 'to be rejected with message', 'expected WebElement to exist');
      });
    });

    describe('to be visible', () => {
      it('should assert existing elements', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(el, 'to be visible');
      });

      it('should report invisible elements', () => {
        const el = driver.findElement({ id: 'hidden' });
        const assertion = expect(el, 'to be visible');
        return expect(assertion, 'to be rejected with message',
          'expected WebElement to be visible');
      });

      it('should report non-existing elements', () => {
        const el = driver.findElement({ id: 'not-there' });
        const assertion = expect(el, 'to be visible');
        return expect(assertion, 'to be rejected with message', 'expected WebElement to exist');
      });
    });

    describe('to contain text', () => {
      it('should find text', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(el, 'to contain text', 'Hello Webdriver');
      });

      it('should report missing text', () => {
        const el = driver.findElement({ id: 'hello' });
        const assertion = expect(el, 'to contain text', 'Hello World');
        return expect(assertion, 'to be rejected with message',
          "expected WebElement to contain text 'Hello World'" +
          '\n\n' +
          'Hello Webdriver\n' +
          '^^^^^^^'
        );
      });

      it('should match regular expressions', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(el, 'to contain text', /Hello/);
      });

      it('should report regular expression mismatches', () => {
        const el = driver.findElement({ id: 'hello' });
        const assertion = expect(el, 'to contain text', /Hallo/);
        return expect(assertion, 'to be rejected with message',
          'expected WebElement to contain text /Hallo/');
      });

    });

    describe('to contain html', () => {
      it('should assert for html', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(el, 'to contain html', '<h1>Hello Webdriver</h1>');
      });

      it('should report missing html', () => {
        const el = driver.findElement({ id: 'hello' });
        const assertion = expect(el, 'to contain html', '<h2>Hello World</h2>');
        return expect(assertion, 'to be rejected with message',
          /expected WebElement to contain html '<h2>Hello World<\/h2>'/
        );
      });

      it('should match regular expressions', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(el, 'to contain html', /Hello/);
      });

      it('should report regular expression mismatches', () => {
        const el = driver.findElement({ id: 'hello' });
        const assertion = expect(el, 'to contain html', /Hallo/);
        return expect(assertion, 'to be rejected with message',
          'expected WebElement to contain html /Hallo/');
      });

    });

    describe('to locate', () => {

      it('should locate a promise to be a WebElement', () => {
        const el = driver.findElement({ id: 'hello' });
        return expect(driver, 'to locate', el);
      });

      it('should fail if the promise does not resolve to a WebElement', () => {
        const el = driver.findElement({ id: 'hello' }).click();
        const assertion = expect(driver, 'to locate', el);
        return expect(assertion, 'to be rejected with message', /expected {} to be a WebElement/);
      });
    });

    describe('to have attribute', () => {
      it('should check for the presence of an attribute', () => {
        const el = driver.findElement({ id: 'hidden' });
        return expect(el, 'to have attribute', 'style');
      });

      it('should check for the absence of an attribute', () => {
        const el = driver.findElement({ id: 'hidden' });
        return expect(el, 'not to have attribute', 'class');
      });

      it('should check the value of an attribute', () => {
        const el = driver.findElement({ id: 'hidden' });
        return expect(el, 'to have attribute', 'style', 'visibility: hidden;');
      });
    });
  });

  context('with screenshots', () => {

    const expect = unexpected.clone().use(sut({ screenshots: __dirname }));

    it('takes a screenshot if expectation fails', () => {
      const assertions = [
        expect(driver.findElement({ id: 'not-there' }), 'to exist'),
        expect(driver.findElement({ id: 'hidden' }), 'to be visible'),
        expect(driver.findElement({ id: 'hello' }), 'to contain text', 'XXX'),
        expect(driver.findElement({ id: 'hello' }), 'to contain html', 'XXX')
      ];

      const promises = assertions.map(assertion => assertion.catch(err => err));

      return Promise.all(promises).then((errors) => {
        errors.forEach(err => {
          expect(err, 'to have property', 'screenshot');
          fs.unlinkSync(err.screenshot);
        });
      });
    });

  });

});
