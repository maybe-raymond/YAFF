import gleam/io
import gleam/list

pub type Html {
  HTMLTag(
    tagname: String, 
    properties: List(#(String, String)),
    children: List(Html)
    )
  TextNode(content: String)
}

pub type ModOp{
  Nop
  Create(Html)
  Remove(Html)
  Replace(Html)
  Modify(prop_remove: List(#(String, String)), prop_add: List(#(String, String)))
}


pub type ModTree{
  ModTree(
    diff_op: ModOp, 
    children: List(ModTree))
}



pub fn remove_prop(old_prop: List(#(String, String)), new_prop: List(#(String, String))) -> List(#(String, String)){
  // the properties that should be removed
  list.filter(old_prop, fn(x) {
      !list.contains(new_prop, x)
  })
}

pub fn set_prop(old_prop: List(#(String, String)), new_prop: List(#(String, String))) -> List(#(String, String)){
  // the properties that should be set
  list.filter(new_prop, fn(x) {
    !list.contains(old_prop, x)
  })
}

pub fn diff_one(old: Html, new: Html) -> ModTree{

case old, new {
  TextNode(txt_1), TextNode(txt_2) -> {
    case txt_1 == txt_2 {
      True -> ModTree(Nop, [])
      False -> ModTree(Replace(new), [])
    }
  }
  HTMLTag(_, _, _), TextNode(_) ->  ModTree(Replace(new), [])
  HTMLTag(tag_1,  prop_1,  child_1), HTMLTag(tag_2, prop_2, child_2) -> {
    case tag_1 == tag_2{
      True -> {
        let mod_children = diff_list(child_1, child_2)
        let prop_remove = remove_prop(prop_1, prop_2)
        let prop_set = set_prop(prop_1, prop_2)
        ModTree(Modify(prop_remove, prop_set), mod_children)
      }
      False -> ModTree(Replace(new), [])
    }
  }
  TextNode(_), HTMLTag(_, _, _) -> ModTree(Replace(new), [])
}
}


pub fn diff_list(old: List(Html), new: List(Html)) -> List(ModTree){
  case old, new {
    [], [] -> [ModTree(Nop, [])]
    [old_node], [] -> [ModTree(Remove(old_node), [])]
    [], [new_node] -> [ModTree(Create(new_node), [])]
    [old_node], [new_node] -> [diff_one(old_node, new_node)]
    [old_node, ..rest_1], [new_node, ..rest_2] -> {
      let tree = diff_one(old_node, new_node)
      let other = diff_list(rest_1, rest_2)
      list.append([tree], other)
    }
    [], [new_node, ..rest] -> {
      // creating a list of create Mod Trees
      list.append([ModTree(Create(new_node), [])],list.map(rest, fn(x){ModTree(Create(x), [])}))
    }
    [old_node, ..rest], [] -> {
      list.append([ModTree(Remove(old_node), [])],list.map(rest, fn(x){ModTree(Remove(x), [])}))
    }
  }
}


pub fn h1(props: List(#(String, String)), children: List(Html))-> Html{
  HTMLTag("h1", props, children)
}


pub fn p(props: List(#(String, String)), children: List(Html))-> Html{
  HTMLTag("p", props, children)
}

pub fn text(content: String)-> Html{
  TextNode(content)
}

pub fn div(props: List(#(String, String)), children: List(Html))-> Html{
  HTMLTag("div", props, children)
}

pub fn button(props: List(#(String, String)), children: List(Html))-> Html{
  HTMLTag("div", props, children)
}

pub fn li(content: List(Html), props: List(#(String, String)))-> Html{
  HTMLTag("li", props, content)
}

pub fn ul(items: List(Html), props: List(#(String, String))){
  HTMLTag("li", props, items)
}

pub fn view()-> Html{
  div(
    [],
    [p([#("id", "example"), #("colour", "blue")], [TextNode("Hello world")]),])

}


pub fn view_2()-> Html{
  div(
    [#("class", "main")],
    [p([#("id", "example")], [TextNode("Hello Not World")]),])

}

fn view_3(){

  ul(
    [ li([TextNode("Item 1")], []),
      li([TextNode("Item 2")], []),
      li([TextNode("Item 3")], []),
      li([TextNode("Item 4")], []),
      li([TextNode("Item 5")], []),
      li([TextNode("Item 6")], [])
    ], 
    []
  )
}


fn view_4(){

  div([#("class", "coming soon")], 
      [p([], [ TextNode("Fetch data")])]
  )
}


pub fn main() -> Nil {
  let v1 = view()
  let v2 = view_2()
  let v3 = view_3()
  let v4 = view_4()
  
  let tree = diff_one(v4, v3)
  echo v4
  echo v3
  echo tree
  io.println("Hello from vdom!")
}
