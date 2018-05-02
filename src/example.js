/*
* This file contains all of the functions used to test virtual DOMs I implemented.
* Instead of replicating React event cycle, I have changed jsx depending on time
* and user interaction
*/

window.CHANGE = false;

window.STATE = {
  todos: [],
  onMove: -1,
}

window.OLDSTATE = {
  todos: [],
  onMove: -1,
}

window.KEYS = 0;
let count = 0;
// Function periodically checks virtual DOMs
const update = (element) => {
  if (window.CHANGE) {
    updateIfNecessary(element, updateViews(window.OLDSTATE), updateViews(window.STATE), 0);
    window.CHANGE = false;
    window.OLDSTATE = Object.assign({}, window.STATE);
  }
  // updateIfNecessary(element, views(count), views(count+1), 0);
  count += 1;
}

// Function that adds a converted DOM to specified element
const render = (element) => {
  element.appendChild(convertToDOM(updateViews(window.STATE)))
  // element.appendChild(convertToDOM(views(count)))
  setInterval(() => update(element), 1000)
}

// Function that set state
const setState = (value) => {
  window.STATE = Object.assign({}, window.STATE, value)
  window.CHANGE = true;
}

// Function that creates a new input 
const createNewInput = (ind) => {
  const newItem = prompt("Please enter new todo");
  if (newItem) {
    const newState = window.STATE.todos.slice(0)
    newState.splice(ind+1, 0, [newItem, window.KEYS ])
    // newState.push([newItem, window.KEYS ])
    window.KEYS += 1;
    setState({ todos: newState })
  }
}

// Function that deletes an item from the list
const handleDeleteItem = (ind) => {
  const newState = window.STATE.todos.slice(0, ind).concat(window.STATE.todos.slice(ind+1))
  setState({ todos: newState })
}

// Function that lets user move item from the list
const handlePreMove = (ind) => {
  setState({ onMove: ind })
}

// Function that reorders list
const handleMove = (ind) => {
  let newState = window.STATE.todos.slice(0);
  const temp = newState.splice(window.STATE.onMove, 1)[0];
  if (ind < window.STATE.onMove) {
    newState.splice(ind+1, 0, temp)
  } else {
    newState.splice(ind, 0, temp)
  }
  setState({ todos: newState, onMove: -1 })
}

const updateViews = (state) => {
  return (
    <div>
      <h1>Virtual DOM ToDO List</h1>
      <ul open={true}>
        <button key={"a"} onClick={createNewInput.bind(this, -1)}>Add New</button>
        {
          state.todos.map((item, ind) => {
            return (
              <li key={item[1]}>
              {item[0]}
              <button onClick={createNewInput.bind(this, ind)}>Add New Below</button>
              <button onClick={handleDeleteItem.bind(this, ind)}>Delete Item</button>
              <button onClick={handlePreMove.bind(this, ind)}>Move Item</button>
              {state.onMove !== -1 && state.onMove !== ind ? <input type="checkbox" onClick={handleMove.bind(this, ind)} /> : <input type="hidden" />}
            </li>
            )
          })
        }
      </ul>
    </div>
  )
}

// Function that updates views periodically
const views = (count) => { //@
  let handleWindow
  if (count < 1) {
    return (
      <ul open={true}>
        <li key="a">item 1</li>
        <li key="b">item 2</li>
        <li key="c">item 3</li>
        <li key="d">item 4</li>
        <li key="e">item 5</li>
      </ul>
    )
  } else if (count < 3) {
    return (
      <ul open={true}>
        <li key="a">item 3</li>
        <li key="c">item 3</li>
        <li key="b">item 2</li>
        <li key="e">item 5</li>
        <li key="d">item 4</li>
      </ul>
    )
  } else {
    return (
      <ul open={true}>
        <li key="a">item 1</li>
        <li key="b">item 2</li>
        <li key="d">item 4</li>
        <li key="e">item 5</li>
      </ul>
    )
  }
}