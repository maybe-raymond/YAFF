//// This module defines the operations that will takes place
//// between the Dom, Virtual Dom and ModTree

import gleam/list
import vdom/dom_ffi.{
  type DomElement, append_element, create_element, dom_replace_with,
  get_child_nodes, remove_attribute, remove_element, remove_event_prop,
  set_attribute, set_element_event_prop, set_element_text,
}
import vdom/html.{
  type Attribute, type Html, Event, EventFun, HTMLTag, Prop, TextNode,
}
import vdom/virtual_dom.{type ModTree, Create, Modify, Nop, Remove, Replace}

// Applies a virtual Dom onto the Real Dom
// This should only be used when initialising the application
// For when updates happen, Use the ModTree version because it would be less expensive
// This function removes everything from the current root node and created new Nodes to be inserted in their place
pub fn apply_from_v_dom(root: DomElement, html: Html(msg)) -> Nil {
  create_elements_from_vdom(root, html)
}

// Applies from ModTree
// This is a less expensive operation since it manipulates the existing 
// Dom rather than deleting everything and re-creating the Dom
// This is the implementation used for updates
pub fn apply_from_mod_tree(root: DomElement, tree: ModTree(msg)) -> Nil {
  let children = get_child_nodes(root)

  case list.first(children) {
    Error(_) -> Nil
    Ok(ele) -> {
      parse_mod_tree(ele, tree)
    }
  }
}

// Goes over the Mod Tree and applies the changes to the real Dom
fn parse_mod_tree(ele: DomElement, tree: ModTree(msg)) {
  case tree.diff_op {
    Nop -> {
      // do nothing but go deeper into the tree
      let child_elements = get_child_nodes(ele)
      apply_to_modtree_list(ele, child_elements, tree.children)
      Nil
    }
    Create(dom) -> {
      create_elements_from_vdom(ele, dom)
    }
    Remove(_) -> {
      remove_element(ele)
    }
    Replace(dom) -> {
      replace_from_dom(ele, dom)
    }
    Modify(prop_remove, prop_set) -> {
      modify_dom(ele, prop_remove, prop_set)
      let child_elements = get_child_nodes(ele)
      apply_to_modtree_list(ele, child_elements, tree.children)
    }
  }
}

fn apply_to_modtree_list(
  parent: DomElement,
  elements: List(DomElement),
  tree: List(ModTree(msg)),
) {
  echo tree
  case elements, tree {
    [], [] -> Nil
    [ele], [tree] -> {
      parse_mod_tree(ele, tree)
    }
    [ele], [tree_op, ..rest] -> {
      parse_mod_tree(ele, tree_op)
      list.each(rest, fn(x) { parse_mod_tree(parent, x) })
    }
    [ele, ..siblings], [tree_op] -> {
      parse_mod_tree(ele, tree_op)
      // should delete the other children, will implement that later
    }

    [ele, ..siblings], [tree_op, ..op_rest] -> {
      parse_mod_tree(ele, tree_op)
      apply_to_modtree_list(parent, siblings, op_rest)
    }

    [], [tree] -> parse_mod_tree(parent, tree)
    [], [tree, ..rest] -> {
      parse_mod_tree(parent, tree)
      list.each(rest, fn(x) { parse_mod_tree(parent, x) })
    }
    [_], [] -> Nil
    [_, ..], [] -> Nil
  }
}

fn modify_dom(
  ele: DomElement,
  prop_remove: List(Attribute(msg)),
  prop_add: List(Attribute(msg)),
) {
  set_attribute_type(ele, prop_add)
  remove_attribute_type(ele, prop_remove)
}

fn replace_from_dom(root: DomElement, element: Html(msg)) -> Nil {
  case element {
    TextNode(content) -> set_element_text(root, content)
    HTMLTag(tag, props, children) -> {
      let new_element = create_element(tag)
      set_attribute_type(new_element, props)
      list.each(children, fn(x) { create_elements_from_vdom(new_element, x) })
      dom_replace_with(root, new_element)
    }
  }
}

// Creates the corroseponding element from the v_dom 
fn create_elements_from_vdom(root: DomElement, v_element: Html(msg)) -> Nil {
  case v_element {
    TextNode(content) -> {
      set_element_text(root, content)
    }
    HTMLTag(tag, props, children) -> {
      let new_tag = create_element(tag)
      set_attribute_type(new_tag, props)
      list.each(children, fn(x) { create_elements_from_vdom(new_tag, x) })
      append_element(root, new_tag)
    }
  }
}

// Wrappers for Attributes Events
// These are helper functions to make an event and Addtriute different 

pub fn set_attribute_type(ele: DomElement, props: List(Attribute(msg))) -> Nil {
  case props {
    [] -> Nil
    [first] -> {
      case first {
        Prop(name, value) -> {
          set_attribute(ele, #(name, value))
        }
        Event(_, args) -> {
          set_element_event_prop(ele, args)
        }
        EventFun(_, func) -> {
          set_element_event_prop(ele, func)
        }
      }
    }
    [first, ..rest] -> {
      case first {
        Prop(name, value) -> {
          set_attribute(ele, #(name, value))
        }
        Event(_, args) -> {
          set_element_event_prop(ele, args)
        }
        EventFun(_, func) -> {
          set_element_event_prop(ele, func)
        }
      }
      set_attribute_type(ele, rest)
    }
  }
}

pub fn remove_attribute_type(
  ele: DomElement,
  props: List(Attribute(msg)),
) -> Nil {
  case props {
    [] -> Nil
    [first] -> {
      case first {
        Prop(name, value) -> remove_attribute(ele, #(name, value))
        Event(_, _) -> remove_event_prop(ele)
        EventFun(_, _) -> remove_event_prop(ele)
      }
    }
    [first, ..rest] -> {
      case first {
        Prop(name, value) -> set_attribute(ele, #(name, value))
        Event(_, _) -> remove_event_prop(ele)
        EventFun(_, _) -> remove_event_prop(ele)
      }
      remove_attribute_type(ele, rest)
    }
  }
}

fn is_event(item: Attribute(msg)) {
  case item {
    Prop(_, _) -> False
    _ -> True
  }
}

pub fn get_all_event_names(root: Html(msg)) {
  extract_all_events(root) |> filter_event_names |> list.unique
}

pub fn extract_all_events(root: Html(msg)) -> List(Attribute(msg)) {
  // Creates a list of all the events in a virtual DOM
  case root {
    HTMLTag(_, prop, children) -> {
      let current_events = list.filter(prop, is_event)
      let rest = list.flatten(list.map(children, extract_all_events))
      list.append(current_events, rest)
    }
    TextNode(_) -> []
  }
}

fn filter_event_names(events: List(Attribute(msg))) -> List(String) {
  // filters through a list of attributes and gets all the names of the events
  let event_names =
    list.map(events, fn(x) {
      case x {
        Prop(_, _) -> ""
        Event(name, _) -> name
        EventFun(name, _) -> name
      }
    })
  list.filter(event_names, fn(x) { x != "" })
}
