import gleam/io
import gleam/list
import vdom/virtual_dom as v_dom
import vdom/dom_ffi
import vdom/html as h



pub fn inital_dom_apply(root: dom_ffi.DomElement, html: v_dom.Html) -> Nil{
  // this should be used on first start up to load up the html on the page
  replace_from_dom(root, html)
}


pub fn apply_to_dom(root: dom_ffi.DomElement, tree: v_dom.ModTree) -> Nil {
  // Apply changes to the real dom 
  case tree.diff_op{
    v_dom.Nop -> Nil // Do nothing 
    v_dom.Create(dom) -> {
      create_element_from_vhtml(root, dom)
      Nil
      }
    v_dom.Remove(_) -> dom_ffi.remove_element(root)
    v_dom.Replace(dom) -> replace_from_dom(root, dom)
    v_dom.Modify(prop_remove, prop_set) -> {
      modify_dom(root, prop_remove, prop_set)
      apply_to_modtree_list(root, tree.children)
      }

      }
}

pub fn apply_to_modtree_list(root: dom_ffi.DomElement, tree: List(v_dom.ModTree)){
  case tree{
    [] -> Nil
    [item] -> apply_to_dom(root, item)
    [ele, ..rest] -> {
      let _throw_away = apply_to_dom(root, ele)
      apply_to_modtree_list(root, rest)
      }
  }
}


pub fn modify_dom(ele: dom_ffi.DomElement, prop_remove: List(#(String, String)), prop_add: List(#(String, String))){
  dom_ffi.set_all_attributes(ele, prop_add)
  dom_ffi.remove_all_attributes(ele, prop_remove)
}

pub fn replace_from_dom(root: dom_ffi.DomElement, element: v_dom.Html)-> Nil {
  let replacement = create_element_from_vhtml(root, element)
  dom_ffi.dom_replace_with(root, replacement)
}


pub fn create_element_from_vhtml(root: dom_ffi.DomElement, v_element: v_dom.Html)-> dom_ffi.DomElement{

  case v_element {
    v_dom.TextNode(content) -> {
      dom_ffi.set_element_text(root, content)
      root
      
      }

    v_dom.HTMLTag(tag, props, children) -> {
          let new_element = dom_ffi.create_element(tag)
          dom_ffi.set_all_attributes(new_element, props)
          dom_ffi.append_element(root, new_element)

          case children{
            [] -> Nil 
            [first] -> {
              let _node = create_element_from_vhtml(new_element, first)
              Nil 
              }
            [first, ..rest] -> {
              let _node = create_element_from_vhtml(new_element, first)
              list.each(rest, fn(x){create_element_from_vhtml(new_element, x)})
            }
          }
          new_element
        
        }
      }
}




pub fn view()-> v_dom.Html{
  h.div(
    [],
    [h.p([#("id", "example"), #("colour", "blue")], [v_dom.TextNode("Hello world")]),])

}


pub fn view_2()-> v_dom.Html{
  h.div(
    [#("class", "main")],
    [h.p([#("id", "example")], [v_dom.TextNode("Hello Not World")]),])

}

pub fn view_3(){

  h.ul(
    [ h.li([v_dom.TextNode("Item 1")], []),
      h.li([v_dom.TextNode("Item 2")], []),
      h.li([v_dom.TextNode("Item 3")], []),
      h.li([v_dom.TextNode("Item 4")], []),
      h.li([v_dom.TextNode("Item 5")], []),
      h.li([v_dom.TextNode("Item 6")], [])
    ], 
    []
  )
}


pub fn view_4(){

  h.div([#("class", "coming soon")], 
      [h.p([], [ v_dom.TextNode("Fetch data")])]
  )
}

pub fn current(){

  h.div([#("id", "main")], 
      []
  )
}

pub fn diff_one_proxy(old: v_dom.Html, new: v_dom.Html){
  v_dom.diff_one(old, new)
}


pub fn main() -> Nil {
  io.println("Starting up")
}
