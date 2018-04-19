/*
* This file contains all of the functions used to test virtual DOM I implemented.
* Instead of replicating React event cycle, I have changed jsx depending on time
* and user interaction
*/

// Function peodically checks virtual DOM
const update = (element, count) => {
  updateIfNecessary(element, updateViews(count), updateViews(count + 1), 0);
  // patch(el, patches);
  if (count > 100) {
    return;
  }
  setTimeout(() => update(element, count + 1), 500);
};

// Function that adds converted DOM to specified element
const render = element => {
  element.appendChild(convertToDOM(updateViews(0)));
  setTimeout(() => update(element, 0), 500);
};

// Function that updates views periodically
const updateViews = count => {
  //@
  let handleWindow;
  if (count < 3) {
    handleWindow = () => window.prompt('yoyo');
    return vdom(
      "ul",
      { id: "4", open: true },
      vdom(
        "li",
        { onClick: handleWindow },
        "item 1"
      ),
      vdom(
        "li",
        null,
        "item 2"
      )
    );
  } else if (count < 5) {
    return vdom(
      "div",
      null,
      vdom(
        "h1",
        null,
        "This is very interesting"
      )
    );
  } else if (!window.clicked || window.clicked && window.clicked > count) {
    return vdom(
      "div",
      null,
      vdom(
        "button",
        { onClick: () => window.clicked = count + 3 },
        "Try clicking this"
      )
    );
  } else {
    return vdom(
      "div",
      null,
      vdom(
        "h1",
        null,
        "This virtual DOM seems to be working"
      )
    );
  }
};