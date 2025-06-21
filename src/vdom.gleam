import gleam/io
import gleam/list
import vdom/dom_ffi
import vdom/html as h
import vdom/virtual_dom as v_dom

pub fn inital_dom_apply(
  root: dom_ffi.DomElement,
  html: v_dom.Html(msg),
) -> List(String) {
  // this should be used on first start up to load up the html on the page
  let node_event_tuple = create_element_from_vhtml(root, html)

  node_event_tuple.1
}

pub fn apply_dom_from_root(root: dom_ffi.DomElement, tree: v_dom.ModTree(msg)) {
  let children = dom_ffi.get_children(root)

  case children {
    [] -> Nil
    [ele] -> apply_to_dom(ele, tree)
    [ele, ..] -> {
      apply_to_dom(ele, tree)
    }
  }
}

pub fn apply_to_dom(root: dom_ffi.DomElement, tree: v_dom.ModTree(msg)) -> Nil {
  // Apply changes to the real dom 
  let children = dom_ffi.get_children(root)

  case list.first(children) {
    Error(_) -> Nil
    Ok(ele) -> {
      parse_dom_tree(ele, tree)
     
    }
  }
}

fn parse_dom_tree(ele: dom_ffi.DomElement, tree: v_dom.ModTree(msg)) {
  case tree.diff_op {
    v_dom.Nop -> {
      // do nothing but go deeper into the tree
      io.print("No Op moving to Children")
      let child_elements = dom_ffi.get_children(ele)
      apply_to_modtree_list(ele, child_elements, tree.children)
      Nil
    
    }
    v_dom.Create(dom) -> {
      io.print("creating element")
      echo dom 
      dom_ffi.log_element("create parent: ", ele)
      yet_another_create_elements(ele, dom)
    }
    v_dom.Remove(dom) -> {
      io.print("Removing Dom")
      echo dom 
      dom_ffi.remove_element(ele)
    }
    v_dom.Replace(dom) -> {
      io.print("Replacing Dom")
      echo dom 
      replace_from_dom(ele, dom)
    }
    v_dom.Modify(_, prop_remove, prop_set) -> {
      io.print("Modifying props")
      echo [prop_remove, prop_set] 
      modify_dom(ele, prop_remove, prop_set)
      let child_elements = dom_ffi.get_children(ele)
      echo child_elements
      echo tree.children
      apply_to_modtree_list(ele, child_elements, tree.children)
    }
  }
}

pub fn apply_to_modtree_list(
  parent: dom_ffi.DomElement,
  elements: List(dom_ffi.DomElement),
  tree: List(v_dom.ModTree(msg)),
) {
  case elements, tree {
    [], [] -> Nil
    [ele], [tree] -> {
      dom_ffi.log_element("current: ", ele)
      echo tree 
      parse_dom_tree(ele, tree)
      }
    [ele], [tree_op, ..rest] -> {
      dom_ffi.log_element("current: ", ele)
      echo tree_op 
      parse_dom_tree(ele, tree_op)
      list.each(rest, fn(x){parse_dom_tree(parent, x)}) 
    }
    [ele, ..siblings], [tree_op] ->{
      dom_ffi.log_element("current: ", ele)
      echo tree_op 
      parse_dom_tree(ele, tree_op)
      // should delete the other children, will implement that later
    }

    [ele, ..siblings], [tree_op, ..op_rest] -> {
      //echo ele 
      //echo tree_op
      dom_ffi.log_element("parent: ", ele)
      echo tree_op 
      parse_dom_tree(ele, tree_op)
      apply_to_modtree_list(parent, siblings, op_rest)
    }
    
    [], [tree] -> parse_dom_tree(parent, tree)
    [], [tree, ..rest] -> {
      dom_ffi.log_element("parent: ", parent)
      echo tree 
     parse_dom_tree(parent, tree)
     list.each(rest, fn(x){parse_dom_tree(parent, x)}) 
    }
    [ele], [] -> Nil
    [ele, ..siblings], [] -> Nil 
  }
}

pub fn modify_dom(
  ele: dom_ffi.DomElement,
  prop_remove: List(v_dom.Attribute(msg)),
  prop_add: List(v_dom.Attribute(msg)),
) {
  dom_ffi.set_attribute_type(ele, prop_add)
  dom_ffi.remove_attribute_type(ele, prop_remove)
}

pub fn replace_from_dom(
  root: dom_ffi.DomElement,
  element: v_dom.Html(msg),
) -> Nil {
  case element {
    v_dom.TextNode(content) -> dom_ffi.set_element_text(root, content)
    v_dom.HTMLTag(tag, props, children) -> {
      let new_element = dom_ffi.create_element(tag)
      dom_ffi.set_attribute_type(new_element, props)
      list.each(children, fn(x) { yet_another_create_elements(new_element, x) })
      dom_ffi.dom_replace_with(root, new_element)
    }
  }
}

fn yet_another_create_elements(
  root: dom_ffi.DomElement,
  v_element: v_dom.Html(msg),
) -> Nil {
  case v_element {
    v_dom.TextNode(content) -> {
      dom_ffi.set_element_text(root, content)
    }
    v_dom.HTMLTag(tag, props, children) -> {
      let new_tag = dom_ffi.create_element(tag)
      dom_ffi.set_attribute_type(new_tag, props)
      list.each(children, fn(x) { yet_another_create_elements(new_tag, x) })
      dom_ffi.append_element(root, new_tag)
    }
  }
}

pub fn create_element_from_vhtml(
  root: dom_ffi.DomElement,
  v_element: v_dom.Html(msg),
) -> #(dom_ffi.DomElement, List(String)) {
  case v_element {
    v_dom.TextNode(content) -> {
      dom_ffi.set_element_text(root, content)
      #(root, [])
    }

    v_dom.HTMLTag(tag, props, children) -> {
      let new_element = dom_ffi.create_element(tag)
      let event = dom_ffi.set_attribute_type(new_element, props)
      dom_ffi.append_element(root, new_element)
      let other_events =
        create_element_from_list_vdom(new_element, children, [])
      #(new_element, list.append(other_events, event))
    }
  }
}

pub fn create_element_from_list_vdom(
  root: dom_ffi.DomElement,
  v_elements: List(v_dom.Html(msg)),
  curr_event: List(String),
) -> List(String) {
  case v_elements {
    [] -> curr_event
    [element] -> {
      let values = create_element_from_vhtml(root, element)
      list.append(values.1, curr_event)
    }
    [element, ..rest] -> {
      let values = create_element_from_vhtml(root, element)
      let rest_of_events = create_element_from_list_vdom(root, rest, values.1)
      list.append(rest_of_events, curr_event)
    }
  }
}

pub fn diff_one_proxy(old: v_dom.Html(msg), new: v_dom.Html(msg)) {
  v_dom.diff_one(old, new)
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


pub fn index_filter(
  list: List(a), 
  with_fun: fn(a, Int)->Bool)
  -> List(a){

let result = list.fold(list, #(0, []), fn(acc, item){
  let next = acc.0 + 1
  case with_fun(item, acc.0){
    True -> #(next ,list.append(acc.1, [item]))
    False ->  #(next , acc.1)
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
      State(index_filter(s.items, fn(_, index) { postion != index }), s.input_content)
    ChangeInput(msg) -> State(s.items, msg)
  }
}

pub fn input_view(s: State) -> v_dom.Html(Msg) {
  h.div([], [
    v_dom.HTMLTag(
      "input",
      [
        v_dom.Prop("type", "text"),
        v_dom.Prop("value", s.input_content),
        v_dom.on_input(ChangeInput),
      ],
      [],
    ),
    h.button([v_dom.onclick(AddItem)], [
      v_dom.TextNode("Add to list"),
    ]),
  ])
}

pub fn list_view(s: State) -> v_dom.Html(Msg) {
  let list_items = list.index_map(s.items, fn(item, index){list_item(item, index)})
  h.ul(list_items, [])
}


pub fn list_item(item: String, index: Int) -> v_dom.Html(Msg) {

  h.li([
    h.div([],
    [v_dom.TextNode(item), 
    h.button([v_dom.onclick(RemoveItem(index))], [h.text("Remove")])
    ]
    )
   ], 
    []) 
}

pub fn main_view(s: State) -> v_dom.Html(Msg) {
  h.div([], [input_view(s), list_view(s)])
}

pub fn main() -> Nil {
  let init_state = State([], " ")

  case dom_ffi.query_selector("#main") {
    Ok(ele) -> {
      io.print("Setting up event")
      let current_view = main_view(init_state)
      // getting rid of duplicates
      let events = list.unique(inital_dom_apply(ele, current_view))

      dom_ffi.browser_init_loop(
        init_state,
        update,
        main_view,
        ele,
        events,
        v_dom.diff_one,
        apply_to_dom,
      )
    }
    Error(_) -> io.print_error("No element called #main found")
  }
}
