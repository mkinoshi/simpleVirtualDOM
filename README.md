# simpleVirtualDOM

This project implements simple virtual DOM which can handle jsx. I assume that Babel is correctly working, and it can correctly
transform jsx. virtualDOM is represented as (type: String, props: Object, children: Array of virtualDOM). One of the drawbacks of this implementation is that it destroys a DOM and replace it with another
DOM when you update props of an existing virtual DOM component. It can be optimzed by chaning only necessary props of DOM,
but to avoid the complications I faced when I try to handle event listers properly, I chose that way.
Furthermore, currently it shows all of the attribtues of a virtual DOM in an actual DOM, and it can be changed if we do not want to show all of the attributes of virtual DOM <br />

**Total work hours:** around 4 hours and 45 minutes

# File structure
All of the source code are in src directory, and src code include the following three files.
* index.js: This file contains virtual DOM implementations such as identifing whether it needs to change actual DOM or not.
* app.js: This file injects DOM to index.html. 
* example.js: In this file, I replicate changes of jsx which happens in React using timer and simple user interations

# How to use
The usage of this project is very simple. To test various jxs and make sure this virtual DOM works correctly, define the rules of how jsx changes on example.js
By changing updating functions and event loop functions, you can replicate React more closely. After you change example.js as you like. <br />
Run ```npm run compile``` and open index.html on browser.

# Looking forward
There are some rooms to improve regarding how I handle props change, and which attribtues to show in actual DOM. Furthermore, it is also possibel toimplement my own implementation of React. It is interesing to see React implementation and React Fiber implementation, and how they are trying to improve React too.
Lastly, to verify this project, I would need more rigorous test functions.
