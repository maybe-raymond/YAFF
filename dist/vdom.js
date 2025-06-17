// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array, tail) {
    let t = tail || new Empty();
    for (let i = array.length - 1; i >= 0; --i) {
      t = new NonEmpty(array[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    let current = this;
    while (desired-- > 0 && current)
      current = current.tail;
    return current !== void 0;
  }
  // @internal
  hasLength(desired) {
    let current = this;
    while (desired-- > 0 && current)
      current = current.tail;
    return desired === -1 && current instanceof Empty;
  }
  // @internal
  countLength() {
    let current = this;
    let length2 = 0;
    while (current) {
      current = current.tail;
      length2++;
    }
    return length2 - 1;
  }
};
function prepend(element, tail) {
  return new NonEmpty(element, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class {
  /**
   * The size in bits of this bit array's data.
   *
   * @type {number}
   */
  bitSize;
  /**
   * The size in bytes of this bit array's data. If this bit array doesn't store
   * a whole number of bytes then this value is rounded up.
   *
   * @type {number}
   */
  byteSize;
  /**
   * The number of unused high bits in the first byte of this bit array's
   * buffer prior to the start of its data. The value of any unused high bits is
   * undefined.
   *
   * The bit offset will be in the range 0-7.
   *
   * @type {number}
   */
  bitOffset;
  /**
   * The raw bytes that hold this bit array's data.
   *
   * If `bitOffset` is not zero then there are unused high bits in the first
   * byte of this buffer.
   *
   * If `bitOffset + bitSize` is not a multiple of 8 then there are unused low
   * bits in the last byte of this buffer.
   *
   * @type {Uint8Array}
   */
  rawBuffer;
  /**
   * Constructs a new bit array from a `Uint8Array`, an optional size in
   * bits, and an optional bit offset.
   *
   * If no bit size is specified it is taken as `buffer.length * 8`, i.e. all
   * bytes in the buffer make up the new bit array's data.
   *
   * If no bit offset is specified it defaults to zero, i.e. there are no unused
   * high bits in the first byte of the buffer.
   *
   * @param {Uint8Array} buffer
   * @param {number} [bitSize]
   * @param {number} [bitOffset]
   */
  constructor(buffer, bitSize, bitOffset) {
    if (!(buffer instanceof Uint8Array)) {
      throw globalThis.Error(
        "BitArray can only be constructed from a Uint8Array"
      );
    }
    this.bitSize = bitSize ?? buffer.length * 8;
    this.byteSize = Math.trunc((this.bitSize + 7) / 8);
    this.bitOffset = bitOffset ?? 0;
    if (this.bitSize < 0) {
      throw globalThis.Error(`BitArray bit size is invalid: ${this.bitSize}`);
    }
    if (this.bitOffset < 0 || this.bitOffset > 7) {
      throw globalThis.Error(
        `BitArray bit offset is invalid: ${this.bitOffset}`
      );
    }
    if (buffer.length !== Math.trunc((this.bitOffset + this.bitSize + 7) / 8)) {
      throw globalThis.Error("BitArray buffer length is invalid");
    }
    this.rawBuffer = buffer;
  }
  /**
   * Returns a specific byte in this bit array. If the byte index is out of
   * range then `undefined` is returned.
   *
   * When returning the final byte of a bit array with a bit size that's not a
   * multiple of 8, the content of the unused low bits are undefined.
   *
   * @param {number} index
   * @returns {number | undefined}
   */
  byteAt(index3) {
    if (index3 < 0 || index3 >= this.byteSize) {
      return void 0;
    }
    return bitArrayByteAt(this.rawBuffer, this.bitOffset, index3);
  }
  /** @internal */
  equals(other) {
    if (this.bitSize !== other.bitSize) {
      return false;
    }
    const wholeByteCount = Math.trunc(this.bitSize / 8);
    if (this.bitOffset === 0 && other.bitOffset === 0) {
      for (let i = 0; i < wholeByteCount; i++) {
        if (this.rawBuffer[i] !== other.rawBuffer[i]) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (this.rawBuffer[wholeByteCount] >> unusedLowBitCount !== other.rawBuffer[wholeByteCount] >> unusedLowBitCount) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < wholeByteCount; i++) {
        const a = bitArrayByteAt(this.rawBuffer, this.bitOffset, i);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, i);
        if (a !== b) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const a = bitArrayByteAt(
          this.rawBuffer,
          this.bitOffset,
          wholeByteCount
        );
        const b = bitArrayByteAt(
          other.rawBuffer,
          other.bitOffset,
          wholeByteCount
        );
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (a >> unusedLowBitCount !== b >> unusedLowBitCount) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Returns this bit array's internal buffer.
   *
   * @deprecated Use `BitArray.byteAt()` or `BitArray.rawBuffer` instead.
   *
   * @returns {Uint8Array}
   */
  get buffer() {
    bitArrayPrintDeprecationWarning(
      "buffer",
      "Use BitArray.byteAt() or BitArray.rawBuffer instead"
    );
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error(
        "BitArray.buffer does not support unaligned bit arrays"
      );
    }
    return this.rawBuffer;
  }
  /**
   * Returns the length in bytes of this bit array's internal buffer.
   *
   * @deprecated Use `BitArray.bitSize` or `BitArray.byteSize` instead.
   *
   * @returns {number}
   */
  get length() {
    bitArrayPrintDeprecationWarning(
      "length",
      "Use BitArray.bitSize or BitArray.byteSize instead"
    );
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error(
        "BitArray.length does not support unaligned bit arrays"
      );
    }
    return this.rawBuffer.length;
  }
};
function bitArrayByteAt(buffer, bitOffset, index3) {
  if (bitOffset === 0) {
    return buffer[index3] ?? 0;
  } else {
    const a = buffer[index3] << bitOffset & 255;
    const b = buffer[index3 + 1] >> 8 - bitOffset;
    return a | b;
  }
}
var UtfCodepoint = class {
  constructor(value) {
    this.value = value;
  }
};
var isBitArrayDeprecationMessagePrinted = {};
function bitArrayPrintDeprecationWarning(name, message) {
  if (isBitArrayDeprecationMessagePrinted[name]) {
    return;
  }
  console.warn(
    `Deprecated BitArray.${name} property used in JavaScript FFI code. ${message}.`
  );
  isBitArrayDeprecationMessagePrinted[name] = true;
}
function bitArraySlice(bitArray, start, end) {
  end ??= bitArray.bitSize;
  bitArrayValidateRange(bitArray, start, end);
  if (start === end) {
    return new BitArray(new Uint8Array());
  }
  if (start === 0 && end === bitArray.bitSize) {
    return bitArray;
  }
  start += bitArray.bitOffset;
  end += bitArray.bitOffset;
  const startByteIndex = Math.trunc(start / 8);
  const endByteIndex = Math.trunc((end + 7) / 8);
  const byteLength = endByteIndex - startByteIndex;
  let buffer;
  if (startByteIndex === 0 && byteLength === bitArray.rawBuffer.byteLength) {
    buffer = bitArray.rawBuffer;
  } else {
    buffer = new Uint8Array(
      bitArray.rawBuffer.buffer,
      bitArray.rawBuffer.byteOffset + startByteIndex,
      byteLength
    );
  }
  return new BitArray(buffer, end - start, start % 8);
}
function bitArraySliceToInt(bitArray, start, end, isBigEndian, isSigned) {
  bitArrayValidateRange(bitArray, start, end);
  if (start === end) {
    return 0;
  }
  start += bitArray.bitOffset;
  end += bitArray.bitOffset;
  const isStartByteAligned = start % 8 === 0;
  const isEndByteAligned = end % 8 === 0;
  if (isStartByteAligned && isEndByteAligned) {
    return intFromAlignedSlice(
      bitArray,
      start / 8,
      end / 8,
      isBigEndian,
      isSigned
    );
  }
  const size = end - start;
  const startByteIndex = Math.trunc(start / 8);
  const endByteIndex = Math.trunc((end - 1) / 8);
  if (startByteIndex == endByteIndex) {
    const mask2 = 255 >> start % 8;
    const unusedLowBitCount = (8 - end % 8) % 8;
    let value = (bitArray.rawBuffer[startByteIndex] & mask2) >> unusedLowBitCount;
    if (isSigned) {
      const highBit = 2 ** (size - 1);
      if (value >= highBit) {
        value -= highBit * 2;
      }
    }
    return value;
  }
  if (size <= 53) {
    return intFromUnalignedSliceUsingNumber(
      bitArray.rawBuffer,
      start,
      end,
      isBigEndian,
      isSigned
    );
  } else {
    return intFromUnalignedSliceUsingBigInt(
      bitArray.rawBuffer,
      start,
      end,
      isBigEndian,
      isSigned
    );
  }
}
function intFromAlignedSlice(bitArray, start, end, isBigEndian, isSigned) {
  const byteSize = end - start;
  if (byteSize <= 6) {
    return intFromAlignedSliceUsingNumber(
      bitArray.rawBuffer,
      start,
      end,
      isBigEndian,
      isSigned
    );
  } else {
    return intFromAlignedSliceUsingBigInt(
      bitArray.rawBuffer,
      start,
      end,
      isBigEndian,
      isSigned
    );
  }
}
function intFromAlignedSliceUsingNumber(buffer, start, end, isBigEndian, isSigned) {
  const byteSize = end - start;
  let value = 0;
  if (isBigEndian) {
    for (let i = start; i < end; i++) {
      value *= 256;
      value += buffer[i];
    }
  } else {
    for (let i = end - 1; i >= start; i--) {
      value *= 256;
      value += buffer[i];
    }
  }
  if (isSigned) {
    const highBit = 2 ** (byteSize * 8 - 1);
    if (value >= highBit) {
      value -= highBit * 2;
    }
  }
  return value;
}
function intFromAlignedSliceUsingBigInt(buffer, start, end, isBigEndian, isSigned) {
  const byteSize = end - start;
  let value = 0n;
  if (isBigEndian) {
    for (let i = start; i < end; i++) {
      value *= 256n;
      value += BigInt(buffer[i]);
    }
  } else {
    for (let i = end - 1; i >= start; i--) {
      value *= 256n;
      value += BigInt(buffer[i]);
    }
  }
  if (isSigned) {
    const highBit = 1n << BigInt(byteSize * 8 - 1);
    if (value >= highBit) {
      value -= highBit * 2n;
    }
  }
  return Number(value);
}
function intFromUnalignedSliceUsingNumber(buffer, start, end, isBigEndian, isSigned) {
  const isStartByteAligned = start % 8 === 0;
  let size = end - start;
  let byteIndex = Math.trunc(start / 8);
  let value = 0;
  if (isBigEndian) {
    if (!isStartByteAligned) {
      const leadingBitsCount = 8 - start % 8;
      value = buffer[byteIndex++] & (1 << leadingBitsCount) - 1;
      size -= leadingBitsCount;
    }
    while (size >= 8) {
      value *= 256;
      value += buffer[byteIndex++];
      size -= 8;
    }
    if (size > 0) {
      value *= 2 ** size;
      value += buffer[byteIndex] >> 8 - size;
    }
  } else {
    if (isStartByteAligned) {
      let size2 = end - start;
      let scale = 1;
      while (size2 >= 8) {
        value += buffer[byteIndex++] * scale;
        scale *= 256;
        size2 -= 8;
      }
      value += (buffer[byteIndex] >> 8 - size2) * scale;
    } else {
      const highBitsCount = start % 8;
      const lowBitsCount = 8 - highBitsCount;
      let size2 = end - start;
      let scale = 1;
      while (size2 >= 8) {
        const byte = buffer[byteIndex] << highBitsCount | buffer[byteIndex + 1] >> lowBitsCount;
        value += (byte & 255) * scale;
        scale *= 256;
        size2 -= 8;
        byteIndex++;
      }
      if (size2 > 0) {
        const lowBitsUsed = size2 - Math.max(0, size2 - lowBitsCount);
        let trailingByte = (buffer[byteIndex] & (1 << lowBitsCount) - 1) >> lowBitsCount - lowBitsUsed;
        size2 -= lowBitsUsed;
        if (size2 > 0) {
          trailingByte *= 2 ** size2;
          trailingByte += buffer[byteIndex + 1] >> 8 - size2;
        }
        value += trailingByte * scale;
      }
    }
  }
  if (isSigned) {
    const highBit = 2 ** (end - start - 1);
    if (value >= highBit) {
      value -= highBit * 2;
    }
  }
  return value;
}
function intFromUnalignedSliceUsingBigInt(buffer, start, end, isBigEndian, isSigned) {
  const isStartByteAligned = start % 8 === 0;
  let size = end - start;
  let byteIndex = Math.trunc(start / 8);
  let value = 0n;
  if (isBigEndian) {
    if (!isStartByteAligned) {
      const leadingBitsCount = 8 - start % 8;
      value = BigInt(buffer[byteIndex++] & (1 << leadingBitsCount) - 1);
      size -= leadingBitsCount;
    }
    while (size >= 8) {
      value *= 256n;
      value += BigInt(buffer[byteIndex++]);
      size -= 8;
    }
    if (size > 0) {
      value <<= BigInt(size);
      value += BigInt(buffer[byteIndex] >> 8 - size);
    }
  } else {
    if (isStartByteAligned) {
      let size2 = end - start;
      let shift = 0n;
      while (size2 >= 8) {
        value += BigInt(buffer[byteIndex++]) << shift;
        shift += 8n;
        size2 -= 8;
      }
      value += BigInt(buffer[byteIndex] >> 8 - size2) << shift;
    } else {
      const highBitsCount = start % 8;
      const lowBitsCount = 8 - highBitsCount;
      let size2 = end - start;
      let shift = 0n;
      while (size2 >= 8) {
        const byte = buffer[byteIndex] << highBitsCount | buffer[byteIndex + 1] >> lowBitsCount;
        value += BigInt(byte & 255) << shift;
        shift += 8n;
        size2 -= 8;
        byteIndex++;
      }
      if (size2 > 0) {
        const lowBitsUsed = size2 - Math.max(0, size2 - lowBitsCount);
        let trailingByte = (buffer[byteIndex] & (1 << lowBitsCount) - 1) >> lowBitsCount - lowBitsUsed;
        size2 -= lowBitsUsed;
        if (size2 > 0) {
          trailingByte <<= size2;
          trailingByte += buffer[byteIndex + 1] >> 8 - size2;
        }
        value += BigInt(trailingByte) << shift;
      }
    }
  }
  if (isSigned) {
    const highBit = 2n ** BigInt(end - start - 1);
    if (value >= highBit) {
      value -= highBit * 2n;
    }
  }
  return Number(value);
}
function bitArrayValidateRange(bitArray, start, end) {
  if (start < 0 || start > bitArray.bitSize || end < start || end > bitArray.bitSize) {
    const msg = `Invalid bit array slice: start = ${start}, end = ${end}, bit size = ${bitArray.bitSize}`;
    throw new globalThis.Error(msg);
  }
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values2 = [x, y];
  while (values2.length) {
    let a = values2.pop();
    let b = values2.pop();
    if (a === b)
      continue;
    if (!isObject(a) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a, b) || unequalDates(a, b) || unequalBuffers(a, b) || unequalArrays(a, b) || unequalMaps(a, b) || unequalSets(a, b) || unequalRegExps(a, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys, get] = getters(a);
    for (let k of keys(a)) {
      values2.push(get(a, k), get(b, k));
    }
  }
  return true;
}
function getters(object) {
  if (object instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}
function unequalBuffers(a, b) {
  return !(a instanceof BitArray) && a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT && !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]));
}
function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}
function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}
function unequalSets(a, b) {
  return a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)));
}
function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c))
    return false;
  return a.constructor === b.constructor;
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = /* @__PURE__ */ new DataView(
  /* @__PURE__ */ new ArrayBuffer(8)
);
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys = Object.keys(o);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at] = val;
  return out;
}
function spliceIn(arr, at, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root, shift, hash, key, val, addedLeaf) {
  switch (root.type) {
    case ARRAY_NODE:
      return assocArray(root, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size + 1,
      array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: ARRAY_NODE,
        size: root.size,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root.size,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node) {
    return root;
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function assocIndex(root, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root.bitmap, bit);
  if ((root.bitmap & bit) !== 0) {
    const node = root.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root;
      }
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap,
      array: cloneAndSet(
        root.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      )
    };
  } else {
    const n = root.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node = root.array[j++];
          nodes[i] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root, shift, hash, key, val, addedLeaf) {
  if (hash === root.hash) {
    const idx = collisionIndexOf(root, key);
    if (idx !== -1) {
      const entry = root.array[idx];
      if (entry.v === val) {
        return root;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size = root.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root.array, size, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root.hash, shift),
      array: [root]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root, key) {
  const size = root.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return findArray(root, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root, key);
  }
}
function findArray(root, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root, key) {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return void 0;
  }
  return root.array[idx];
}
function without(root, shift, hash, key) {
  switch (root.type) {
    case ARRAY_NODE:
      return withoutArray(root, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root, key);
  }
}
function withoutArray(root, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root.array[idx];
  if (node === void 0) {
    return root;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root;
    }
  }
  if (n === void 0) {
    if (root.size <= MIN_ARRAY_NODE) {
      const arr = root.array;
      const out = new Array(root.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root.size - 1,
      array: cloneAndSet(root.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root.size,
    array: cloneAndSet(root.array, idx, n)
  };
}
function withoutIndex(root, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root.bitmap & bit) === 0) {
    return root;
  }
  const idx = index(root.bitmap, bit);
  const node = root.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root.bitmap,
        array: cloneAndSet(root.array, idx, n)
      };
    }
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  if (isEqual(key, node.k)) {
    if (root.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root.bitmap ^ bit,
      array: spliceOut(root.array, idx)
    };
  }
  return root;
}
function withoutCollision(root, key) {
  const idx = collisionIndexOf(root, key);
  if (idx < 0) {
    return root;
  }
  if (root.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root.hash,
    array: spliceOut(root.array, idx)
  };
}
function forEach(root, fn) {
  if (root === void 0) {
    return;
  }
  const items = root.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root, size) {
    this.root = root;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    try {
      this.forEach((v, k) => {
        if (!isEqual(o.get(k, !v), v)) {
          throw unequalDictSymbol;
        }
      });
      return true;
    } catch (e) {
      if (e === unequalDictSymbol) {
        return false;
      }
      throw e;
    }
  }
};
var unequalDictSymbol = /* @__PURE__ */ Symbol();

// build/dev/javascript/gleam_stdlib/gleam/dict.mjs
function do_has_key(key, dict2) {
  return !isEqual(map_get(dict2, key), new Error(void 0));
}
function has_key(dict2, key) {
  return do_has_key(key, dict2);
}
function insert(dict2, key, value) {
  return map_insert(key, value, dict2);
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix instanceof Empty) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function reverse(list2) {
  return reverse_and_prepend(list2, toList([]));
}
function is_empty(list2) {
  return isEqual(list2, toList([]));
}
function contains(loop$list, loop$elem) {
  while (true) {
    let list2 = loop$list;
    let elem = loop$elem;
    if (list2 instanceof Empty) {
      return false;
    } else {
      let first$1 = list2.head;
      if (isEqual(first$1, elem)) {
        return true;
      } else {
        let rest$1 = list2.tail;
        loop$list = rest$1;
        loop$elem = elem;
      }
    }
  }
}
function first(list2) {
  if (list2 instanceof Empty) {
    return new Error(void 0);
  } else {
    let first$1 = list2.head;
    return new Ok(first$1);
  }
}
function filter_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list2 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list2.head;
      let rest$1 = list2.tail;
      let _block;
      let $ = fun(first$1);
      if ($) {
        _block = prepend(first$1, acc);
      } else {
        _block = acc;
      }
      let new_acc = _block;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list2, predicate) {
  return filter_loop(list2, predicate, toList([]));
}
function map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list2 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list2.head;
      let rest$1 = list2.tail;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = prepend(fun(first$1), acc);
    }
  }
}
function map(list2, fun) {
  return map_loop(list2, fun, toList([]));
}
function append_loop(loop$first, loop$second) {
  while (true) {
    let first2 = loop$first;
    let second = loop$second;
    if (first2 instanceof Empty) {
      return second;
    } else {
      let first$1 = first2.head;
      let rest$1 = first2.tail;
      loop$first = rest$1;
      loop$second = prepend(first$1, second);
    }
  }
}
function append(first2, second) {
  return append_loop(reverse(first2), second);
}
function unique_loop(loop$list, loop$seen, loop$acc) {
  while (true) {
    let list2 = loop$list;
    let seen = loop$seen;
    let acc = loop$acc;
    if (list2 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list2.head;
      let rest$1 = list2.tail;
      let $ = has_key(seen, first$1);
      if ($) {
        loop$list = rest$1;
        loop$seen = seen;
        loop$acc = acc;
      } else {
        loop$list = rest$1;
        loop$seen = insert(seen, first$1, void 0);
        loop$acc = prepend(first$1, acc);
      }
    }
  }
}
function unique(list2) {
  return unique_loop(list2, new_map(), toList([]));
}
function each(loop$list, loop$f) {
  while (true) {
    let list2 = loop$list;
    let f = loop$f;
    if (list2 instanceof Empty) {
      return void 0;
    } else {
      let first$1 = list2.head;
      let rest$1 = list2.tail;
      f(first$1);
      loop$list = rest$1;
      loop$f = f;
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function to_string(term) {
  return term.toString();
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join("");
var trim_start_regex = /* @__PURE__ */ new RegExp(
  `^[${unicode_whitespaces}]*`
);
var trim_end_regex = /* @__PURE__ */ new RegExp(`[${unicode_whitespaces}]*$`);
function console_log(term) {
  console.log(term);
}
function print(string2) {
  if (typeof process === "object" && process.stdout?.write) {
    process.stdout.write(string2);
  } else if (typeof Deno === "object") {
    Deno.stdout.writeSync(new TextEncoder().encode(string2));
  } else {
    console.log(string2);
  }
}
function print_error(string2) {
  if (typeof process === "object" && process.stderr?.write) {
    process.stderr.write(string2);
  } else if (typeof Deno === "object") {
    Deno.stderr.writeSync(new TextEncoder().encode(string2));
  } else {
    console.error(string2);
  }
}
function new_map() {
  return Dict.new();
}
function map_get(map2, key) {
  const value = map2.get(key, NOT_FOUND);
  if (value === NOT_FOUND) {
    return new Error(Nil);
  }
  return new Ok(value);
}
function map_insert(key, value, map2) {
  return map2.set(key, value);
}

// build/dev/javascript/vdom/dom_ffi.mjs
function query_selector(selectors) {
  const node = document.querySelector(selectors);
  if (node)
    return new Ok(node);
  return new Error();
}
function create_element(element) {
  return document.createElement(element);
}
function set_element_text(element, content) {
  element.textContent = content;
}
function dom_replace_with(prev, new_element) {
  prev.replaceWith(new_element);
}
function set_attribute(ele, attri) {
  ele.setAttribute(attri[0], attri[1]);
}
function remove_attribute(ele, attri) {
  ele.removeAttribute(attri[0], attri[1]);
}
function append_element(parent, child) {
  parent.appendChild(child);
}
function set_element_event_prop(element, msg) {
  element["_event_msg"] = msg;
}
function remove_element_event_prop(element, msg) {
  element["_event_msg"] = Null;
}
function get_children(element) {
  let values2 = List.fromArray(element.children);
  return values2;
}
function Browser_init_loop(init_model, update2, view, root, events, diff_one2, apply_dom) {
  console.log("Now runnig Browser");
  let curr_state = init_model;
  let curr_view = view(init_model);
  console.log({ curr_state, curr_view });
  let event_array = [...events];
  console.log(event_array);
  event_array.forEach((name) => {
    root.addEventListener(name, (event) => {
      console.log("clicked");
      if (event.target && event.target["_event_msg"]) {
        let new_state = update2(event["_event_msg"], curr_state);
        let new_html = view(new_state);
        let mod_tree = diff_one2(curr_view, new_html);
        apply_dom(root, mod_tree);
        console.log({ new_html });
        console.log({ curr_view });
        console.log({ new_state });
        console.log({ curr_state });
        console.log({ mod_tree });
        curr_state = new_state;
        curr_view = new_html;
      }
    });
  });
}

// build/dev/javascript/vdom/vdom/virtual_dom.mjs
var Prop = class extends CustomType {
  constructor(name, value) {
    super();
    this.name = name;
    this.value = value;
  }
};
var Event = class extends CustomType {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
  }
};
var HTMLTag = class extends CustomType {
  constructor(tagname, properties, children) {
    super();
    this.tagname = tagname;
    this.properties = properties;
    this.children = children;
  }
};
var TextNode = class extends CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
};
var Nop = class extends CustomType {
};
var Create = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var Remove = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var Replace = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var Modify = class extends CustomType {
  constructor(element, prop_remove, prop_add) {
    super();
    this.element = element;
    this.prop_remove = prop_remove;
    this.prop_add = prop_add;
  }
};
var ModTree = class extends CustomType {
  constructor(diff_op, children) {
    super();
    this.diff_op = diff_op;
    this.children = children;
  }
};
function on(event_type, msg) {
  return new Event(event_type, msg);
}
function onclick(msg) {
  return on("click", msg);
}
function remove_prop(old_prop, new_prop) {
  return filter(old_prop, (x) => {
    return !contains(new_prop, x);
  });
}
function set_prop(old_prop, new_prop) {
  return filter(new_prop, (x) => {
    return !contains(old_prop, x);
  });
}
function diff_list(old, new$) {
  if (new$ instanceof Empty) {
    if (old instanceof Empty) {
      return toList([new ModTree(new Nop(), toList([]))]);
    } else {
      let $ = old.tail;
      if ($ instanceof Empty) {
        let old_node = old.head;
        return toList([new ModTree(new Remove(old_node), toList([]))]);
      } else {
        let old_node = old.head;
        let rest = $;
        return append(
          toList([new ModTree(new Remove(old_node), toList([]))]),
          map(
            rest,
            (x) => {
              return new ModTree(new Remove(x), toList([]));
            }
          )
        );
      }
    }
  } else if (old instanceof Empty) {
    let $ = new$.tail;
    if ($ instanceof Empty) {
      let new_node = new$.head;
      return toList([new ModTree(new Create(new_node), toList([]))]);
    } else {
      let new_node = new$.head;
      let rest = $;
      return append(
        toList([new ModTree(new Create(new_node), toList([]))]),
        map(
          rest,
          (x) => {
            return new ModTree(new Create(x), toList([]));
          }
        )
      );
    }
  } else {
    let $ = old.tail;
    if ($ instanceof Empty) {
      let $1 = new$.tail;
      if ($1 instanceof Empty) {
        let new_node = new$.head;
        let old_node = old.head;
        return toList([diff_one(old_node, new_node)]);
      } else {
        let new_node = new$.head;
        let rest_2 = $1;
        let old_node = old.head;
        let rest_1 = $;
        let tree = diff_one(old_node, new_node);
        let other = diff_list(rest_1, rest_2);
        return append(toList([tree]), other);
      }
    } else {
      let new_node = new$.head;
      let rest_2 = new$.tail;
      let old_node = old.head;
      let rest_1 = $;
      let tree = diff_one(old_node, new_node);
      let other = diff_list(rest_1, rest_2);
      return append(toList([tree]), other);
    }
  }
}
function diff_one(old, new$) {
  if (new$ instanceof HTMLTag) {
    if (old instanceof HTMLTag) {
      let tag_2 = new$.tagname;
      let prop_2 = new$.properties;
      let child_2 = new$.children;
      let tag_1 = old.tagname;
      let prop_1 = old.properties;
      let child_1 = old.children;
      let $ = tag_1 === tag_2;
      if ($) {
        let mod_children = diff_list(child_1, child_2);
        let prop_remove = remove_prop(prop_1, prop_2);
        let prop_set = set_prop(prop_1, prop_2);
        let $1 = is_empty(prop_1) === is_empty(prop_2);
        if ($1) {
          return new ModTree(new Nop(), mod_children);
        } else {
          return new ModTree(
            new Modify(new$, prop_remove, prop_set),
            mod_children
          );
        }
      } else {
        return new ModTree(new Replace(new$), toList([]));
      }
    } else {
      return new ModTree(new Replace(new$), toList([]));
    }
  } else if (old instanceof HTMLTag) {
    return new ModTree(new Replace(new$), toList([]));
  } else {
    let txt_2 = new$.content;
    let txt_1 = old.content;
    let $ = txt_1 === txt_2;
    if ($) {
      return new ModTree(new Nop(), toList([]));
    } else {
      return new ModTree(new Replace(new$), toList([]));
    }
  }
}

// build/dev/javascript/vdom/vdom/dom_ffi.mjs
function set_attribute_type(ele, props) {
  if (props instanceof Empty) {
    return toList([]);
  } else {
    let $ = props.tail;
    if ($ instanceof Empty) {
      let first2 = props.head;
      if (first2 instanceof Prop) {
        let name = first2.name;
        let value = first2.value;
        set_attribute(ele, [name, value]);
        return toList([]);
      } else {
        let name = first2.name;
        let args = first2.args;
        set_element_event_prop(ele, args);
        return toList([name]);
      }
    } else {
      let first2 = props.head;
      let rest = $;
      let _block;
      if (first2 instanceof Prop) {
        let name = first2.name;
        let value = first2.value;
        set_attribute(ele, [name, value]);
        _block = toList([]);
      } else {
        let name = first2.name;
        let args = first2.args;
        set_element_event_prop(ele, args);
        _block = toList([name]);
      }
      let lst = _block;
      return append(lst, set_attribute_type(ele, rest));
    }
  }
}
function remove_attribute_type(loop$ele, loop$props) {
  while (true) {
    let ele = loop$ele;
    let props = loop$props;
    if (props instanceof Empty) {
      return void 0;
    } else {
      let $ = props.tail;
      if ($ instanceof Empty) {
        let first2 = props.head;
        if (first2 instanceof Prop) {
          let name = first2.name;
          let value = first2.value;
          return remove_attribute(ele, [name, value]);
        } else {
          return remove_element_event_prop(ele);
        }
      } else {
        let first2 = props.head;
        let rest = $;
        if (first2 instanceof Prop) {
          let name = first2.name;
          let value = first2.value;
          set_attribute(ele, [name, value]);
        } else {
          remove_element_event_prop(ele);
        }
        loop$ele = ele;
        loop$props = rest;
      }
    }
  }
}

// build/dev/javascript/vdom/vdom/html.mjs
function p(props, children) {
  return new HTMLTag("p", props, children);
}
function div(props, children) {
  return new HTMLTag("div", props, children);
}
function button(props, children) {
  return new HTMLTag(
    "button",
    append(props, toList([new Prop("type", "button")])),
    children
  );
}

// build/dev/javascript/vdom/vdom.mjs
var Increment = class extends CustomType {
};
var Decrement = class extends CustomType {
};
function modify_dom(ele, prop_remove, prop_add) {
  set_attribute_type(ele, prop_add);
  return remove_attribute_type(ele, prop_remove);
}
function yet_another_create_elements(root, v_element) {
  if (v_element instanceof HTMLTag) {
    let tag = v_element.tagname;
    let props = v_element.properties;
    let children = v_element.children;
    let new_tag = create_element(tag);
    set_attribute_type(new_tag, props);
    each(
      children,
      (x) => {
        return yet_another_create_elements(new_tag, x);
      }
    );
    return append_element(root, new_tag);
  } else {
    let content = v_element.content;
    return set_element_text(root, content);
  }
}
function replace_from_dom(root, element) {
  if (element instanceof HTMLTag) {
    let tag = element.tagname;
    let props = element.properties;
    let children = element.children;
    let new_element = create_element(tag);
    set_attribute_type(new_element, props);
    each(
      children,
      (x) => {
        return yet_another_create_elements(new_element, x);
      }
    );
    return dom_replace_with(root, new_element);
  } else {
    let content = element.content;
    return set_element_text(root, content);
  }
}
function diff_one_proxy(old, new$) {
  return diff_one(old, new$);
}
function update(msg, s) {
  if (msg instanceof Increment) {
    return s + 1;
  } else {
    return s - 1;
  }
}
function main_view(s) {
  return div(
    toList([]),
    toList([
      button(
        toList([onclick(new Increment())]),
        toList([new TextNode("+")])
      ),
      p(toList([]), toList([new TextNode(to_string(s))])),
      button(
        toList([onclick(new Decrement())]),
        toList([new TextNode("-")])
      )
    ])
  );
}
function main_view_2(_) {
  return div(
    toList([]),
    toList([
      button(
        toList([onclick(new Increment())]),
        toList([new TextNode("+")])
      ),
      p(toList([]), toList([new TextNode("2")])),
      button(
        toList([onclick(new Decrement())]),
        toList([new TextNode("-")])
      )
    ])
  );
}
function apply_to_modtree_list(loop$parent, loop$elements, loop$tree) {
  while (true) {
    let parent = loop$parent;
    let elements = loop$elements;
    let tree = loop$tree;
    if (tree instanceof Empty) {
      if (elements instanceof Empty) {
        return void 0;
      } else {
        return void 0;
      }
    } else if (elements instanceof Empty) {
      let tree$1 = tree.head;
      return parse_dom_tree(parent, tree$1);
    } else {
      let $ = elements.tail;
      if ($ instanceof Empty) {
        let $1 = tree.tail;
        if ($1 instanceof Empty) {
          let tree$1 = tree.head;
          let ele = elements.head;
          return parse_dom_tree(ele, tree$1);
        } else {
          let tree_op = tree.head;
          let op_rest = $1;
          let ele = elements.head;
          let siblings = $;
          parse_dom_tree(ele, tree_op);
          loop$parent = ele;
          loop$elements = siblings;
          loop$tree = op_rest;
        }
      } else {
        let tree_op = tree.head;
        let op_rest = tree.tail;
        let ele = elements.head;
        let siblings = $;
        parse_dom_tree(ele, tree_op);
        loop$parent = ele;
        loop$elements = siblings;
        loop$tree = op_rest;
      }
    }
  }
}
function parse_dom_tree(ele, tree) {
  let $ = tree.diff_op;
  if ($ instanceof Nop) {
    print("No Op moving to Children");
    let child_elements = get_children(ele);
    return apply_to_modtree_list(ele, child_elements, tree.children);
  } else if ($ instanceof Create) {
    let dom = $[0];
    print("creating element");
    return yet_another_create_elements(ele, dom);
  } else if ($ instanceof Remove) {
    let dom = $[0];
    print("Removing Dom");
    return set_element_text(ele);
  } else if ($ instanceof Replace) {
    let dom = $[0];
    print("Replacing Dom");
    return replace_from_dom(ele, dom);
  } else {
    let prop_remove = $.prop_remove;
    let prop_set = $.prop_add;
    print("Modifying props");
    modify_dom(ele, prop_remove, prop_set);
    let children = get_children(ele);
    return apply_to_modtree_list(ele, children, tree.children);
  }
}
function apply_to_dom(root, tree) {
  let children = get_children(root);
  let $ = first(children);
  if ($ instanceof Ok) {
    let ele = $[0];
    return parse_dom_tree(ele, tree);
  } else {
    return void 0;
  }
}
function apply_dom_from_root(root, tree) {
  let children = get_children(root);
  if (children instanceof Empty) {
    return void 0;
  } else {
    let $ = children.tail;
    if ($ instanceof Empty) {
      let ele = children.head;
      return apply_to_dom(ele, tree);
    } else {
      let ele = children.head;
      return apply_to_dom(ele, tree);
    }
  }
}
function create_element_from_list_vdom(root, v_elements, curr_event) {
  if (v_elements instanceof Empty) {
    return curr_event;
  } else {
    let $ = v_elements.tail;
    if ($ instanceof Empty) {
      let element = v_elements.head;
      let values2 = create_element_from_vhtml(root, element);
      return append(values2[1], curr_event);
    } else {
      let element = v_elements.head;
      let rest = $;
      let values2 = create_element_from_vhtml(root, element);
      let rest_of_events = create_element_from_list_vdom(root, rest, values2[1]);
      return append(rest_of_events, curr_event);
    }
  }
}
function create_element_from_vhtml(root, v_element) {
  if (v_element instanceof HTMLTag) {
    let tag = v_element.tagname;
    let props = v_element.properties;
    let children = v_element.children;
    let new_element = create_element(tag);
    let event = set_attribute_type(new_element, props);
    append_element(root, new_element);
    let other_events = create_element_from_list_vdom(
      new_element,
      children,
      toList([])
    );
    return [new_element, append(other_events, event)];
  } else {
    let content = v_element.content;
    set_element_text(root, content);
    return [root, toList([])];
  }
}
function inital_dom_apply(root, html) {
  let node_event_tuple = create_element_from_vhtml(root, html);
  return node_event_tuple[1];
}
function main() {
  console_log("Starting up");
  let init_state = 0;
  let v_1 = main_view(init_state);
  let v_2 = main_view_2(init_state);
  let mod = diff_one(v_1, v_2);
  echo(mod, "src\\vdom.gleam", 227);
  let $ = query_selector("#main");
  if ($ instanceof Ok) {
    let ele = $[0];
    print("Setting up event");
    let current_view = main_view(init_state);
    let events = unique(inital_dom_apply(ele, current_view));
    return Browser_init_loop(
      init_state,
      update,
      main_view,
      ele,
      events,
      diff_one,
      apply_to_dom
    );
  } else {
    return print_error("No element called #main found");
  }
}
function echo(value, file, line) {
  const grey = "\x1B[90m";
  const reset_color = "\x1B[39m";
  const file_line = `${file}:${line}`;
  const string_value = echo$inspect(value);
  if (globalThis.process?.stderr?.write) {
    const string2 = `${grey}${file_line}${reset_color}
${string_value}
`;
    process.stderr.write(string2);
  } else if (globalThis.Deno) {
    const string2 = `${grey}${file_line}${reset_color}
${string_value}
`;
    globalThis.Deno.stderr.writeSync(new TextEncoder().encode(string2));
  } else {
    const string2 = `${file_line}
${string_value}`;
    globalThis.console.log(string2);
  }
  return value;
}
function echo$inspectString(str) {
  let new_str = '"';
  for (let i = 0; i < str.length; i++) {
    let char = str[i];
    if (char == "\n")
      new_str += "\\n";
    else if (char == "\r")
      new_str += "\\r";
    else if (char == "	")
      new_str += "\\t";
    else if (char == "\f")
      new_str += "\\f";
    else if (char == "\\")
      new_str += "\\\\";
    else if (char == '"')
      new_str += '\\"';
    else if (char < " " || char > "~" && char < "\xA0") {
      new_str += "\\u{" + char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0") + "}";
    } else {
      new_str += char;
    }
  }
  new_str += '"';
  return new_str;
}
function echo$inspectDict(map2) {
  let body = "dict.from_list([";
  let first2 = true;
  let key_value_pairs = [];
  map2.forEach((value, key) => {
    key_value_pairs.push([key, value]);
  });
  key_value_pairs.sort();
  key_value_pairs.forEach(([key, value]) => {
    if (!first2)
      body = body + ", ";
    body = body + "#(" + echo$inspect(key) + ", " + echo$inspect(value) + ")";
    first2 = false;
  });
  return body + "])";
}
function echo$inspectCustomType(record) {
  const props = globalThis.Object.keys(record).map((label) => {
    const value = echo$inspect(record[label]);
    return isNaN(parseInt(label)) ? `${label}: ${value}` : value;
  }).join(", ");
  return props ? `${record.constructor.name}(${props})` : record.constructor.name;
}
function echo$inspectObject(v) {
  const name = Object.getPrototypeOf(v)?.constructor?.name || "Object";
  const props = [];
  for (const k of Object.keys(v)) {
    props.push(`${echo$inspect(k)}: ${echo$inspect(v[k])}`);
  }
  const body = props.length ? " " + props.join(", ") + " " : "";
  const head = name === "Object" ? "" : name + " ";
  return `//js(${head}{${body}})`;
}
function echo$inspect(v) {
  const t = typeof v;
  if (v === true)
    return "True";
  if (v === false)
    return "False";
  if (v === null)
    return "//js(null)";
  if (v === void 0)
    return "Nil";
  if (t === "string")
    return echo$inspectString(v);
  if (t === "bigint" || t === "number")
    return v.toString();
  if (globalThis.Array.isArray(v))
    return `#(${v.map(echo$inspect).join(", ")})`;
  if (v instanceof List)
    return `[${v.toArray().map(echo$inspect).join(", ")}]`;
  if (v instanceof UtfCodepoint)
    return `//utfcodepoint(${String.fromCodePoint(v.value)})`;
  if (v instanceof BitArray)
    return echo$inspectBitArray(v);
  if (v instanceof CustomType)
    return echo$inspectCustomType(v);
  if (echo$isDict(v))
    return echo$inspectDict(v);
  if (v instanceof Set)
    return `//js(Set(${[...v].map(echo$inspect).join(", ")}))`;
  if (v instanceof RegExp)
    return `//js(${v})`;
  if (v instanceof Date)
    return `//js(Date("${v.toISOString()}"))`;
  if (v instanceof Function) {
    const args = [];
    for (const i of Array(v.length).keys())
      args.push(String.fromCharCode(i + 97));
    return `//fn(${args.join(", ")}) { ... }`;
  }
  return echo$inspectObject(v);
}
function echo$inspectBitArray(bitArray) {
  let endOfAlignedBytes = bitArray.bitOffset + 8 * Math.trunc(bitArray.bitSize / 8);
  let alignedBytes = bitArraySlice(
    bitArray,
    bitArray.bitOffset,
    endOfAlignedBytes
  );
  let remainingUnalignedBits = bitArray.bitSize % 8;
  if (remainingUnalignedBits > 0) {
    let remainingBits = bitArraySliceToInt(
      bitArray,
      endOfAlignedBytes,
      bitArray.bitSize,
      false,
      false
    );
    let alignedBytesArray = Array.from(alignedBytes.rawBuffer);
    let suffix = `${remainingBits}:size(${remainingUnalignedBits})`;
    if (alignedBytesArray.length === 0) {
      return `<<${suffix}>>`;
    } else {
      return `<<${Array.from(alignedBytes.rawBuffer).join(", ")}, ${suffix}>>`;
    }
  } else {
    return `<<${Array.from(alignedBytes.rawBuffer).join(", ")}>>`;
  }
}
function echo$isDict(value) {
  try {
    return value instanceof Dict;
  } catch {
    return false;
  }
}
export {
  Decrement,
  Increment,
  apply_dom_from_root,
  apply_to_dom,
  apply_to_modtree_list,
  create_element_from_list_vdom,
  create_element_from_vhtml,
  diff_one_proxy,
  inital_dom_apply,
  main,
  main_view,
  main_view_2,
  modify_dom,
  replace_from_dom,
  update
};
