import vdom/virtual_dom as v_dom 

pub fn h1(props: List(#(String, String)), children: List(v_dom.Html))-> v_dom.Html{
  v_dom.HTMLTag("h1", props, children)
}


pub fn p(props: List(#(String, String)), children: List( v_dom.Html))->  v_dom.Html{
   v_dom.HTMLTag("p", props, children)
}

pub fn text(content: String)->  v_dom.Html{
   v_dom.TextNode(content)
}

pub fn div(props: List(#(String, String)), children: List( v_dom.Html))->  v_dom.Html{
   v_dom.HTMLTag("div", props, children)
}

pub fn button(props: List(#(String, String)), children: List( v_dom.Html))->  v_dom.Html{
  v_dom.HTMLTag("div", props, children)
}

pub fn li(content: List(v_dom.Html), props: List(#(String, String)))->  v_dom.Html{
  v_dom.HTMLTag("li", props, content)
}

pub fn ul(items: List(v_dom.Html), props: List(#(String, String))){
  v_dom.HTMLTag("ul", props, items)
}