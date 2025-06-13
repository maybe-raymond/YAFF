import gleam/list

pub type Html {
  HTMLTag(
    tagname: String, 
    properties: List(#(String, String)),
    children: List(Html)
    )
  TextNode(content: String)
}

pub type ModOp{
  Nop
  Create(Html)
  Remove(Html)
  Replace(Html)
  Modify(prop_remove: List(#(String, String)), prop_add: List(#(String, String)))
}


pub type ModTree{
  ModTree(
    diff_op: ModOp, 
    children: List(ModTree))
}



pub fn remove_prop(old_prop: List(#(String, String)), new_prop: List(#(String, String))) -> List(#(String, String)){
  // the properties that should be removed
  list.filter(old_prop, fn(x) {
      !list.contains(new_prop, x)
  })
}

pub fn set_prop(old_prop: List(#(String, String)), new_prop: List(#(String, String))) -> List(#(String, String)){
  // the properties that should be set
  list.filter(new_prop, fn(x) {
    !list.contains(old_prop, x)
  })
}

pub fn diff_one(old: Html, new: Html) -> ModTree{

case old, new {
  TextNode(txt_1), TextNode(txt_2) -> {
    case txt_1 == txt_2 {
      True -> ModTree(Nop, [])
      False -> ModTree(Replace(new), [])
    }
  }
  HTMLTag(_, _, _), TextNode(_) ->  ModTree(Replace(new), [])
  HTMLTag(tag_1,  prop_1,  child_1), HTMLTag(tag_2, prop_2, child_2) -> {
    case tag_1 == tag_2{
      True -> {
        let mod_children = diff_list(child_1, child_2)
        let prop_remove = remove_prop(prop_1, prop_2)
        let prop_set = set_prop(prop_1, prop_2)
        ModTree(Modify(prop_remove, prop_set), mod_children)
      }
      False -> ModTree(Replace(new), [])
    }
  }
  TextNode(_), HTMLTag(_, _, _) -> ModTree(Replace(new), [])
}
}



pub fn diff_list(old: List(Html), new: List(Html)) -> List(ModTree){
  case old, new {
    [], [] -> [ModTree(Nop, [])]
    [old_node], [] -> [ModTree(Remove(old_node), [])]
    [], [new_node] -> [ModTree(Create(new_node), [])]
    [old_node], [new_node] -> [diff_one(old_node, new_node)]
    [old_node, ..rest_1], [new_node, ..rest_2] -> {
      let tree = diff_one(old_node, new_node)
      let other = diff_list(rest_1, rest_2)
      list.append([tree], other)
    }
    [], [new_node, ..rest] -> {
      // creating a list of create Mod Trees
      list.append([ModTree(Create(new_node), [])],list.map(rest, fn(x){ModTree(Create(x), [])}))
    }
    [old_node, ..rest], [] -> {
      list.append([ModTree(Remove(old_node), [])],list.map(rest, fn(x){ModTree(Remove(x), [])}))
    }
  }
}
