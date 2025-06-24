# Things that need to be done and improved

## Change CreateElement
Found out of createTextNode and see how to implement this into create element function and see how to imporve this 
section 

## Double check dom_ffi.gleam
Some functions do not match their js and i need to remove it

## Create a new browser function
This version will include only the state, update, view function

## Get all events
A function that go over an html and gets all the events. Need to set them if they are not curently set on the 
eventListeners. 

## Fix on change
I created a qucik function allow on chang input and really did not create a robust version that works on different types of text input


## Remove event Listeners when they do not exist
They are cases where the event listern stops existing  on an object and it needs to be removed on the global event lister group


## Bug for Input 
When a new input value is done, it uses the same buffer, need to create different buffere for different targets. 