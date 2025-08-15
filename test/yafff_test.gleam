import gleeunit
import gleeunit/should
import yafff/dom_operations.{extract_all_events}
import yafff/html as h
import yafff/virtual_dom.{
  Create, ModTree, Modify, Nop, Remove, Replace, diff_v_dom,
}

pub fn main() -> Nil {
  gleeunit.main()
}

// gleeunit test functions end in `_test`
pub fn create_1_test() {
  let inner = h.p([], [h.TextNode("Hello")])
  let old_view = h.div([], [])
  let new_view = h.div([], [inner])

  let tree = ModTree(Nop, [ModTree(Create(inner), [])])

  let result = diff_v_dom(old_view, new_view)

  should.equal(tree, result)
}

pub fn create_2_test() {
  let old_view =
    h.ul(
      [
        h.li([h.TextNode("Item 1")], []),
        h.li([h.TextNode("Item 2")], []),
        h.li([h.TextNode("Item 3")], []),
      ],
      [],
    )

  let new_view =
    h.ul(
      [
        h.li([h.TextNode("Item 1")], []),
        h.li([h.TextNode("Item 2")], []),
        h.li([h.TextNode("Item 3")], []),
        h.li([h.TextNode("Item 4")], []),
        h.li([h.TextNode("Item 5")], []),
      ],
      [],
    )

  let tree =
    ModTree(Nop, [
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Create(h.li([h.TextNode("Item 4")], [])), []),
      ModTree(Create(h.li([h.TextNode("Item 5")], [])), []),
    ])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}

// remove from dom
pub fn remove_1_test() {
  let inner = h.p([], [h.TextNode("Hello")])
  let new_view = h.div([], [])
  let old_view = h.div([], [inner])

  let tree = ModTree(Nop, [ModTree(Remove(inner), [])])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}

pub fn remove_2_test() {
  let new_view =
    h.ul(
      [
        h.li([h.TextNode("Item 1")], []),
        h.li([h.TextNode("Item 2")], []),
        h.li([h.TextNode("Item 3")], []),
      ],
      [],
    )

  let old_view =
    h.ul(
      [
        h.li([h.TextNode("Item 1")], []),
        h.li([h.TextNode("Item 2")], []),
        h.li([h.TextNode("Item 3")], []),
        h.li([h.TextNode("Item 4")], []),
        h.li([h.TextNode("Item 5")], []),
      ],
      [],
    )

  let tree =
    ModTree(Nop, [
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Remove(h.li([h.TextNode("Item 4")], [])), []),
      ModTree(Remove(h.li([h.TextNode("Item 5")], [])), []),
    ])

  let result = diff_v_dom(old_view, new_view)

  should.equal(tree, result)
}

// replace from dom 
pub fn replace_1_test() {
  let inner = h.p([], [h.TextNode("Hello")])

  let old_view = h.div([], [h.div([], [h.TextNode("Hello")])])
  let new_view = h.div([], [inner])

  let tree = ModTree(Nop, [ModTree(Replace(inner), [])])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}

pub fn replace_2_test() {
  let old_view =
    h.ul(
      [
        h.li([h.TextNode("Item 1")], []),
        h.li([h.TextNode("Item 2")], []),
        h.li([h.TextNode("Item 3")], []),
      ],
      [],
    )

  let new_view =
    h.ul(
      [
        h.li([h.TextNode("Item 1")], []),
        h.li([h.TextNode("Not Item 2")], []),
        h.li([h.TextNode("Not Item 3")], []),
      ],
      [],
    )

  let tree =
    ModTree(Nop, [
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Nop, [ModTree(Replace(h.TextNode("Not Item 2")), [])]),
      ModTree(Nop, [ModTree(Replace(h.TextNode("Not Item 3")), [])]),
    ])

  let result = diff_v_dom(old_view, new_view)

  should.equal(tree, result)
}

pub type Msg {
  Increment
  Decrement
}

pub fn replace_counter_test() {
  let old_view =
    h.div([], [
      h.button([h.onclick(Increment)], [h.TextNode("+")]),
      h.p([], [h.TextNode("0")]),
      h.button([h.onclick(Decrement)], [h.TextNode("-")]),
    ])

  let new_view =
    h.div([], [
      h.button([h.onclick(Increment)], [h.TextNode("+")]),
      h.p([], [h.TextNode("1")]),
      h.button([h.onclick(Decrement)], [h.TextNode("-")]),
    ])

  let tree =
    ModTree(Nop, [
      ModTree(Nop, [ModTree(Nop, [])]),
      ModTree(Nop, [ModTree(Replace(h.TextNode("1")), [])]),
      ModTree(Nop, [ModTree(Nop, [])]),
    ])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}

// extract events 

pub fn extract_event_test() {
  let old_view =
    h.div([], [
      h.button([h.onclick(Increment)], [h.TextNode("+")]),
      h.p([], [h.TextNode("0")]),
      h.button([h.onclick(Decrement)], [h.TextNode("-")]),
    ])

  let events = [h.onclick(Increment), h.onclick(Decrement)]
  let result = extract_all_events(old_view)
  should.equal(events, result)
}

// modify 
pub fn modify_1_test() {
  let inner = h.p([], [h.TextNode("Hello")])

  let old_view = h.div([h.Prop("class", "to be changed")], [inner])
  let new_view = h.div([h.Prop("class", "changed")], [inner])

  let tree =
    ModTree(Modify([], [h.Prop("class", "changed")]), [
      ModTree(Nop, [ModTree(Nop, [])]),
    ])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}

pub fn modify_2_test() {
  // removing a prop

  let inner = h.p([], [h.TextNode("Hello")])

  let old_view = h.div([h.Prop("class", "to be changed")], [inner])
  let new_view = h.div([], [inner])

  let tree =
    ModTree(Modify([h.Prop("class", "to be changed")], []), [
      ModTree(Nop, [ModTree(Nop, [])]),
    ])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}

pub fn modify_and_replace_test() {
  let li_node = fn(text: String) {
    h.div([], [h.TextNode(text), h.button([], [h.TextNode("Remove")])])
  }
  let old_view =
    h.ul(
      [
        h.li([li_node("One")], []),
        h.li([li_node("Two")], []),
        h.li([li_node("Three")], []),
      ],
      [],
    )

  let new_view =
    h.ul([h.li([li_node("One")], []), h.li([li_node("Three")], [])], [])

  // this was a pain to write out
  let tree =
    ModTree(Nop, [
      ModTree(Nop, [
        ModTree(Nop, [ModTree(Nop, []), ModTree(Nop, [ModTree(Nop, [])])]),
      ]),
      ModTree(Nop, [
        ModTree(Nop, [
          ModTree(Replace(h.TextNode("Three")), []),
          ModTree(Nop, [ModTree(Nop, [])]),
        ]),
      ]),
      ModTree(Remove(h.li([li_node("Three")], [])), []),
    ])
  let result = diff_v_dom(old_view, new_view)

  should.equal(tree, result)
}

pub fn modify_3_test() {
  // having the same prop so both lists are empty

  let inner = h.p([], [h.TextNode("Hello")])

  let old_view = h.div([h.Prop("class", "to be changed")], [inner])
  let new_view = h.div([h.Prop("class", "to be changed")], [inner])

  let tree = ModTree(Nop, [ModTree(Nop, [ModTree(Nop, [])])])

  let result = diff_v_dom(old_view, new_view)
  should.equal(tree, result)
}
