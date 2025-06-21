import gleam/list
import vdom/virtual_dom as v_dom

pub fn h1(
  props: List(v_dom.Attribute(msg)),
  children: List(v_dom.Html(msg)),
) -> v_dom.Html(msg) {
  v_dom.HTMLTag("h1", props, children)
}

pub fn p(
  props: List(v_dom.Attribute(msg)),
  children: List(v_dom.Html(msg)),
) -> v_dom.Html(msg) {
  v_dom.HTMLTag("p", props, children)
}

pub fn text(content: String) -> v_dom.Html(msg) {
  v_dom.TextNode(content)
}

pub fn div(
  props: List(v_dom.Attribute(msg)),
  children: List(v_dom.Html(msg)),
) -> v_dom.Html(msg) {
  v_dom.HTMLTag("div", props, children)
}

pub fn button(
  props: List(v_dom.Attribute(msg)),
  children: List(v_dom.Html(msg)),
) -> v_dom.Html(msg) {
  v_dom.HTMLTag(
    "button",
    list.append(props, [v_dom.Prop("type", "button")]),
    children,
  )
}

pub fn li(
  content: List(v_dom.Html(msg)),
  props: List(v_dom.Attribute(msg)),
) -> v_dom.Html(msg) {
  v_dom.HTMLTag("li", props, content)
}

pub fn ul(items: List(v_dom.Html(msg)), props: List(v_dom.Attribute(msg))) {
  v_dom.HTMLTag("ul", props, items)
}
