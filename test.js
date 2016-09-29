'use strict';

const fs = require('fs');
const benchmark = require('benchmark');
const mathjs = require('mathjs');
const la = require('./la.js');
const profiler = require('v8-profiler');

const suite = new benchmark.Suite;

const Vector = la.Vector(Float64Array)(150);
const Matrix = la.Matrix(Float64Array)(150);

let m0 = [];
let m1 = [];

for (let x = 0; x < 150; x++) {
  m0[x] = [];
  m1[x] = [];

  for (let y = 0; y < 150; y++) {
    m0[x][y] = Math.random();
    m1[x][y] = Math.random();
  }
}

let mjs0 = mathjs.matrix(m0);
let mjs1 = mathjs.matrix(m1);
let mjs2 = mathjs.multiply(mjs0, mjs1);

let la0 = Matrix(m0);
let la1 = Matrix(m1);
let la2 = la.multiply(la0, la1);

// sanity check
// Only works with Float64Array
for (let x = 0; x < 150; x++) {
  for (let y = 0; y < 150; y++) {
    if (mjs2._data[x][y] !== la2[x][y]) {
      console.log({ x, y, mjs: mjs2._data[x][y], la: la2[x][y] });
      process.exit(-1);
    }
  }
}

function now() {
  let time = process.hrtime();
  return time[0] * 1e3 + time[1] / 1e6;
}

/* (function () {

  // Only works with Numbers.

  let epoch = now();
  let mjsd = mathjs.det(mjs0);

  console.log('mjsd', mjsd, now() - epoch);

  epoch = now();
  let lad = mathjs.det(la0);

  console.log('lad', lad, now() - epoch);

}) */

let mjsts = [];

suite.add('mathjs', function () {

  let epoch = now();

  let m2 = mathjs.matrix(m0);
  let m3 = mathjs.matrix(m1);
  let m4 = mathjs.multiply(m2, m3);

  mjsts.push(now() - epoch);

  return m4;

});

let lats = [];

suite.add('la', function () {

  let epoch = now();

  let m2 = Matrix(m0);
  let m3 = Matrix(m1);
  let m4 = la.multiply(m2, m3);

  lats.push(now() - epoch);

  return m4;

});

suite.on('cycle', event => console.log(String(event.target)));

const average = nums => nums.reduce((n1, n2) => n1 + n2) / nums.length;

suite.on('complete', function () {
  console.log({
    mathjs: {
      number_of_multiplies: `${mjsts.length}x`,
      average_length_of_multiplication: `${average(mjsts)}ms`
    },
    la: {
      number_of_multiplies: `${lats.length}x`,
      average_length_of_multiplication: `${average(lats)}ms`
    }
  });

  console.log(`Fastest: ${this.filter('fastest').map('name')}`);
});

suite.run();

(function () {

  profiler.startProfiling('', true);

  function test() {
    // const Vector = la.Vector(Number)(2);
    // const Matrix = la.Matrix(Number)(2);

    let m2 = Matrix(m0);
    let m3 = Matrix(m1);
    let m4 = la.multiply(m3, m2);

    return m4;
  }

  test();

  let profile = profiler.stopProfiling();

  profile.export(function (error, result) {
    if (error) {
      console.error(error);
      process.exit(-1);
    }

    fs.writeFileSync(`${__dirname}/la.cpuprofile`, result);
  });
  
})();

