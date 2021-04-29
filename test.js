window.addEventListener('load', ev => {
  const size = document.querySelector(".target").getBoundingClientRect();

  if (size.width < size.height) {
    document.querySelector('.selected').style.width = `${size.width}px`;
    document.querySelector('.selected').style.height = `${size.width}px`;
  } else if (size.width > size.height) {
    document.querySelector('.selected').style.height = `${size.height}px`;
    document.querySelector('.selected').style.width = `${size.height}px`;
  };
});

let mousedown = false;
let startMousePos = [];
let startElemPos = [];

document.querySelector('.selected').addEventListener('mousedown', e => {
  const elemInfo = document.querySelector('.selected');
  mousedown = true;
  startElemPos = [elemInfo.offsetLeft, elemInfo.offsetTop]
  startMousePos = [e.clientX, e.clientY];
  // console.log(startMousePos);
  e.target.style.cursor = "grabbing"
  console.log(mousedown);
});

let corner = false;

const dataTarget = document.querySelector('.target')
const mousemvCb = e => {
  e.preventDefault();
  console.log(mousedown);
  // if (e.clientX < e.target.offsetLeft || e.clientX > e.target.offsetLeft + e.target.offsetWidth || e.clientY < e.target.offsetTop || e.clientY > e.target.offsetTop + e.target.offsetHeight) mousedown = false;
  if (mousedown && e.target.classList[0] == "selected" && !corner) {
    let posX = startElemPos[0] + (e.clientX - startMousePos[0])
    let posY = startElemPos[1] + (e.clientY - startMousePos[1]);
    if (posX < dataTarget.offsetLeft) posX = dataTarget.offsetLeft;
    else if (posX + e.target.offsetWidth > dataTarget.offsetLeft + dataTarget.offsetWidth) posX = dataTarget.offsetWidth - e.target.offsetWidth;
    if (posY < dataTarget.offsetTop) posY = dataTarget.offsetTop;
    else if (posY + e.target.offsetHeight > dataTarget.offsetTop + dataTarget.offsetHeight) posY = dataTarget.offsetTop + (dataTarget.offsetHeight - e.target.offsetHeight);
    e.target.style.left = `${posX}px`;
    e.target.style.top = `${posY}px`;
  }
}
document.addEventListener('mousemove', mousemvCb)

document.addEventListener('mouseup', ev => {
  if (mousedown) mousedown = false;
  if (corner) corner = false;
  document.querySelector('.selected').style.cursor = "";
});

let cornerMouseStart = [];

document.querySelector('.corner').addEventListener('mousedown', e => {
  corner = true;
  cornerMouseStart = [e.clientX, e.clientY]
});


document.addEventListener('mousemove', e => {
  if (corner) {
    if (e.clientX < cornerMouseStart[0] && e.clientY < cornerMouseStart[1]) {
      const rataRata = ((cornerMouseStart[0] - e.clientX) + (cornerMouseStart[1] - e.clientY)) / 2;
      const val = document.querySelector('.selected').offsetWidth - rataRata;
      document.querySelector('.selected').style.width = val + "px";
      document.querySelector('.selected').style.height = val + "px";
    } else if (e.clientX > cornerMouseStart[0] && e.clientY > cornerMouseStart[1]) {
      const elem = document.querySelector('.selected');
      const rataRata = ((e.clientX - cornerMouseStart[0]) + (e.clientY - cornerMouseStart[1])) / 2;
      const val = document.querySelector('.selected').offsetWidth + rataRata + "px";
      document.querySelector('.selected').style.width = val;
      document.querySelector('.selected').style.height = val;
    }
    cornerMouseStart = [e.clientX, e.clientY]
  }
});

function crop() {
  const selected = document.querySelector('.selected');
  const target = document.querySelector(".target");
  document.querySelector('h1').innerText = `${selected.offsetLeft - target.offsetLeft}, ${selected.offsetTop - target.offsetTop}`
}