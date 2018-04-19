/*
* This file contains all of the functions used to test virtual DOMs I implemented.
* Instead of replicating React event cycle, I have changed jsx depending on time
* and user interaction
*/

// Function periodically checks virtual DOMs
const update = (element, count) => {
  updateIfNecessary(element, updateViews(count), updateViews(count + 1), 0)
  // patch(el, patches);
  if (count > 100) {
    return
  }
  setTimeout(() => update(element, count + 1), 500)
}

// Function that adds a converted DOM to specified element
const render = (element) => {
  element.appendChild(convertToDOM(updateViews(0)))
  setTimeout(() => update(element, 0), 500)
} 

// Function that updates views periodically
const updateViews = (count) => { //@
  let handleWindow
  if (count < 3) {
    handleWindow = () => window.prompt('yoyo')
    return (
      <ul id="4" open={true}>
      <li onClick={handleWindow}>item 1</li>
      <li>item 2</li>
    </ul>
    )
  } else if (count < 5) {
    return (
      <div>
        <h1>This is very interesting</h1>
      </div>
    )
  } else if (!window.clicked || window.clicked && window.clicked > count) {
    return (
      <div>
        <button onClick={() => window.clicked = count + 3}>Try clicking this</button>
      </div>
    )
  } else {
    return (
      <div>
        <h1>This virtual DOM seems to be working</h1>
      </div>
    )
  }
}