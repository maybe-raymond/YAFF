import gleam/list

pub type Atrribute(msg){
  Prop(name: String, value: String)
  Event(name: String, args: msg)
}



pub fn on(event_type: String, msg)-> Atrribute(msg){
  Event(event_type, msg)
}


pub fn onclick(msg) -> Atrribute(msg){
  on("click", msg)
}


pub type Html(msg){
  HTMLTag(
    tagname: String, 
    properties: List(Atrribute(msg)),
    children: List(Html(msg))
    )
  TextNode(content: String)
}

pub type ModOp(msg){
  Nop
  Create(Html(msg))
  Remove(Html(msg))
  Replace(Html(msg))
  Modify(element: Html(msg), prop_remove: List(Atrribute(msg)), prop_add: List(Atrribute(msg)))
}

pub type ModTree(msg){
  ModTree(
    diff_op: ModOp(msg), 
    children: List(ModTree(msg)))
}



pub fn remove_prop(old_prop: List(Atrribute(msg)), new_prop: List(Atrribute(msg))) -> List(Atrribute(msg)){
  // the properties that should be removed
  list.filter(old_prop, fn(x) {
      !list.contains(new_prop, x)
  })
}

pub fn set_prop(old_prop: List(Atrribute(msg)), new_prop: List(Atrribute(msg))) -> List(Atrribute(msg)){
  // the properties that should be set
  list.filter(new_prop, fn(x) {
    !list.contains(old_prop, x)
  })
}

pub fn diff_one(old: Html(msg), new: Html(msg)) -> ModTree(msg){

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
        case list.is_empty(prop_1) == list.is_empty(prop_2){
            True -> ModTree(Nop, mod_children)
            False -> ModTree(Modify(new, prop_remove, prop_set), mod_children)
        }
        
      }
      False -> ModTree(Replace(new), [])
    }
  }
  TextNode(_), HTMLTag(_, _, _) -> ModTree(Replace(new), [])
}
}



pub fn diff_list(old: List(Html(msg)), new: List(Html(msg))) -> List(ModTree(msg)){
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
