import {Error, Ok, List} from "./gleam.mjs"

export function query_selector(selectors){
    const node = document.querySelector(selectors)
    if (node) return new Ok(node) 
    return new Error 
}


export function query_selector_all(selectors){
    const node = document.querySelectorAll(selectors)
    if (node) return new Ok(List.fromArray(node)) 
    return Error 
}

export function create_element(element){
    return document.createElement(element)
}


export function add_event(element, type, args){
    element.addEventListener(type, () =>{
        dispatch(args[0], args[1])
    })
}


export function remove_event(element, type, args){
    element.removeEventListener(type, () =>{
        Dispatch(args[0], args[1])
    })
}

export function log_element(element){
    console.log(element)
}

export function get_element_value(element){
    const val = element.value
    if (val) return new Ok(val) 
    return new Error 
}

export function get_dom_text_content(element){
    return element.textContent
}

export function set_element_text(element, content){
    element.textContent = content
}

export function remove_element(element){
    element.remove()
}

export function replace_children(root, children){
    let child_array = [...children]
    root.replaceChildren(child_array)
}


export function dom_replace_with(prev, new_element){
    prev.replaceWith(new_element)
}


export function set_attribute(ele, attri){
    ele.setAttribute(attri[0], attri[1])
}

export function set_all_attributes(ele, attribute_array){
    let attribute_list = [...attribute_array]
   
    attribute_list.forEach( (attri) => {
         set_attribute(ele, attri)
    });
}

export function remove_attribute(ele, attri){
    ele.removeAttribute(attri[0], attri[1])
}

export function remove_all_attributes(ele, attribute_array){
    let attribute_list = [...attribute_array]
    attribute_list.forEach((attri) => {
         remove_attribute(ele, attri)
    })
}


export function append_element(parent, child){
    parent.appendChild(child)
}

export function set_element_event_prop(element, msg){
    element["_event_msg"] = msg
}

export function remove_element_event_prop(element, msg){
    element["_event_msg"] = Null
}

export function get_children(element){
    let values = List.fromArray(element.children)
    return values
}

export function Browser_init_loop(init_model, update, view, root, events, diff_one, apply_dom){
// need to find when new type of event is added so that i can have a function to add it to the list 


    console.log("Now runnig Browser")

        let curr_state = init_model // current state
        let curr_view = view(init_model) // current view

        console.log({curr_state, curr_view})
        let event_array = [...events]

        console.log(event_array)
        event_array.forEach((name) => {
            root.addEventListener(name, (event) => {
                console.log("clicked")
                if (event.target && event.target["_event_msg"]){
                    let new_state = update(event["_event_msg"], curr_state)
                    let new_html = view(new_state)
                    let mod_tree = diff_one(curr_view, new_html)
                    apply_dom(root, mod_tree)
                    console.log({new_html})
                    console.log({curr_view})
                    console.log({new_state})
                    console.log({curr_state})
                    console.log({mod_tree})
                    curr_state = new_state
                    curr_view = new_html

                }
                })
            })
        } 