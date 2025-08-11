import vdom/browser
import vdom/html as h
import gleam/list 

pub fn main() -> Nil {
  let init_state = State([], "")
  let app = browser.simple(init_state, update, main_view)
  browser.start(app, "#main")
}


pub type Msg {
  ChangeInput(String)
  // current value of Input
  AddItem
  RemoveItem(Int)
}

pub type State {
  State(items: List(String), input_content: String)
}

pub fn index_filter(list: List(a), with_fun: fn(a, Int) -> Bool) -> List(a) {
  let result =
    list.fold(list, #(0, []), fn(acc, item) {
      let next = acc.0 + 1
      case with_fun(item, acc.0) {
        True -> #(next, list.append(acc.1, [item]))
        False -> #(next, acc.1)
      }
    })
  result.1
}

pub fn update(msg: Msg, s: State) -> State {
  case msg {
    AddItem -> {
      let new_list = list.append(s.items, [s.input_content])
      echo new_list
      State(new_list, s.input_content)
    }
    RemoveItem(postion) ->
      State(
        index_filter(s.items, fn(_, index) { postion != index }),
        s.input_content,
      )
    ChangeInput(msg) -> State(s.items, msg)
  }
}

pub fn input_view(s: State) -> h.Html(Msg) {
  h.div([], [
    h.HTMLTag(
      "input",
      [
        h.Prop("type", "text"),
        h.Prop("value", s.input_content),
        h.on_input(ChangeInput),
      ],
      [],
    ),
    h.button([h.onclick(AddItem)], [h.TextNode("Add to list")]),
  ])
}

pub fn list_view(s: State) -> h.Html(Msg) {
  let list_items =
    list.index_map(s.items, fn(item, index) { list_item(item, index) })
  h.ul(list_items, [])
}

pub fn list_item(item: String, index: Int) -> h.Html(Msg) {
  h.li(
    [
      h.div([], [
        h.TextNode(item),
        h.button([h.onclick(RemoveItem(index))], [h.text("Remove")]),
      ]),
    ],
    [],
  )
}

pub fn main_view(s: State) -> h.Html(Msg) {
  h.div([], [input_view(s), list_view(s)])
}
