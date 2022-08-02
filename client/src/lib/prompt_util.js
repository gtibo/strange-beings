// Function that return a prompt promise, true if confirmed, false if not

import { prompt, loader } from "$lib/stores.js";


export function makePrompt(...meta) {
  return new Promise((res, rej) => {
    prompt.launch((prompt_value) => {
        res(prompt_value);
      }, ...meta);
  });
}

export function setLoader(text) {
  loader.set(text);
};

export function closeLoader(){
  loader.set(null);
};
