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


export function add_event(element, type, listener){
    element.addEventListener(type, listener)
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