/*
* This file implements virtualDOM which can handle jsx
* I assume that Babel is correctly working, and it can correctly
* translate jsx to (type, props, children)
* virtualDOM is represented as (type: String, props: Object, children: Array of virtualDOM)
* One of the drawbacks of this implementation is that it destroys a DOM and replace it 
* with another DOM when you update an existing virtual DOM component. It can be optimzed
* by chaning only necessary props of DOM.
*/

/* Basic functions convert VirtualDOM to DOM */

// Function conerts the transformed jsx by Babel into
// my representation
const vdom = (type, props, ...children) => {
  props = props ? props : {};
  children = _.flatten(children)
  return {type, props, children}
}

// Function that converts virtualDOM to actual DOM
const convertToDOM = (node) => {
  if (typeof node === 'string') {
    return document.createTextNode(node)
  }
  const element = document.createElement(node.type)
  setProps(element, node.props);
  node.children.forEach((childElement) => {
    element.appendChild(convertToDOM(childElement))
  })
  return element
}

// Function that sets all of the props to the selected element
const setProps = (element, props) => {
  Object.keys(props).forEach((key) => {
    setAttribute(element, key, props[key])
  })
}

// Function that sets each attribute
const setAttribute = (element, key, value) => {
  key = key === 'className' ? 'class' : key;
  element.setAttribute(key, value)
  // TODO: Handling boolean ?
}

/* Basic functions that control the event loop */

const view = (count) => { //@
  if (count < 2) {
    return (
      <ul>
      <li>item 1</li>
      <li>item 2</li>
    </ul>
    )
  } else {
    return (
      <ul>
      <li>item 1</li>
      <li id="3">item 2</li>
    </ul>
    )
  }
}

// Function peodically checks virtual DOM
const update = (element, count) => {
  console.log(count);
  updateIfNecessary(element, view(count), view(count + 1), 0)
  // patch(el, patches);
  if (count > 5) {
    return 
  }
  setTimeout(() => update(element, count + 1), 500)
}

// Function that adds convert DOM to specified element
const render = (element) => {
  element.appendChild(convertToDOM(view(0)))
  setTimeout(() => update(element, 0), 500)
} 

/* Basic function that compares to virtualDOM */

// Function that updates element when necessary
const updateIfNecessary = (element, oldElement, newElement, ind) => {
  if (!oldElement && !newElement) {
    return
  } else if (!oldElement) {
    // add an element
    element.appendChild(convertToDOM(newElement))

  } else if (!newElement) {
    // delete an old element
    element.removeChild(element.childNodes[ind])

  } else if (needChange(oldElement, newElement)) {
    // replace old element with new element
    console.log(oldElement, newElement)
    element.replaceChild(convertToDOM(newElement), element.childNodes[ind])

  } else if (newElement.type) {
    // run the function on children
    const maxInd = newElement.children.length > oldElement.children.length ?
    newElement.children.length :
    oldElement.children.length;
    for (let i=0; i < maxInd; i++) {
      updateIfNecessary(element.childNodes[ind], oldElement.children[i], newElement.children[i], i)
    }
  }
}

// Function that checkes whether it needs to update element
const needChange = (oldElement, newElement) => {
  // when old element is string
  if (typeof oldElement ==='string') {
    return oldElement !== newElement
  } 
  return oldElement.type !== newElement.type ||
  typeof oldElement !== typeof newElement ||
  compareProps(oldElement.props, newElement.props)
}

// Function that compares two props
const compareProps = (oldProps, newProps) => {
  const allKeys = Object.assign({}, oldProps, newProps);
  for (let i=0; i < Object.keys(allKeys).length; i++) {
    const key = Object.keys(allKeys)[i];
    if (!(key in oldProps)) {
      return true
    } else if (!(key in newProps)) {
      return true
    } else if (oldProps[key] !== newProps[key]) {
      return true
    }
  }
  return false
}