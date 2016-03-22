/* eslint-env mocha */
'use strict';

const webdriver = require('selenium-webdriver');
const expect = require('unexpected').use(require('..'));

const driver = new webdriver.Builder().forBrowser('firefox').build();

expect.addAssertion(
  '<Promise> to be rejected with message <string|regexp>',
  (expect, promise, message) => expect(promise, 'when rejected', 'to have message', message)
);

describe('unexpected-webdriver', () => {

  beforeEach(() => driver.get(`file://${__dirname}/fixture.html`));

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
      return expect(assertion, 'to be rejected with message', 'expected WebElement to be visible');
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
});
