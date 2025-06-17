import gleam/int
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


pub fn apply_dom_from_root(root: dom_ffi.DomElement, tree: v_dom.ModTree(msg)){
  let children = dom_ffi.get_children(root)

  case children{
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

  case list.first(children){
    Error(_) -> Nil
      Ok(ele) -> {
        parse_dom_tree(ele, tree)
      }
    }
  }



fn parse_dom_tree(ele: dom_ffi.DomElement, tree: v_dom.ModTree(msg)){
   case tree.diff_op {
         v_dom.Nop ->{
          // do nothing but go deeper into the tree
          //io.print("No Op moving to Children")
          let child_elements = dom_ffi.get_children(ele)
          //echo child_elements
          //echo tree.children
          apply_to_modtree_list(ele, child_elements, tree.children)
         }
          v_dom.Create(dom) -> {
            //io.print("creating element")
            //echo dom 
            yet_another_create_elements(ele, dom)
            }
          v_dom.Remove(dom) -> {
            //io.print("Removing Dom")
            //echo dom 
            dom_ffi.remove_element(ele)
            }
          v_dom.Replace(dom) -> {
            //io.print("Replacing Dom")
            //echo dom 
            replace_from_dom(ele, dom)
            }
          v_dom.Modify(_, prop_remove, prop_set) -> {
            //io.print("Modifying props")
            //echo [prop_remove, prop_set] 
            modify_dom(ele, prop_remove, prop_set)
            let children  = dom_ffi.get_children(ele)
            apply_to_modtree_list(ele, children, tree.children)
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
    [ele], [tree] -> parse_dom_tree(ele, tree)
    [ele, ..siblings], [tree_op, ..op_rest] -> {
      //echo ele 
      //echo tree_op
      parse_dom_tree(ele, tree_op)
      apply_to_modtree_list(ele, siblings, op_rest)
    }
    [], [tree, ..] -> parse_dom_tree(parent, tree) 
    [_, ..], [] -> Nil
  }
}

pub fn modify_dom(
  ele: dom_ffi.DomElement,
  prop_remove: List(v_dom.Atrribute(msg)),
  prop_add: List(v_dom.Atrribute(msg)),
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
      list.each(children, fn(x){yet_another_create_elements(new_element, x)})
      dom_ffi.dom_replace_with(root, new_element)
    }
  }
}




fn yet_another_create_elements(root: dom_ffi.DomElement, v_element: v_dom.Html(msg))-> Nil{
  case v_element{
    v_dom.TextNode(content) -> {
      dom_ffi.set_element_text(root, content)
      }
    v_dom.HTMLTag(tag, props, children) ->{
      let new_tag = dom_ffi.create_element(tag)
      dom_ffi.set_attribute_type(new_tag, props)
      list.each(children, fn(x){yet_another_create_elements(new_tag, x)})
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

pub fn main_view(s: State) -> v_dom.Html(Msg) {
  h.div([], [
    h.button([v_dom.onclick(Increment)], [v_dom.TextNode("+")]),
    h.p([], [v_dom.TextNode(int.to_string(s))]),
    h.button([v_dom.onclick(Decrement)], [v_dom.TextNode("-")]),
  ])
}

pub fn main_view_2(_: State) -> v_dom.Html(Msg) {
  h.div([], [
    h.button([v_dom.onclick(Increment)], [v_dom.TextNode("+")]),
    h.p([], [v_dom.TextNode("2")]),
    h.button([v_dom.onclick(Decrement)], [v_dom.TextNode("-")]),
  ])
}

pub fn main() -> Nil {
  io.println("Starting up")

  let init_state: State = 0
  let v_1 = main_view(init_state)
  let v_2 = main_view_2(init_state)
  let mod = v_dom.diff_one(v_1, v_2)
  echo mod

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
