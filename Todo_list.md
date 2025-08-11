# Things that need to be done and improved

## Change CreateElement
Found out of createTextNode and see how to implement this into create element function and see how to improve this 
section 

## Double check dom_ffi.gleam
Some functions do not match their javaScript and I need to remove it

## Get all events
A function that go over HTML and gets all the events. Need to set them if they are not currently set on the 
event Listeners. 

## Fix on change
I created a quick function allow on-change input and really did not create a robust version that works on different types of text input


## Remove event Listeners when they do not exist
They are cases where the event listen stops existing on an object and it needs to be removed on the global event listen group
