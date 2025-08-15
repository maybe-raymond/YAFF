# YAFFF

[![Package Version](https://img.shields.io/hexpm/v/vdom)](https://hex.pm/packages/vdom)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/vdom/)

**YAFFF** — *Yet Another Functional Frontend Framework*

YAFFF is a virtual DOM implementation written in [Gleam](https://gleam.run). It's designed purely as a learning project and is not intended for production use.

The project draws inspiration from [Elm](https://elm-lang.org) and the Gleam library [Lustre](https://hex.pm/packages/lustre). It was created as a way to learn and explore the Gleam programming language.

> ⚠️ Expect non-idiomatic code. This is a learning project. Feedback and improvements are welcome!

---

## Getting Started

Clone the repo:

```sh
git clone https://github.com/maybe-raymond/YAFF.git
cd YAFF
```

YAFFF uses [`esgleam`](https://hex.pm/packages/esgleam), an esbuild-based build tool for Gleam.

### Run the examples locally:

```sh
gleam build
gleam run -m esgleam/bundle
gleam run -m esgleam/serve
```

This will serve a local development version of the project with live examples.

---

## Project Structure

* **`dom_ffi.mjs`**
  Contains the JavaScript bindings (FFI) that interface between Gleam and the DOM. It includes helper functions to connect the Gleam virtual DOM logic to the browser.

* **`yafff.gleam`**
  Entry point for the app logic. You can swap out its contents with different examples to test various features.

* **`yafff/html.gleam`**
  Defines the HTML algebraic data type (ADT) and helper functions for creating HTML tags. This is the foundation of the virtual DOM.

* **`yafff/virtual_dom.gleam`**
  Contains the `ModTree` ADT, a structure used to track changes between HTML states. It also includes the `diff` function that compares two HTML trees and produces a modification plan.

* **`yafff/dom_operations.gleam`**
  Functions that apply changes from the virtual DOM (`ModTree`) to the real DOM.

* **`yafff/dom_ffi.gleam`**
  Wraps FFI logic in Gleam code. Provides typed bindings to the JavaScript-side helpers in `dom_ffi.mjs`.

* **`yafff/browser.gleam`**
  Helper functions inspired by Elm and Lustre. Provides utilities for building frontend applications more ergonomically.


## TODO List

Things that are planned or in progress:

* [ ] Implement support for HTTP requests like fetch API integration
* [ ] Provide a way to interface with external JavaScript, similar to ports or subscriptions in Elm
* [ ] Add a mechanism to clean up/destroy DOM events that are no longer needed, this should happens after DOM nodes are removed

## 🤝 Contributing

This is an experimental project, but suggestions, improvements, and feedback are always welcome!
