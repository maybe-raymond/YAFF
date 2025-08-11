//// Module handles the Virtual DOM
//// ModTree is used to show what operations to do for a v_dom to match another v_dom

import gleam/list
import vdom/html.{
  type Attribute, type Html, Event, EventFun, HTMLTag, Prop, TextNode,
}

// Type represeting the types of operations to do between 
// Two virtual Doms
pub type ModOp(msg) {
  Nop
  Create(Html(msg))
  Remove(Html(msg))
  Replace(Html(msg))
  Modify(prop_remove: List(Attribute(msg)), prop_add: List(Attribute(msg)))
}

// ModTree -> Modification Tree
// A Tree representation of the operations to do between two 
// Virtual Doms for them to be the same
pub type ModTree(msg) {
  ModTree(diff_op: ModOp(msg), children: List(ModTree(msg)))
}

// This function finds the difference between two virtual Doms
// It returns the opertions that need to happen for both Doms to be similiar 
pub fn diff_v_dom(old: Html(msg), new: Html(msg)) -> ModTree(msg) {
  case old, new {
    TextNode(txt_1), TextNode(txt_2) -> {
      case txt_1 == txt_2 {
        True -> ModTree(Nop, [])
        False -> ModTree(Replace(new), [])
      }
    }
    HTMLTag(_, _, _), TextNode(_) -> ModTree(Replace(new), [])
    HTMLTag(tag_1, prop_1, child_1), HTMLTag(tag_2, prop_2, child_2) -> {
      case tag_1 == tag_2 {
        True -> {
          let mod_children = diff_list(child_1, child_2)
          let prop_remove = remove_prop(prop_1, prop_2)
          let prop_set = set_prop(prop_1, prop_2)

          case list.is_empty(prop_remove) == list.is_empty(prop_set) {
            True -> ModTree(Nop, mod_children)
            False -> {
              //echo prop_remove
              //echo prop_set
              ModTree(Modify(prop_remove, prop_set), mod_children)
            }
          }
        }
        False -> ModTree(Replace(new), [])
      }
    }
    TextNode(_), HTMLTag(_, _, _) -> ModTree(Replace(new), [])
  }
}

// Helper function for diff_v_dom
// Handles the list of children 
fn diff_list(old: List(Html(msg)), new: List(Html(msg))) -> List(ModTree(msg)) {
  case old, new {
    [], [] -> [ModTree(Nop, [])]
    [old_node], [] -> [ModTree(Remove(old_node), [])]
    [], [new_node] -> [ModTree(Create(new_node), [])]
    [old_node], [new_node] -> [diff_v_dom(old_node, new_node)]
    [old_node, ..rest_1], [new_node, ..rest_2] -> {
      let tree = diff_v_dom(old_node, new_node)
      let other = diff_list(rest_1, rest_2)
      list.append([tree], other)
    }
    [], [new_node, ..rest] -> {
      // creating a list of create Mod Trees
      list.append(
        [ModTree(Create(new_node), [])],
        list.map(rest, fn(x) { ModTree(Create(x), []) }),
      )
    }
    [old_node, ..rest], [] -> {
      list.append(
        [ModTree(Remove(old_node), [])],
        list.map(rest, fn(x) { ModTree(Remove(x), []) }),
      )
    }
  }
}

// Helper functions for the Modify Operation 
// Modify is used when the elements are the same but have different propoerties attached to them  
fn contains_prop_name(lst: List(Attribute(msg)), item: Attribute(msg)) -> Bool {
  list.fold_until(lst, False, fn(_, i) {
    let result = case i {
      Prop(name, _) -> name == item.name
      Event(name, _) -> name == item.name
      EventFun(name, _) -> name == item.name
    }
    case result {
      True -> list.Stop(True)
      False -> list.Continue(False)
    }
  })
}

pub fn remove_prop(
  old_prop: List(Attribute(msg)),
  new_prop: List(Attribute(msg)),
) -> List(Attribute(msg)) {
  // the properties that should be removed
  list.filter(old_prop, fn(x) { !contains_prop_name(new_prop, x) })
}

pub fn set_prop(
  old_prop: List(Attribute(msg)),
  new_prop: List(Attribute(msg)),
) -> List(Attribute(msg)) {
  // the properties that should be set
  list.filter(new_prop, fn(x) { !list.contains(old_prop, x) })
}
