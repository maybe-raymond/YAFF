import gleeunit
import gleeunit/should
import vdom/virtual_dom as v_dom
import vdom/html as h 


pub fn main() -> Nil {
  gleeunit.main()
}

// gleeunit test functions end in `_test`
pub fn create_1_test() {
  let inner = h.p([], [v_dom.TextNode("Hello")])
  let old_view = h.div([], [])
  let new_view = h.div([], [inner])

  let tree = v_dom.ModTree(v_dom.Nop, [
    v_dom.ModTree(v_dom.Create(inner), [])
  ])

  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)

}

pub fn create_2_test() {
  let old_view = h.ul([
  h.li([v_dom.TextNode("Item 1")], []),
  h.li([v_dom.TextNode("Item 2")], []),
  h.li([v_dom.TextNode("Item 3")], []),
], [])

let new_view = h.ul([
  h.li([v_dom.TextNode("Item 1")], []),
  h.li([v_dom.TextNode("Item 2")], []),
  h.li([v_dom.TextNode("Item 3")], []),
  h.li([v_dom.TextNode("Item 4")], []),
  h.li([v_dom.TextNode("Item 5")], []),], [])

let tree = v_dom.ModTree(v_dom.Nop, 
  [v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Create(h.li([v_dom.TextNode("Item 4")], [])), []),
  v_dom.ModTree(v_dom.Create(h.li([v_dom.TextNode("Item 5")], [])), []),
])


  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)

}


pub fn remove_1_test() {
  let inner = h.p([], [v_dom.TextNode("Hello")])
  let new_view = h.div([], [])
  let old_view = h.div([], [inner])

  let tree = v_dom.ModTree(v_dom.Nop, [
    v_dom.ModTree(v_dom.Remove(inner), [])
  ])

  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)

}

pub fn remove_2_test() {
  let new_view = h.ul([
  h.li([v_dom.TextNode("Item 1")], []),
  h.li([v_dom.TextNode("Item 2")], []),
  h.li([v_dom.TextNode("Item 3")], []),
], [])

let old_view = h.ul([
  h.li([v_dom.TextNode("Item 1")], []),
  h.li([v_dom.TextNode("Item 2")], []),
  h.li([v_dom.TextNode("Item 3")], []),
  h.li([v_dom.TextNode("Item 4")], []),
  h.li([v_dom.TextNode("Item 5")], []),], [])

let tree = v_dom.ModTree(v_dom.Nop, 
  [v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Remove(h.li([v_dom.TextNode("Item 4")], [])), []),
  v_dom.ModTree(v_dom.Remove(h.li([v_dom.TextNode("Item 5")], [])), []),
])


  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)
}





pub fn replace_1_test() {
  let inner = h.p([], [v_dom.TextNode("Hello")])

  let old_view = h.div([], [h.div([], [v_dom.TextNode("Hello")])])
  let new_view = h.div([], [inner])

  let tree = v_dom.ModTree(v_dom.Nop, [
    v_dom.ModTree(v_dom.Replace(inner), [])
  ])

  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)

}

pub fn replace_2_test() {
  let old_view = h.ul([
    h.li([v_dom.TextNode("Item 1")], []),
    h.li([v_dom.TextNode("Item 2")], []),
    h.li([v_dom.TextNode("Item 3")], []),
  ], [])

  let new_view = h.ul([
    h.li([v_dom.TextNode("Item 1")], []),
    h.li([v_dom.TextNode("Not Item 2")], []),
    h.li([v_dom.TextNode("Not Item 3")], [])], [])

  let tree = v_dom.ModTree(v_dom.Nop, 
    [v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
    v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Replace(v_dom.TextNode("Not Item 2")), [])]),
    v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Replace(v_dom.TextNode("Not Item 3")), [])]),
  ])

  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)
}



pub type Msg {
  Increment
  Decrement
}

pub fn replace_counter_test() {
  let old_view = h.div([], [
    h.button([v_dom.onclick(Increment)], [v_dom.TextNode("+")]),
    h.p([], [v_dom.TextNode("0")]),
    h.button([v_dom.onclick(Decrement)], [v_dom.TextNode("-")]),
  ])

let new_view = h.div([], [
    h.button([v_dom.onclick(Increment)], [v_dom.TextNode("+")]),
    h.p([], [v_dom.TextNode("1")]),
    h.button([v_dom.onclick(Decrement)], [v_dom.TextNode("-")]),
  ])

let tree = v_dom.ModTree(v_dom.Nop, 
  [v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
  v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Replace(v_dom.TextNode("1")), [])]),
  v_dom.ModTree(v_dom.Nop, [v_dom.ModTree(v_dom.Nop, [])]),
])


  let result = v_dom.diff_one(old_view, new_view)

  should.equal(tree, result)
}
