import { openDB } from 'idb';

const imagesDiv = document.querySelector('#images');

const INITIAL_VALUE = 0;

let db;

const appendImageToPage = (blob) => {
  const img = document.createElement('img');
  img.src = URL.createObjectURL(blob);
  imagesDiv.innerHTML = '';
  imagesDiv.append(img);
};

if ('indexedDB' in window) {
  db = await openDB('my-database', 1, {
    upgrade(db) {
      db.createObjectStore('counter');
      db.createObjectStore('image');
    },
  });

  const blobOrNull = (await db.get('image', 'content')) || null;
  if (blobOrNull) {
    appendImageToPage(blobOrNull);
  }
}

export async function setupCounter(countButton, resetButton, imageButton) {
  // Get information about last counter state or set to initial value.
  try {
    let counter = (await db.get('counter', 'content')) || INITIAL_VALUE;

    const setCounter = async (count) => {
      counter = count;
      countButton.innerHTML = `count is ${counter}`;
      await db.put('counter', counter, 'content');
    };

    countButton.addEventListener('click', () => setCounter(++counter));

    resetButton.addEventListener('click', () => {
      setCounter(INITIAL_VALUE);
    });

    imageButton.addEventListener('click', async () => {
      const url = `https://placekitten.com/${
        Math.floor(Math.random() * 9) + 1
      }00/${Math.floor(Math.random() * 9) + 1}00`;
      const blob = await fetch(url).then((response) => response.blob());
      await db.put('image', blob, 'content');
      appendImageToPage(blob);
    });

    setCounter(counter);
  } catch (err) {
    alert(`${err.name}: ${err.message}`);
  }
}
