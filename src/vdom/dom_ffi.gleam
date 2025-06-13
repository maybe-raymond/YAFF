pub type DomElement 

@external(javascript, "../dom_ffi.mjs", "query_selector")
pub fn query_selector(selector: String) -> Result(DomElement, Nil)

@external(javascript, "../dom_ffi.mjs", "query_selector_all")
pub fn query_selector_all(selector: String) -> Result(List(DomElement), Nil)

@external(javascript, "../dom_ffi.mjs", "create_element")
pub fn create_element(element: String) -> DomElement

@external(javascript, "../dom_ffi.mjs", "add_event")
pub fn add_event(element: DomElement, event_type: String, listener: fn () -> Nil) -> Nil

@external(javascript, "../dom_ffi.mjs", "log_element")
pub fn log_element(element: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "get_dom_text_content")
pub fn get_dom_text_content(element: DomElement) -> String

@external(javascript, "../dom_ffi.mjs", "get_element_value")
pub fn get_element_value(element: DomElement) -> Result(String, Nil)


@external(javascript, "../dom_ffi.mjs", "set_element_text")
pub fn set_element_text(element: DomElement, content: String) -> Nil

@external(javascript, "../dom_ffi.mjs", "set_element_text")
pub fn remove_element(element: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "dom_replace_with")
pub fn dom_replace_with(prev: DomElement, replacement: DomElement) -> Nil

@external(javascript, "../dom_ffi.mjs", "set_attribute")
pub fn set_attribute(ele: DomElement, attribtes: #(String, String)) -> Nil

@external(javascript, "../dom_ffi.mjs", "set_all_attributes")
pub fn set_all_attributes(ele: DomElement, attribtes: List(#(String, String))) -> Nil

@external(javascript, "../dom_ffi.mjs", "remove_attribute")
pub fn remove_attribute(ele: DomElement, attribtes: #(String, String)) -> Nil

@external(javascript, "../dom_ffi.mjs", "remove_all_attributes")
pub fn remove_all_attributes(ele: DomElement, attribtes: List(#(String, String))) -> Nil


@external(javascript, "../dom_ffi.mjs", "append_element")
pub fn append_element(parent: DomElement, child: DomElement) -> Nil