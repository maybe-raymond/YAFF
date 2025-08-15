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

pub type State =
  Int

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
