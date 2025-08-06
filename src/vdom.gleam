import vdom/browser
import vdom/html as h
import vdom/virtual_dom as v_dom

pub fn main() -> Nil {
  let init_state = State("", "", "")
  let app = browser.simple(init_state, update, main_view)
  browser.start(app, "#main")
}

pub type State {
  State(name: String, password: String, password_again: String)
}

pub type Msg {
  Name(String)
  Password(String)
  PasswordAgain(String)
}

pub fn update(msg: Msg, s: State) -> State {
  case msg {
    Name(val) -> State(val, s.password, s.password_again)
    Password(val) -> State(s.name, val, s.password_again)
    PasswordAgain(val) -> State(s.name, s.password, val)
  }
}

pub fn main_view(s: State) -> v_dom.Html(Msg) {
  h.div([], [
    v_dom.HTMLTag(
      "input",
      [
        v_dom.Prop("placeholder", "Name"),
        v_dom.Prop("value", s.name),
        v_dom.on_input(Name),
      ],
      [],
    ),
    v_dom.HTMLTag(
      "input",
      [
        v_dom.Prop("placeholder", "Password"),
        v_dom.Prop("value", s.password),
        v_dom.on_input(Password),
      ],
      [],
    ),
    v_dom.HTMLTag(
      "input",
      [
        v_dom.Prop("placeholder", "Re-Enter Password"),
        v_dom.Prop("value", s.password_again),
        v_dom.on_input(PasswordAgain),
      ],
      [],
    ),
    validation_view(s),
  ])
}

pub fn validation_view(s: State) {
  case s.password == s.password_again {
    True -> h.div([v_dom.Prop("style", "color: green")], [h.text("Ok")])
    False ->
      h.div([v_dom.Prop("style", "color: red")], [
        h.text("Password do not match"),
      ])
  }
}
