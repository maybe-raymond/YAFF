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

export function log_element(txt, element){
    console.log(`${txt} ${element}`)
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
    console.log(`Removing ${element} from dom`)
    element.remove()
    console.log("element removed from dom")
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
    //Object.defineProperty(element, "event_msg", msg)
    element["event_msg"] = msg 
    //console.log(msg)
}

export function remove_element_event_prop(element, msg){
    element["event_msg"] = Null
}

export function get_children(element){
    let values = List.fromArray(element.children)
    return values
}



class HandleInputEvent{
    constructor(root, update, view, diff_one, apply_dom){
        this.data = ""
        this.root = root 
        this.update = update
        this.view = view 
        this.apply_dom = apply_dom
        this.diff_one  = diff_one
    }

    run(event, state, current_view){
         console.log("input")
       if(event.inputType.includes("insert")){
        this.data = this.data + event.data
       } 
       else if(event.inputType.includes("delete")){
        let new_string = this.data.split("") // getting rid of the last string
        new_string.pop()
        this.data = new_string.join("")
       }

       let arg = event.target["event_msg"](this.data)
        let new_state = this.update(arg, state)
        let new_html = this.view(new_state)
        let mod_tree = this.diff_one(current_view, new_html)
        //console.log(mod_tree)

        this.apply_dom(this.root, mod_tree)

        return [new_state, new_html]
    }
}


class HandleClickEvent{
    constructor(root,update, view, diff_one, apply_dom){
        this.data = ""
        this.root = root 
        this.update = update
        this.view = view 
        this.apply_dom = apply_dom
        this.diff_one  = diff_one
    }

    run(event, state, current_view){
        let arg = event.target["event_msg"]
        console.log("click")
        let new_state = this.update(arg, state)
        let new_html = this.view(new_state)
        let mod_tree = this.diff_one(current_view, new_html)
        //console.log(mod_tree)
        this.apply_dom(this.root, mod_tree)

        return [new_state, new_html]
    }
}

export function Browser_init_loop(init_model, update, view, root, events, diff_one, apply_dom){
// need to find when new type of event is added so that i can have a function to add it to the list 


    console.log("Now runnig Browser")

        let curr_state = init_model // current state
        let curr_view = view(init_model) // current view

        //console.log({curr_state, curr_view})
        let event_array = [...events]

        //console.log(event_array)
        event_array.forEach((name) => {
            
            let event_runner = (name == "input")? new HandleInputEvent(root, update, view, diff_one, apply_dom) : new HandleClickEvent(root, update, view, diff_one, apply_dom)
       
           
            root.addEventListener(name, (event) => {
                //console.log("clicked")
                //console.log(event)
                if (event.target && event.target["event_msg"]){
                    let [new_state, new_view] = event_runner.run(event, curr_state, curr_view)
                    //console.log(new_state, new_view)
                    curr_state = new_state
                    curr_view = new_view
                   
                }
                })
            })
        } 