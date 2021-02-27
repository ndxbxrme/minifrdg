# Minifrdg 
### The smallin'est, ballin'est SPA framework in town
Weighing in at only 41 lines of javascript with no dependencies, Minifrdg is a minimalist frontend framework that provides simple routing, templating and a flexible pattern for hooking code/data to the view without exposing anything to the DOM.  

Minifrdg isn't a replacement for the more monolithic frameworks but it supplies enough tools to handle a lot of situations.  

There isn't much to learn, no background shenanigans to eat CPU cyles and no need for any crazy transcomplimication.  

Minifrdg could be your best friend...

### Routing
We take an extremely simplistic approach to routing.  The first subdomain becomes ```app.route``` and the rest are assigned to ```app.params[]```.  If a template key matches ```app.route``` then that template is filled in and displayed.  A controller with the matching key will also be instantiated if it exists.

All routes that don't have a matching template resolve to ```dashboard```.  

Templates whose keys are prefixed with an underscore will not be loaded as a top level template.

Before a route change occurs all ```routeChange``` callbacks are called.  Returning a promise and rejecting it will cancel the navigation.

If the ```routeChange``` callback is successful all ```cleanup``` callbacks are called which gives you a chance to cancel any timers and unhook any functions that require it.  


### Templating
Double brackets are used to inject data into the template.  Any javascript is valid.  It is run in the scope of any connected controller and has access to the current app through ```app```.

### Controllers
Controllers provide data for the template and hook functions to the app for the DOM to access.  
They should come in the form of a function that takes the current app as an input and returns some useful data.
```javascript
app.controllers.dog = (app) => {
  //private variables
  const dog = {name:'Ruufus', age:5};
  //function hooks
  app.fns.increaseDogAge = () => {
    dog.age++;
    app.refresh();
  };
  //not strictly necessary but nice to do
  app.on('cleanup', () => (delete app.fns.increaseDogAge));
  //release it into the world
  return {
    dog
  }
}
```

## Usage
Install with NPM
```bash
npm install --save minifrdg

#index.js
const Minifrdg = require('minifrdg');
```
or import with a script tag
```html
<script src="https://www.rainstormweb.com/minifrdg.js"></script>
```
and then in your script file
```javascript
const app = Minifrdg();
//load templates and controllers
//do other stuff
app.start();
```

## Examples

[Simple Routing](https://codepen.io/ndxbxrme/pen/QWGqEON)  
[Simple Routing with data fetch and refresh](https://codepen.io/ndxbxrme/pen/bGBowKY)  
[A more complete website](https://codepen.io/ndxbxrme/pen/dyOzpzG)  
[Podcast player](https://codepen.io/ndxbxrme/pen/ExNwodz)  


# API

## Public

### Properties 
#### ```app.route```
The current route.
#### ```app.params[]```
An array of parameters from the url.
#### ```app.base.name```
A string or regex to replace in the url.  Useful if you are running in a subdomain or on codepen.
#### ```app.templates```
An object containing all the app templates.
#### ```app.controllers```
An object containing all the app controllers.
#### ```app.callbacks```
An object containing all the app callbacks.
#### ```app.rootComponents```
An array of component names
#### ```app.fns```
A place to store your functions
#### ```app.vars```
A place to store your variables

### Methods
#### ```app.start()```
Call this to start the whole shebang.  Load your controllers and templates first.
#### ```app.refresh()```
Refreshes the whole app without remaking any of the root controllers.  Call this if you don't have much going on.  Otherwise make a more regional refresh function.
#### ```app.fill(template, data)```
Fills a template with data.  
#### ```app.safe(text)```
HTML encodes potentially dangerous entities.
#### ```app.goto(route)```
Navigate to route.
#### ```app.loadLocalTemplates()```
Loads any templates stored in the document in ```<script type="text/template" id="templateName"></script>``` blocks
#### ```app.on(name, (app) => {})```
Registers a callback
#### ```app.fireCallbacks(name, [data])```
Fires all callbacks in order.  Returning a rejected promise cancels the rest of the chain.
#### ```app.$(selector, [parentElem])```
Returns the first element matching the selector starting at either parentElem or document.
#### ```app.$$(selector, [parentElem])```
Returns an array of elements matching the selector starting at either parentElem or document.
#### ```app.mfid([base])```
Returns a random id string.

## Private

### Properties 
#### ```useHash```

### Methods
#### ```setState()```
#### ```inflate()```
#### ```hookActions()```
Updates all on* events and links to run with the app in scope.