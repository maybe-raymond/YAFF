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
    let current2 = this;
    while (desired-- > 0 && current2)
      current2 = current2.tail;
    return current2 !== void 0;
  }
  // @internal
  hasLength(desired) {
    let current2 = this;
    while (desired-- > 0 && current2)
      current2 = current2.tail;
    return desired === -1 && current2 instanceof Empty;
  }
  // @internal
  countLength() {
    let current2 = this;
    let length2 = 0;
    while (current2) {
      current2 = current2.tail;
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
  constructor(current2) {
    this.#current = current2;
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
  byteAt(index2) {
    if (index2 < 0 || index2 >= this.byteSize) {
      return void 0;
    }
    return bitArrayByteAt(this.rawBuffer, this.bitOffset, index2);
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
function bitArrayByteAt(buffer, bitOffset, index2) {
  if (bitOffset === 0) {
    return buffer[index2] ?? 0;
  } else {
    const a = buffer[index2] << bitOffset & 255;
    const b = buffer[index2 + 1] >> 8 - bitOffset;
    return a | b;
  }
}
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
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
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
    let first = loop$first;
    let second = loop$second;
    if (first instanceof Empty) {
      return second;
    } else {
      let first$1 = first.head;
      let rest$1 = first.tail;
      loop$first = rest$1;
      loop$second = prepend(first$1, second);
    }
  }
}
function append2(first, second) {
  return append_loop(reverse(first), second);
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

// build/dev/javascript/vdom/dom_ffi.mjs
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
function set_all_attributes(ele, attribute_array) {
  let attribute_list = [...attribute_array];
  attribute_list.forEach((attri) => {
    set_attribute(ele, attri);
  });
}
function remove_attribute(ele, attri) {
  ele.removeAttribute(attri[0], attri[1]);
}
function remove_all_attributes(ele, attribute_array) {
  let attribute_list = [...attribute_array];
  attribute_list.forEach((attri) => {
    remove_attribute(ele, attri);
  });
}
function append_element(parent, child) {
  parent.appendChild(child);
}

// build/dev/javascript/vdom/vdom/virtual_dom.mjs
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
  constructor(prop_remove, prop_add) {
    super();
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
        return append2(
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
      return append2(
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
        return append2(toList([tree]), other);
      }
    } else {
      let new_node = new$.head;
      let rest_2 = new$.tail;
      let old_node = old.head;
      let rest_1 = $;
      let tree = diff_one(old_node, new_node);
      let other = diff_list(rest_1, rest_2);
      return append2(toList([tree]), other);
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
        return new ModTree(new Modify(prop_remove, prop_set), mod_children);
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

// build/dev/javascript/vdom/vdom/html.mjs
function p(props, children) {
  return new HTMLTag("p", props, children);
}
function div(props, children) {
  return new HTMLTag("div", props, children);
}
function li(content, props) {
  return new HTMLTag("li", props, content);
}
function ul(items, props) {
  return new HTMLTag("ul", props, items);
}

// build/dev/javascript/vdom/vdom.mjs
function modify_dom(ele, prop_remove, prop_add) {
  set_all_attributes(ele, prop_add);
  return remove_all_attributes(ele, prop_remove);
}
function create_element_from_vhtml(root, v_element) {
  if (v_element instanceof HTMLTag) {
    let tag = v_element.tagname;
    let props = v_element.properties;
    let children = v_element.children;
    let new_element = create_element(tag);
    set_all_attributes(new_element, props);
    append_element(root, new_element);
    if (children instanceof Empty) {
    } else {
      let $ = children.tail;
      if ($ instanceof Empty) {
        let first = children.head;
        let $1 = create_element_from_vhtml(new_element, first);
      } else {
        let first = children.head;
        let rest = $;
        let $1 = create_element_from_vhtml(new_element, first);
        each(
          rest,
          (x) => {
            return create_element_from_vhtml(new_element, x);
          }
        );
      }
    }
    return new_element;
  } else {
    let content = v_element.content;
    set_element_text(root, content);
    return root;
  }
}
function replace_from_dom(root, element) {
  let replacement = create_element_from_vhtml(root, element);
  return dom_replace_with(root, replacement);
}
function inital_dom_apply(root, html) {
  return replace_from_dom(root, html);
}
function view() {
  return div(
    toList([]),
    toList([
      p(
        toList([["id", "example"], ["colour", "blue"]]),
        toList([new TextNode("Hello world")])
      )
    ])
  );
}
function view_2() {
  return div(
    toList([["class", "main"]]),
    toList([
      p(
        toList([["id", "example"]]),
        toList([new TextNode("Hello Not World")])
      )
    ])
  );
}
function view_3() {
  return ul(
    toList([
      li(toList([new TextNode("Item 1")]), toList([])),
      li(toList([new TextNode("Item 2")]), toList([])),
      li(toList([new TextNode("Item 3")]), toList([])),
      li(toList([new TextNode("Item 4")]), toList([])),
      li(toList([new TextNode("Item 5")]), toList([])),
      li(toList([new TextNode("Item 6")]), toList([]))
    ]),
    toList([])
  );
}
function view_4() {
  return div(
    toList([["class", "coming soon"]]),
    toList([p(toList([]), toList([new TextNode("Fetch data")]))])
  );
}
function current() {
  return div(toList([["id", "main"]]), toList([]));
}
function diff_one_proxy(old, new$) {
  return diff_one(old, new$);
}
function main() {
  return console_log("Starting up");
}
function apply_to_modtree_list(loop$root, loop$tree) {
  while (true) {
    let root = loop$root;
    let tree = loop$tree;
    if (tree instanceof Empty) {
      return void 0;
    } else {
      let $ = tree.tail;
      if ($ instanceof Empty) {
        let item = tree.head;
        return apply_to_dom(root, item);
      } else {
        let ele = tree.head;
        let rest = $;
        let $1 = apply_to_dom(root, ele);
        loop$root = root;
        loop$tree = rest;
      }
    }
  }
}
function apply_to_dom(root, tree) {
  let $ = tree.diff_op;
  if ($ instanceof Nop) {
    return void 0;
  } else if ($ instanceof Create) {
    let dom = $[0];
    create_element_from_vhtml(root, dom);
    return void 0;
  } else if ($ instanceof Remove) {
    return set_element_text(root);
  } else if ($ instanceof Replace) {
    let dom = $[0];
    return replace_from_dom(root, dom);
  } else {
    let prop_remove = $.prop_remove;
    let prop_set = $.prop_add;
    modify_dom(root, prop_remove, prop_set);
    return apply_to_modtree_list(root, tree.children);
  }
}
export {
  apply_to_dom,
  apply_to_modtree_list,
  create_element_from_vhtml,
  current,
  diff_one_proxy,
  inital_dom_apply,
  main,
  modify_dom,
  replace_from_dom,
  view,
  view_2,
  view_3,
  view_4
};
