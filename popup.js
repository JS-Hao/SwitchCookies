const el = ele => document.querySelector(ele);
const all = ele => document.querySelectorAll(ele);

document.addEventListener('DOMContentLoaded', main);

function main() {
  window.localStorage = localStorage;
  window.cache = JSON.parse(localStorage.getItem('switchCookiesData') || '{}');

  const list = el('.list');
  const btn = el('.btn');

  btn.addEventListener('click', handleAdd, false);

  chrome.tabs.getSelected(null, getCurrentCb);

  const lis = all('.unit');
  const names = Object.keys(cache);

  if (!names.length) {
    handleAdd();
  } else {
    names.map(name => {
      list.appendChild(addLi(true, name, cache[name]));
    })
  }
}

function handleAdd() {
  const list = el('.list');
  list.appendChild(addLi(false));
}

function addLi(isCheck = false, name = '', value = '') {
  const html = `
    <li class="unit">
      <input type="checkbox" class="checkbox" name="checkbox" ${ isCheck ? 'checked="checked"' : '' }>
      <input type="text" class="name" name="name" value="${ name }" placeholder="name">
      <input type="text" class="value" name="value" value="${ value }" placeholder="value">
    </li>
  `,
        div = document.createElement('div');

  div.innerHTML = html;
  const dom = div.querySelector('li');
  dom.querySelector('.checkbox').addEventListener('click', handleCheck, false);

  return dom;
}

function handleCheck() {
  const lis = all('.unit'),
        diff = {};

  for (li of lis) {
    const isCheck = li.querySelector('.checkbox').checked,
          name = li.querySelector('.name').value,
          value = li.querySelector('.value').value;
    console.log(isCheck, name, value);
    if (isCheck && name !== '' && value !== '') {
      diff[name] = value;
    }
  }

  updateLocalStorage(diff);
  updateCookies(diff);

  cache = diff;
}

function updateLocalStorage(diff) {
  clearLocalStorage();
  setLocalStorage(diff);
}

function clearLocalStorage() {
  localStorage.removeItem('switchCookiesData');
}

function setLocalStorage(diff) {
  localStorage.setItem('switchCookiesData', JSON.stringify(diff));
}

function updateCookies(diff) {
  clearCookies();
  setCookies(diff);
}

function clearCookies() {
  for (name in cache) {
    chrome.cookies.remove({
      url,
      name,
    }, () => console.log('清除成功'));
  }
}

function setCookies(diff) {
  for (name in diff) {
    chrome.cookies.set({
      url,
      name,
      value: diff[name],
    }, () => console.log('设置成功'));
  }
}

function getCurrentCb(tab) {
  window.url = tab.url;
}

