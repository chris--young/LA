(function () {

  'use strict'

  var _2d = {};

  _2d.vector = (x, y) => [x, y];
  _2d.matrix = (v0, v1) => _2d.vector(v0, v1);
  _2d.identity = _2d.matrix([1, 0], [0, 1]);
  _2d.sum = (v0, v1) => _2d.vector(v0[0] + v1[0], v0[1] + v1[1]);
  _2d.scale = (v, s) => _2d.vector(v[0] * s, v[1] * s);
  _2d.transform = (v, m) => _2d.sum(_2d.scale(m[0], v[0]), _2d.scale(m[1], v[1]));
  _2d.multiply = (m0, m1) => _2d.matrix(_2d.transform(m1[0], m0), _2d.transform(m1[1], m0));

  var _3d = {};

  _3d.vector = (x, y, z) => [x, y, z];
  _3d.matrix = (v0, v1, v2) => _3d.vector(v0, v1, v2);
  _3d.identity = _3d.matrix([1, 0, 0], [0, 1, 0], [0, 0, 1]);
  _3d.sum = (v0, v1, v2) => _3d.vector(v0[0] + v1[0] + v2[0], v0[1] + v1[1] + v2[1], v0[2] + v1[2] + v2[2]);
  _3d.scale = (v, s) => _3d.vector(v[0] * s, v[1] * s, v[2] * s);
  _3d.transform = (v, m) => _3d.sum(_3d.scale(m[0], v[0]), _3d.scale(m[1], v[1]), _3d.scale(m[2], v[2]));
  _3d.multiply = (m0, m1) => _3d.matrix(_3d.transform(m1[0], m0), _3d.transform(m1[1], m0), _3d.transform(m1[2], m0));

  var _4d = {};

  _4d.vector = (x, y, z, w) => [x, y, z, w];
  _4d.matrix = (v0, v1, v2, v3) => _4d.vector(v0, v1, v2, v3);
  _4d.identity = _4d.matrix([1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]);
  _4d.sum = (v0, v1, v2, v3) => _4d.vector(v0[0] + v1[0] + v2[0] + v3[0], v0[1] + v1[1] + v2[1] + v3[1], v0[2] + v1[2] + v2[2] + v3[2], v0[3] + v1[3] + v2[3] + v3[3]);
  _4d.scale = (v, s) => _4d.vector(v[0] * s, v[1] * s, v[2] * s, v[3] * s);
  _4d.transform = (v, m) => _4d.sum(_4d.scale(m[0], v[0]), _4d.scale(m[1], v[1]), _4d.scale(m[2], v[2]), _4d.scale(m[3], v[3]));
  _4d.multiply = (m0, m1) => _4d.matrix(_4d.transform(m1[0], m0), _4d.transform(m1[1], m0), _4d.transform(m1[2], m0), _4d.transform(m1[3], m0));

  var _la = { _2d, _3d, _4d };

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

      var a = []; // ArrayBuffer?

      for (var x = 0; x < dimensions; x++)
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
    var v = _vector(vector.constructor, vector.length);

    for (var x = 0; x < vector.length; x++)
      v[x] = vector[x] * scalar;

    return v;
  };

  _la.add = function (/* ...vectors */) {
    var v = _vector(arguments[0].constructor, arguments[0].length);

    for (var x = 0; x < v.length; x++)
      for (var y = 0; y < arguments.length; y++)
        v[x] += arguments[y][x];

    return v;
  };

  function _matrix(type, dimensions, values) {
    var m = [];

    for (var x = 0; x < dimensions; x++)
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
    var m = _matrix(type, dimensions);

    for (var i = 0; i < dimensions; i++)
      m[i][i] = 1;

    return m;
  }

  _la.transform = function (vector, matrix) {
    var s = [];

    for (var x = 0; x < vector.length; x++)
      s[x] = _la.scale(matrix[x], vector[x]);

    return _la.add.apply(null, s);
  }

  // This wastes memory, is precomputing values slower though? probably not
  function _multiply(matrix0, matrix1) {
    var m = _matrix(matrix1.length, matrix1[0].constructor);

    for (var x = 0; x < matrix1.length; x++)
      m[x] = _la.transform(matrix1[x], matrix0);

    return m;
  }

  _la.multiply = function (/* ...matricies */) {
    var m = arguments[0];

    for (var x = 1; x < arguments.length; x++)
      m = _multiply(arguments[x], m);

    return m;
  }

}).call(this);

