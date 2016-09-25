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

// console.log({ la0 });

let la2 = la.multiply(la0, la1);

// sanity check
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

  /* let rotate90CounterClockwise = mathjs.matrix([[0, 1], [-1, 0]]);
  let flipHorizontal = mathjs.matrix([[-1, 0], [0, 1]]);
  let oneThenTheOther = mathjs.multiply(flipHorizontal, rotate90CounterClockwise); // backwards?

  return oneThenTheOther; */

  let m2 = mathjs.matrix(m0);
  let m3 = mathjs.matrix(m1);
  let m4 = mathjs.multiply(m2, m3);

  mjsts.push(now() - epoch);

  return m4;

});

let lats = [];

suite.add('la', function () {

  let epoch = now();

  /* let rotate90CounterClockwise = Matrix([[0, 1], [-1, 0]]);
  let flipHorizontal = Matrix([[-1, 0], [0, 1]]);
  let oneThenTheOther = la.multiply(rotate90CounterClockwise, flipHorizontal); // backwards?

  return oneThenTheOther; */

  let m2 = Matrix(m0);
  let m3 = Matrix(m1);
  let m4 = la.multiply(m2, m3);

  lats.push(now() - epoch);

  return m4;

});

/* suite.add('old', function () {

  let rotate90CounterClockwise = old._2d.matrix([0, 1], [-1, 0]);
  let flipHorizontal = old._2d.matrix([-1, 0], [0, 1]);
  let oneThenTheOther = old._2d.multiply(rotate90CounterClockwise, flipHorizontal); // backwards?

  return oneThenTheOther;

}); */

suite.on('cycle', event => console.log(String(event.target)));

const average = nums => nums.reduce((n1, n2) => n1 + n2) / nums.length;

suite.on('complete', function () {
  console.log({
    mathjs: {
      n: mjsts.length,
      a: average(mjsts)
    },
    la: {
      n: lats.length,
      a: average(lats)
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

    /* let rotate90CounterClockwise = la._matrix(2, Number, [[0, 1], [-1, 0]]);
    let flipHorizontal = la._matrix(2, Number, [[-1, 0], [0, 1]]);
    let oneThenTheOther = la.multiply(rotate90CounterClockwise, flipHorizontal);

    console.log({ rotate90CounterClockwise, flipHorizontal, oneThenTheOther }); */

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

