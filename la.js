(function () {

  'use strict'

  const _la = {};

  if (typeof module !== 'undefined')
    module.exports = _la;
  else
    this.LA = _la;

  _la.TYPES = [
    Array,
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    Float32Array,
    Float64Array
  ];

  _la.IDENTITY = Symbol();

  function _vector(type, dimensions, values) {
    if (type === Array) {
      if (values)
        return values;

      const a = []; // ArrayBuffer?

      for (let x = 0; x < dimensions; x++)
        a[x] = 0;

      return a;
    }

    return new type(values || dimensions);
  }

  _la.Vector = function (type) {
    if (!~_la.TYPES.indexOf(type))
      throw new TypeError();

    return function (dimensions) {
      if (isNaN(dimensions) || (dimensions !== (dimensions | 0)) || dimensions <= 0) // Infinity?
        throw new RangeError();

      return function (values) {
        return _vector(type, dimensions, values);
      };
    };
  };

  _la.scale = function (vector, scalar) {
    const v = _vector(vector.constructor, vector.length);

    for (let x = 0; x < vector.length; x++)
      v[x] = vector[x] * scalar;

    return v;
  };

  _la.add = function (/* ...vectors */) {
    const v = _vector(arguments[0].constructor, arguments[0].length);

    for (let x = 0; x < v.length; x++)
      for (let y = 0; y < arguments.length; y++)
        v[x] += arguments[y][x];

    return v;
  };

  function _matrix(type, dimensions, values) {
    const m = [];

    for (let x = 0; x < dimensions; x++)
      m[x] = _vector(type, dimensions, values && values[x]);

    return m;
  }

  _la.Matrix = function (type) {
    if (!~_la.TYPES.indexOf(type))
      throw new TypeError();

    return function (dimensions) {
      if (isNaN(dimensions) || (dimensions !== (dimensions | 0)) || dimensions === 0)
        throw new RangeError();

      return function (values) {
        return values === _la.IDENTITY ? _identity(type, dimensions, values) : _matrix(type, dimensions, values);
      };
    };
  };

  function _identity(type, dimensions) {
    const m = _matrix(type, dimensions);

    for (let i = 0; i < dimensions; i++)
      m[i][i] = 1;

    return m;
  }

  _la.transform = function (vector, matrix) {
    const s = [];

    for (let x = 0; x < vector.length; x++)
      s[x] = _la.scale(matrix[x], vector[x]);

    return _la.add.apply(null, s);
  }

  // This wastes memory, is precomputing values slower though? probably not
  function _multiply(matrix0, matrix1) {
    const m = _matrix(matrix1.length, matrix1[0].constructor);

    for (let x = 0; x < matrix1.length; x++)
      m[x] = _la.transform(matrix1[x], matrix0);

    return m;
  }

  _la.multiply = function (/* ...matricies */) {
    let m = arguments[0];

    for (let x = 1; x < arguments.length; x++)
      m = _multiply(arguments[x], m);

    return m;
  }

}).call(this);

