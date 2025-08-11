pub type DomElement

@external(javascript, "../dom_ffi.mjs", "query_selector")
pub fn query_selector(selector: String) -> Result(DomElement, Nil)

@external(javascript, "../dom_ffi.mjs", "query_selector_all")
pub fn query_selector_all(selector: String) -> Result(List(DomElement), Nil)

@external(javascript, "../dom_ffi.mjs", "create_element")
pub fn create_element(element: String) -> DomElement

@external(javascript, "../dom_ffi.mjs", "log_element")
pub fn log_element(txt: String, element: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "get_dom_text_content")
pub fn get_dom_text_content(element: DomElement) -> String

@external(javascript, "../dom_ffi.mjs", "get_element_value")
pub fn get_element_value(element: DomElement) -> Result(String, Nil)

@external(javascript, "../dom_ffi.mjs", "set_element_text")
pub fn set_element_text(element: DomElement, content: String) -> Nil

@external(javascript, "../dom_ffi.mjs", "remove_element")
pub fn remove_element(element: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "dom_replace_with")
pub fn dom_replace_with(prev: DomElement, replacement: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "set_attribute")
pub fn set_attribute(ele: DomElement, attribtes: #(String, String)) -> Nil

@external(javascript, "../dom_ffi.mjs", "remove_attribute")
pub fn remove_attribute(ele: DomElement, attribtes: #(String, String)) -> Nil

@external(javascript, "../dom_ffi.mjs", "set_element_event_prop")
pub fn set_element_event_prop(ele: DomElement, msg: value) -> Nil

@external(javascript, "../dom_ffi.mjs", "remove_element_event_prop")
pub fn remove_event_prop(ele: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "append_element")
pub fn append_element(parent: DomElement, child: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "get_children")
pub fn get_children(element: DomElement) -> List(DomElement)

@external(javascript, "../dom_ffi.mjs", "get_child_nodes")
pub fn get_child_nodes(element: DomElement) -> List(DomElement)

@external(javascript, "../dom_ffi.mjs", "replace_children")
pub fn replace_children(root: DomElement, children: List(DomElement)) -> Nil

@external(javascript, "../dom_ffi.mjs", "Browser_init_loop")
pub fn browser_init_loop(
  init_model: state,
  update: func_1,
  view: func_2,
  root: DomElement,
  events: func_3,
  diff_one: func_4,
  apply_dom: func_5,
) -> Nil