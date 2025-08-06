import gleam/io
import gleam/list
import vdom/dom_ffi
import vdom/mod_tree_parser as tp
import vdom/virtual_dom

// i want to have the same browser interfae as ELM and Lustre
// Where they have a simple function that takes a
// init model, update, view
// a start function that takes the 'app' and a root name

// an example of this is 
//   let app = lustre.simple(init, update, view)
// let assert Ok(_) = lustre.start(app, "#app", Nil)

pub fn simple(
  model: state,
  update: fn(msg, state) -> state,
  view: fn(state) -> virtual_dom.Html(msg),
) {
  #(model, update, view)
}

pub fn start(
  app: #(state, fn(msg, state) -> state, fn(state) -> virtual_dom.Html(msg)),
  element: String,
) {
  case dom_ffi.query_selector(element) {
    Ok(ele) -> {
      io.print("Setting up event")
      let current_view = app.2(app.0)

      // getting rid of duplicates
      let events = list.unique(tp.inital_dom_apply(ele, current_view))

      dom_ffi.browser_init_loop(
        app.0,
        app.1,
        app.2,
        ele,
        events,
        virtual_dom.diff_one,
        tp.apply_to_dom,
      )
    }
    Error(_) -> io.print_error("No element called #main found")
  }
}
