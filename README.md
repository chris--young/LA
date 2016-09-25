# LA

Matrix multiplication

## Installation

LA has no dependencies but requires some ES6 support.

```

  ➜ npm install @chris-young/la
  ➜ bower install la.js

```

## Basic Usage

```

  const f_Matrix = LA.Matrix(Float64Array);
  const f_Matrix4d = f_Matrix(4);

  let m_camera = f_Matrix4d(LA.IDENTITY);

  let r = Math.PI / 4;
  let c = Math.cos(r);
  let s = Math.sin(r);

  let m_rotate = f_Matrix4d([
    [1,  0,  0,  0],
    [0,  c, -s,  0],
    [0,  s,  c,  0],
    [0,  0,  0,  1]
  ]);

  let z = 1.5;

  let m_zoom = f_Matrix4d([
    [z,  0,  0,  0],
    [0,  z,  0,  0],
    [0,  0,  z,  0],
    [0,  0,  0,  1]
  ]);

  m_camera = LA.multiply(m_camera, m_rotate, m_zoom);

```

## Documentation

### Properties

> *la*.TYPES __Array__

`[Array, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array]`

LA can use Arrays, or [TypedArrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays). If you use a regular array your matricies should be compatible with other libraries like [mathjs](http://mathjs.org/).

> *la*.IDENTITY __Symbol__

Pass this in to `la.Matrix` to get the identity instead of all zeros.

--------

### Methods

> *la*.Vector(*type*)(*dimensions*)(*values*)

Returns a vector

#### Parameters

+ __type:__ Function 	
+ __dimensions:__ Integer
+ __values:__ (optional) Array

--------

> *la*.scale(*vector*, *scalar*)

Returns a scaled vector

#### Parameters

+ __vector:__ Array
+ __scalar:__ Number
  
--------

> *la*.add(*...vectors*)

Returns the sum of two or more vectors

#### Parameters

+ __...vectors:__ Arrays
  
--------

> *la*.Matrix(*type*)(*dimensions*)(*values*)

Returns a matrix

#### Parameters

+ __type:__ Function
+ __dimensions:__ Integer
+ __values:__ (optional) Array | Symbol
  
--------

> Array *la*.transform(*vector*, *matrix*)

Returns a vector transformed by a matrix

#### Parameters

+ __vector:__ Array
+ __matrix:__ Array
  
--------

> Array *la*.multiply(*...matricies*)

Returns the product of two or more matricies

#### Parameters

+ __...matricies:__ Arrays

