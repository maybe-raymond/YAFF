
# YAFFF

[![Package Version](https://img.shields.io/hexpm/v/vdom)](https://hex.pm/packages/vdom)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/vdom/)

**YAFFF** — *Yet Another Functional Frontend Framework*

YAFFF is a virtual DOM implementation written in [Gleam](https://gleam.run). It's designed purely as a learning project and is not intended for production use.

This project draws inspiration from [Elm](https://elm-lang.org) and the Gleam library [Lustre](https://hex.pm/packages/lustre). It was created as a way to learn and explore the Gleam programming language.

> ⚠️ Expect non-idiomatic code. This is a learning project. Feedback and improvements are welcome!

---

## Helpful Resources

Here are some of the most useful references I used during development:

* A helpful blog post that explains the concept of the [Virtual DOM](https://lazamar.github.io/virtual-dom/)
* Understanding [event bubbling](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) took some time but was key to handling events
* The [Elm guide](https://guide.elm-lang.org/architecture/) provided a solid architectural reference
* A discussion on the [Elm runtime internals](https://discourse.elm-lang.org/t/docs-about-elm-runtime/8869/4) gave me a good overview when planning this project

---

## Example: Counter App

Here’s a simple example of a counter app using YAFFF:

```gleam
import gleam/int
import yafff/browser
import yafff/html as h

pub fn main() -> Nil {
  let init_state = 0
  let app = browser.simple(init_state, update, main_view)
  browser.start(app, "#main")
}

pub type Msg {
  Increment
  Decrement
}

pub type State = Int

pub fn update(msg: Msg, s: State) -> State {
  case msg {
    Increment -> s + 1
    Decrement -> s - 1
  }
}

pub fn main_view(s: State) -> h.Html(Msg) {
  h.div([], [
    h.button([h.onclick(Increment)], [h.TextNode("+")]),
    h.p([], [h.TextNode(int.to_string(s))]),
    h.button([h.onclick(Decrement)], [h.TextNode("-")]),
  ])
}
```

---

## Getting Started

Clone the repository:

```sh
git clone https://github.com/maybe-raymond/YAFF.git
cd YAFF
```

YAFFF uses [`esgleam`](https://hex.pm/packages/esgleam), an esbuild-based tool for building Gleam projects.

### Run the examples locally:

```sh
gleam build
gleam run -m esgleam/bundle
gleam run -m esgleam/serve
```

This will start a local development server with live examples.



## Project Structure

* **`dom_ffi.mjs`**
  JavaScript bindings that connect Gleam with the DOM. Contains helper functions for interacting with the browser.

* **`yafff.gleam`**
  The main application file. You can replace its contents with example code to try out different features.

* **`yafff/html.gleam`**
  Defines the HTML algebraic data type (ADT) and helper functions to create virtual DOM nodes.

* **`yafff/virtual_dom.gleam`**
  Implements the `ModTree` — a structure that tracks changes between HTML states. Includes a `diff` function to compare virtual DOM trees and generate a list of modifications.

* **`yafff/dom_operations.gleam`**
  Contains the logic to apply `ModTree` changes to the actual DOM.

* **`yafff/dom_ffi.gleam`**
  FFI wrapper code for typed Gleam access to the JavaScript helpers.

* **`yafff/browser.gleam`**
  A collection of utility functions for building frontend apps, inspired by Elm and Lustre.



## TODO List

Planned features and improvements:

* [ ] Add support for **HTTP requests** (e.g., `fetch` API integration)
* [ ] Provide a way to **interface with external JavaScript**, similar to ports or subscriptions in Elm
* [ ] Implement a way to **clean up event listeners** when DOM nodes are removed



## 🤝 Contributing

This is an experimental project built for learning purposes, but suggestions, improvements, and feedback are always welcome.

