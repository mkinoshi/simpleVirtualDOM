var _this = this;

/*
* This file contains all of the functions used to test virtual DOMs I implemented.
* Instead of replicating React event cycle, I have changed jsx depending on time
* and user interaction
*/

window.CHANGE = false;

window.STATE = {
  todos: [],
  onMove: -1
};

window.OLDSTATE = {
  todos: [],
  onMove: -1
};

window.KEYS = 0;
let count = 0;
// Function periodically checks virtual DOMs
const update = element => {
  if (window.CHANGE) {
    updateIfNecessary(element, updateViews(window.OLDSTATE), updateViews(window.STATE), 0);
    window.CHANGE = false;
    window.OLDSTATE = Object.assign({}, window.STATE);
  }
  // updateIfNecessary(element, views(count), views(count+1), 0);
  count += 1;
};

// Function that adds a converted DOM to specified element
const render = element => {
  element.appendChild(convertToDOM(updateViews(window.STATE)));
  // element.appendChild(convertToDOM(views(count)))
  setInterval(() => update(element), 1000);
};

// Function that set state
const setState = value => {
  window.STATE = Object.assign({}, window.STATE, value);
  window.CHANGE = true;
};

// Function that creates a new input 
const createNewInput = ind => {
  const newItem = prompt("Please enter new todo");
  if (newItem) {
    const newState = window.STATE.todos.slice(0);
    newState.splice(ind + 1, 0, [newItem, window.KEYS]);
    // newState.push([newItem, window.KEYS ])
    window.KEYS += 1;
    setState({ todos: newState });
  }
};

// Function that deletes an item from the list
const handleDeleteItem = ind => {
  const newState = window.STATE.todos.slice(0, ind).concat(window.STATE.todos.slice(ind + 1));
  setState({ todos: newState });
};

// Function that lets user move item from the list
const handlePreMove = ind => {
  setState({ onMove: ind });
};

// Function that reorders list
const handleMove = ind => {
  let newState = window.STATE.todos.slice(0);
  const temp = newState.splice(window.STATE.onMove, 1)[0];
  if (ind < window.STATE.onMove) {
    newState.splice(ind + 1, 0, temp);
  } else {
    newState.splice(ind, 0, temp);
  }
  setState({ todos: newState, onMove: -1 });
};

const updateViews = state => {
  return vdom(
    "div",
    null,
    vdom(
      "h1",
      null,
      "Virtual DOM ToDO List"
    ),
    vdom(
      "ul",
      { open: true },
      vdom(
        "button",
        { key: "a", onClick: createNewInput.bind(_this, -1) },
        "Add New"
      ),
      state.todos.map((item, ind) => {
        return vdom(
          "li",
          { key: item[1] },
          item[0],
          vdom(
            "button",
            { onClick: createNewInput.bind(_this, ind) },
            "Add New Below"
          ),
          vdom(
            "button",
            { onClick: handleDeleteItem.bind(_this, ind) },
            "Delete Item"
          ),
          vdom(
            "button",
            { onClick: handlePreMove.bind(_this, ind) },
            "Move Item"
          ),
          state.onMove !== -1 && state.onMove !== ind ? vdom("input", { type: "checkbox", onClick: handleMove.bind(_this, ind) }) : vdom("input", { type: "hidden" })
        );
      })
    )
  );
};

// Function that updates views periodically
const views = count => {
  //@
  let handleWindow;
  if (count < 1) {
    return vdom(
      "ul",
      { open: true },
      vdom(
        "li",
        { key: "a" },
        "item 1"
      ),
      vdom(
        "li",
        { key: "b" },
        "item 2"
      ),
      vdom(
        "li",
        { key: "c" },
        "item 3"
      ),
      vdom(
        "li",
        { key: "d" },
        "item 4"
      ),
      vdom(
        "li",
        { key: "e" },
        "item 5"
      )
    );
  } else if (count < 3) {
    return vdom(
      "ul",
      { open: true },
      vdom(
        "li",
        { key: "a" },
        "item 3"
      ),
      vdom(
        "li",
        { key: "c" },
        "item 3"
      ),
      vdom(
        "li",
        { key: "b" },
        "item 2"
      ),
      vdom(
        "li",
        { key: "e" },
        "item 5"
      ),
      vdom(
        "li",
        { key: "d" },
        "item 4"
      )
    );
  } else {
    return vdom(
      "ul",
      { open: true },
      vdom(
        "li",
        { key: "a" },
        "item 1"
      ),
      vdom(
        "li",
        { key: "b" },
        "item 2"
      ),
      vdom(
        "li",
        { key: "d" },
        "item 4"
      ),
      vdom(
        "li",
        { key: "e" },
        "item 5"
      )
    );
  }
};