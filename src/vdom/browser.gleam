//// This Module is for the browser function
//// It is supposed to mimick ELM and Lustre that 
//// have a simple function that takes a init model, update, view
//// A start function that takes the 'app' and a root name and it should start the app
//// 
//// The API is modelled like the Lustre one
////  example of this is 
////   let app = lustre.simple(init, update, view)
//// let assert Ok(_) = lustre.start(app, "#app", Nil)

import gleam/io
import vdom/html.{type Html}
import vdom/dom_ffi.{query_selector, browser_init_loop}
import vdom/dom_operations.{apply_from_v_dom, apply_from_mod_tree, get_all_event_names}
import vdom/virtual_dom.{diff_v_dom}


pub fn simple(
  model: state,
  update: fn(msg, state) -> state,
  view: fn(state) -> Html(msg),
) {
  #(model, update, view)
}

pub fn start(
  app: #(state, fn(msg, state) -> state, fn(state) -> Html(msg)),
  element: String,
) {
  case query_selector(element) {
    Ok(ele) -> {
      io.print("Setting up event")
      let current_view = app.2(app.0)

      apply_from_v_dom(ele, current_view)

      browser_init_loop(
        app.0,
        app.1,
        app.2,
        ele,
        get_all_event_names,
        diff_v_dom,
        apply_from_mod_tree,
      )
    }
    Error(_) -> io.print_error("No element called #main found")
  }
}
