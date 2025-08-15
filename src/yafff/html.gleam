import gleam/list

pub type Attribute(msg) {
  Prop(name: String, value: String)
  Event(name: String, args: msg)
  EventFun(name: String, args: fn(String) -> msg)
}

pub type Html(msg) {
  HTMLTag(
    tagname: String,
    properties: List(Attribute(msg)),
    children: List(Html(msg)),
  )
  TextNode(content: String)
}

pub fn h1(props: List(Attribute(msg)), children: List(Html(msg))) -> Html(msg) {
  HTMLTag("h1", props, children)
}

pub fn p(props: List(Attribute(msg)), children: List(Html(msg))) -> Html(msg) {
  HTMLTag("p", props, children)
}

pub fn text(content: String) -> Html(msg) {
  TextNode(content)
}

pub fn div(props: List(Attribute(msg)), children: List(Html(msg))) -> Html(msg) {
  HTMLTag("div", props, children)
}

pub fn button(
  props: List(Attribute(msg)),
  children: List(Html(msg)),
) -> Html(msg) {
  HTMLTag("button", list.append(props, [Prop("type", "button")]), children)
}

pub fn li(content: List(Html(msg)), props: List(Attribute(msg))) -> Html(msg) {
  HTMLTag("li", props, content)
}

pub fn ul(items: List(Html(msg)), props: List(Attribute(msg))) {
  HTMLTag("ul", props, items)
}

pub fn on(event_type: String, msg) -> Attribute(msg) {
  Event(event_type, msg)
}

pub fn on_input(msg) {
  EventFun("input", msg)
}

pub fn onclick(msg) -> Attribute(msg) {
  on("click", msg)
}
