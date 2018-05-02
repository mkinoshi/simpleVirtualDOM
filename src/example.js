/*
* This file contains all of the functions used to test virtual DOMs I implemented.
* Instead of replicating React event cycle, I have changed jsx depending on time
* and user interaction
*/

window.CHANGE = false;

window.STATE = {
  todos: [],
  onMove: -1,
  random: [0, 1],
}

window.OLDSTATE = {
  todos: [],
  onMove: -1,
  random: [0, 1],
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
  count += 1;
}

// Function that adds a converted DOM to specified element
const render = (element) => {
  element.appendChild(convertToDOM(updateViews(window.STATE)))
  setInterval(() => update(element), 100)
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

// Function that creates array of random numbers between 0 and 10
const createRandomList = () => {
  const randomNumberArray = _.shuffle(Array.from({length: 10}, (v, i) => i));
  const numberOfNumbers = Math.floor(Math.random() * 10);
  const newState = randomNumberArray.slice(0, numberOfNumbers);
  setState({ random: newState })
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
      <h1>Create A Random List</h1>
      <button onClick={createRandomList}>Generate List</button>
      <div>The list number should be: <p>{state.random.join(', ')}</p></div>
      <ul>
        {state.random.map((item) => (
          <li key={'r-'+item}>{'item: '+ item}</li>
        ))}
      </ul>
    </div>
  )
}
