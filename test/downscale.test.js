const downscale = require('../dist/downscale.js');

test('Obligate first argument', () => {
  expect.assertions(1);
  return expect(downscale()).
    rejects.toBeInstanceOf(TypeError);
});

test('Obligate second argument', () => {
  expect.assertions(1);
  return expect(downscale(null)).
    rejects.toBeInstanceOf(TypeError);
});

test('Obligate third argument', () => {
  expect.assertions(1);
  return expect(downscale(null, null)).
    rejects.toBeInstanceOf(TypeError);
});

test('First argument should be of a proper type', () => {
  expect.assertions(1);
  return expect(downscale(null, null, null)).
    rejects.toBeInstanceOf(TypeError);
});

test('Second argument should be a number', () => {
  expect.assertions(1);
  return expect(downscale("", null, null)).
    rejects.toBeInstanceOf(TypeError);
});

test('Third argument should be a number', () => {
  expect.assertions(1);
  return expect(downscale("", 1, null)).
    rejects.toBeInstanceOf(TypeError);
});

test('Result should be a promise', () => {
  expect.assertions(1);
  return expect(downscale("", 1, 1)).toBeInstanceOf(Promise);
});
