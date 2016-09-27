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

  const _vector2d = (t, x, y) => t === Array ? [x, y] : new t([x, y]);

  _la.Vector2d = function (type) {
    if (!~_la.TYPES.indexOf(type))
      throw new TypeError();

    return function (values) {
      if (!values)
        values = [0, 0];

      return _vector2d(type, values[0], values[1]);
    };
  };

  const _vector3d = (t, x, y, z) => t === Array ? [x, y, z] : new t([x, y, z]);

  _la.Vector3d = function (type) {
    if (!~_la.TYPES.indexOf(type))
      throw new TypeError();

    return function (values) {
      if (!values)
        values = [0, 0, 0];

      return _vector3d(type, values[0], values[1], values[2]);
    };
  };

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

  _la.scale2d = (v, s) => _vector2d(v.constructor, v[0] * s, v[1] * s);

  _la.scale3d = (v, s) => _vector3d(v.contrustor, v[0] * s, v[1] * s, v[2] * s);

  _la.scale = function (vector, scalar) {
    const v = _vector(vector.constructor, vector.length);

    for (let x = 0; x < vector.length; x++)
      v[x] = vector[x] * scalar;

    return v;
  };

  _la.add2d = (v0, v1) => _vector2d(v0.constructor, v0[0] + v1[0], v0[1] + v1[1]);

  _la.add3d = (v0, v1, v2) => _vector3d(v0.constructor, v0[0] + v1[0] + v2[0], v0[1] + v1[1] + v2[1], v0[2] + v1[2] + v2[2]);

  _la.add = function (/* ...vectors */) {
    const v = _vector(arguments[0].constructor, arguments[0].length);

    for (let x = 0; x < v.length; x++)
      for (let y = 0; y < arguments.length; y++)
        v[x] += arguments[y][x];

    return v;
  };

  const _matrix2d = (t, v0, v1) => _vector2d(t, v0, v1);

  _la.Matrix2d = function (type) {
    if (!~_la.TYPES.indexOf(type))
      throw new TypeError();

    return function (values) {
      if (!values)
        values = [[0, 0], [0, 0]];

      return values === _la.IDENTITY ? _identity2d(type) : _matrix2d(type, values[0], values[1]); 
    };
  };

  const _matrix3d = (t, v0, v1, v2) => _vector3d(t, v0, v1, v2);

  _la.Matrix3d = function (type) {
    if (!~_la.TYPES.indexOf(type))
      throw new TypeError();

    return function (values) {
      if (!values)
        values = [[0, 0, 0], [0, 0, 0]];

      return values === _la.IDENTITY ? _identity3d(type) : _matrix3d(type, values[0], values[1], values[2]); 
    };
  };

  function _matrix(type, dimensions, values) {
    if (type === Array) {
      const m = [];

      for (let x = 0; x < dimensions; x++)
        m[x] = _vector(type, dimensions, values && values[x]);

      return m;
    }

    return new ArrayBuffer(type.byteLength * dimensions);
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

  const _identity2d = t => _matrix2d(t, [1, 0], [0, 1]);

  const _identity3d = t => _matrix3d(t, [1, 0, 0], [0, 1, 0], [0, 0, 1]);

  function _identity(type, dimensions) {
    const m = _matrix(type, dimensions);

    for (let i = 0; i < dimensions; i++)
      m[i][i] = 1;

    return m;
  }

  _la.transform2d = (v, m) => _la.sum2d(_la.scale2d(m[0], v[0]), _la.scale2d(m[1], v[1]));

  _la.transform3d = (v, m) => _la.sum3d(_la.scale3d(m[0], v[0]), _la.scale3d(m[1], v[1]), _la.scale3d(m[2], v[2]));

  _la.transform = function (vector, matrix) {
    const s = [];

    for (let x = 0; x < vector.length; x++)
      s[x] = _la.scale(matrix[x], vector[x]);

    return _la.add.apply(null, s);
  }

  _la.multiply2d = (m0, m1) => _matrix2d(m0[0].constructor, _la.transform2d(m1[0], m0), _la.transform2d(m1[1], m0));

  _la.multiply3d = (m0, m1) => _matrix3d(m0[0].constructor, _la.transform3d(m1[0], m0), _la.transform3d(m1[1], m0), _la.transform3d(m1[2], m0));

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

