/*
* This file implements virtualDOM which can handle jsx
* I assume that Babel is correctly working, and it can correctly
* translate jsx to (type, props, children)
* Virtual DOM is represented as (type: String, props: Object, children: Array of virtual DOM)
* One of the drawbacks of this implementation is that it destroys a DOM and replace it 
* with another DOM when you update props of an existing virtual DOM component. It can be optimzed
* by chaning only necessary props of DOM, but to avoid the complications I faced when I tried 
* to handl event listers properly, I chose that way. Furthermore, currently it shows all of the property in
* actual DOM, and it can be changed when we do not want to show all of the properties on actual DOM
*/

/* Basic functions convert VirtualDOM to DOM */

// Function converts the transformed jsx by Babel into
// my representation
const vdom = (type, props, ...children) => {
  props = props ? props : {};
  children = _.flatten(children)
  return {type, props, children}
}

// Function that converts virtualDOM to actual DOM
const convertToDOM = (node) => {
  if (!node) {
    return document.createTextNode('');
  }
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

// Function that sets each attribute or event listener
const setAttribute = (element, key, value) => {
  key = key === 'className' ? 'class' : key;
  if (isEventHandler(key)) {
    setEventListener(element, key, value)
  } else {
    element.setAttribute(key, value)
  }
}

// Function that detects even setting i.e. onClick, onDrag
// It assumes the following format: on[uppercase][lowercase]*
const isEventHandler = (key) => {
  if (key.slice(0, 2) === 'on' && isUppercase(key.slice(2, 3)) && isLowercase(key.slice(3, 4))) {
    return true
  }
  return false
}

// Function that returns true if a specified character is uppercase
const isUppercase = (letter) => (
  letter.toUpperCase() === letter
)


// Function that retuens true if a pecified character is lowercase
const isLowercase = (letter) => (
  letter.toLowerCase() === letter
)

// Function that registers event to an element
const setEventListener = (element, key, value) => {
  const event = key.slice(2).toLowerCase();
  element.addEventListener(event, value, true)
}

/* Basic function that compares to virtualDOM and pdates elements when necessary*/

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
    element.replaceChild(convertToDOM(newElement), element.childNodes[ind])
  } else if (newElement.type && newElement.type === 'ul') {
    // When children have keys
    updateChildrenWithKeys(element.childNodes[ind], oldElement.children, newElement.children)
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

// Function that updates elements which have keys 
const updateChildrenWithKeys = (element, oldElementChildren, newElementChildren) => {
  const keysInOldElement = oldElementChildren.map((oldVdom) => oldVdom.props.key);
  const keysInNewElement = newElementChildren.map((newVdom) => newVdom.props.key);
  const uniqueKeys = keysInOldElement.concat(keysInNewElement).filter((val, ind, arr) => arr.indexOf(val) === ind);
  const keysInOldObject = createKeyObject(keysInOldElement)
  const keysInNewObject = createKeyObject(keysInNewElement)
  const { deletedKeys, insertedKeys, staticKeys, unsortedStatiskeys} = categorizeKeys(uniqueKeys, keysInOldObject, keysInNewObject, keysInOldElement)
  let count = 0; // this variable keeps track of the items added
  // First handle reorder of keys that stay the same
  handleReorder(element, staticKeys, unsortedStatiskeys, keysInOldObject, keysInNewObject, keysInOldElement, oldElementChildren, newElementChildren)
  handleDeletion(element, deletedKeys, keysInOldObject)
  handleInsert(element, insertedKeys, keysInNewObject, newElementChildren)
}

// Function that handles reorder of statick keys 
const handleReorder = (element, staticKeys, unsortedStatiskeys, keysInOldObject, keysInNewObject, keysInOldElement, oldElementChildren, newElementChildren) => {
  const replacedKeys = []
  let flipped = false;
  for (let i=0; i < staticKeys.length; i++) {
    const oldInd = unsortedStatiskeys.indexOf(staticKeys[i]);
    const newInd = i
    if (oldInd !== newInd && (replacedKeys.indexOf(keysInOldElement[oldInd]) === -1 || replacedKeys.indexOf(keysInOldElement[newInd]) === -1)) {
      // ...RealInd refers to the index in the actual DOM, and ...Ind refers to the index in the unsortedSotaticKeys
      let firstRealInd = keysInOldObject[staticKeys[i]];
      let secondRealInd = keysInOldObject[unsortedStatiskeys[i]];
      let firstInd = oldInd
      let secondInd = newInd
      if (secondInd < firstInd) {
        const tmp = firstInd
        firstInd = secondInd
        secondInd = tmp
      } 
      if (secondRealInd < firstRealInd) {
        const tmp = firstRealInd
        firstRealInd = secondRealInd
        secondRealInd = tmp
      }
      // Keep track of items you already swap
      replacedKeys.push(unsortedStatiskeys[firstInd])
      replacedKeys.push(unsortedStatiskeys[secondInd])
      // In case you have to replace the ones each other, you don't have to the second half
      // First delete the one, after taking the reference
      const firstTmp = element.removeChild(element.childNodes[secondRealInd]);
      const valTmp = unsortedStatiskeys.splice(secondInd, 1)[0];
      element.insertBefore(firstTmp, element.childNodes[firstRealInd])
      unsortedStatiskeys.splice(firstInd, 0, valTmp);
      if (secondRealInd - firstRealInd > 1) {
        const secondTmp = element.removeChild(element.childNodes[firstRealInd+1]);
        element.insertBefore(secondTmp, element.childNodes[secondRealInd-1].nextSibling)
      }
      if (secondInd - firstInd > 1) {
        const secondValTmp = unsortedStatiskeys.splice(firstInd+1, 1)[0];
        unsortedStatiskeys.splice(secondInd, 0, secondValTmp);
      }

      // You also have to make sure to update the key-index object
      const indTmp = keysInOldObject[unsortedStatiskeys[secondInd]]
      keysInOldObject[unsortedStatiskeys[secondInd]] = keysInOldObject[unsortedStatiskeys[firstInd]]
      keysInOldObject[unsortedStatiskeys[firstInd]] = indTmp
      flipped = true;
    }
  }
  for (let j=0; j < staticKeys.length; j++) {
    const oldInd = keysInOldElement.indexOf(staticKeys[j]);
    const newInd = keysInNewObject[staticKeys[j]];
    const realInd = keysInOldObject[staticKeys[j]]
    const maxInd = newElementChildren[newInd].children.length > oldElementChildren[oldInd].children.length ?
    newElementChildren[newInd].children.length :
    oldElementChildren[oldInd].children.length;
    for (let i=0; i < maxInd; i++) {
      updateIfNecessary(element.childNodes[realInd], oldElementChildren[oldInd].children[i], newElementChildren[newInd].children[i], i)
    }
  }
}

// Function that handles addition of new item here
const handleInsert = (element, insertedKeys, keysInNewObject, newElementChildren) => {
  for (let i=0; i < insertedKeys.length; i++) {
    const newInd = keysInNewObject[insertedKeys[i]]
      // when it needs to insert
      if (newInd === 0) {
        element.insertBefore(convertToDOM(newElementChildren[newInd]), element.childNodes[0]);
      } else {
        element.insertBefore(convertToDOM(newElementChildren[newInd]), element.childNodes[newInd-1].nextSibling);
      }
  }
}

// Function that handles the deletion of a key
const handleDeletion = (element, deletedKeys, keysInOldObject) => {
  for (let i=0; i < deletedKeys.length; i++) {
    const oldInd = keysInOldObject[deletedKeys[i]]
    // when it needs to delete
    element.removeChild(element.childNodes[oldInd])
    // Update key-value object
    Object.keys(keysInOldObject).forEach((key) => {
      if (keysInOldObject[key] > oldInd) {
        keysInOldObject[key] -= 1
      }
    })
  }
}

// Function that creates an object from a list of keys
const createKeyObject = (elementList) => {
  const keyObject = {}
  elementList.forEach((key, ind) => {
    keyObject[key] = ind
  })
  return keyObject;
}

// Function that categorizes each key will be inserted, deelted, or stayed the same
// It also returns sorted arrays
const categorizeKeys = (uniqueKeys, keysInOldObject, keysInNewObject) => {
  const deletedKeys = [];
  const insertedKeys = [];
  const staticKeys = [];
  uniqueKeys.forEach((key) => {
    if (key in keysInOldObject && !(key in keysInNewObject)) {
      // a key will be deleted
      deletedKeys.push(key);
    } else if (key in keysInNewObject && !(key in keysInOldObject)) {
      // a key will be deleted
      insertedKeys.push(key);
    } else {
      staticKeys.push(key);
    }
  })
  deletedKeys.sort((a, b) => keysInOldObject[a] - keysInOldObject[b])
  insertedKeys.sort((a, b) => keysInNewObject[a] - keysInNewObject[b])
  const unsortedStatiskeys = staticKeys.slice(0)
  staticKeys.sort((a, b) => keysInNewObject[a] - keysInNewObject[b])
  return { deletedKeys, insertedKeys, staticKeys, unsortedStatiskeys}
}


// Function that checkes whether it needs to update element
const needChange = (oldElement, newElement) => {
  // when old element is string
  if (typeof oldElement ==='string') {
    return oldElement !== newElement
  } 
  return oldElement.type !== newElement.type ||
  typeof oldElement !== typeof newElement || needChangeProps(oldElement.props, newElement.props)
}

// Function that indetifies when it has to update props
const needChangeProps = (oldProps, newProps) => {
  const allKeys = Object.assign({}, oldProps, newProps);
  for (let i=0; i < Object.keys(allKeys).length; i++) {
    const key = Object.keys(allKeys)[i];
    if (!(key in oldProps)) {
      // add new prop to new element
      return true
    } else if (!(key in newProps)) {
      // remove a prop from a new one
      return true
    } else if (comparePropValue(oldProps[key], newProps[key])) {
      return true
    }
  }
  return false
}

// Function that compares two props values, and return true if they are different
const comparePropValue = (oldProps, newProps) => {
  // First check whether they are both objects or array
  if (Object.prototype.toString.call(oldProps) !== Object.prototype.toString.call(newProps)) {
    return true
  }
  // if it is an array check the number of items 
  if (Object.prototype.toString.call(oldProps) === '[object Array]' && oldProps.length !== newProps.length) {
    return true
  }
  //  if it is an object, check the number of keys
  if (Object.prototype.toString.call(oldProps) === '[object Object]' && Object.keys(oldProps).length !== Object.keys(newProps).length) {
    return true
  }
  // if it is a function, it converts to string without using JSON.stringfy
  if (Object.prototype.toString.call(oldProps) === '[object Function]') {
    return true
  }
  // Otherwise, it converts objects to string, anc check whether these two are the same
  if (JSON.stringify(oldProps) !== JSON.stringify(newProps)) {
    return true
  }
  return false
}