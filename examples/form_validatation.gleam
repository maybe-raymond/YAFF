import yafff/browser
import yafff/html as h

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

pub fn main_view(s: State) -> h.Html(Msg) {
  h.div([], [
    h.HTMLTag(
      "input",
      [h.Prop("placeholder", "Name"), h.Prop("value", s.name), h.on_input(Name)],
      [],
    ),
    h.HTMLTag(
      "input",
      [
        h.Prop("placeholder", "Password"),
        h.Prop("value", s.password),
        h.on_input(Password),
      ],
      [],
    ),
    h.HTMLTag(
      "input",
      [
        h.Prop("placeholder", "Re-Enter Password"),
        h.Prop("value", s.password_again),
        h.on_input(PasswordAgain),
      ],
      [],
    ),
    validation_view(s),
  ])
}

pub fn validation_view(s: State) {
  case s.password == s.password_again {
    True -> h.div([h.Prop("style", "color: green")], [h.text("Ok")])
    False ->
      h.div([h.Prop("style", "color: red")], [h.text("Password do not match")])
  }
}
