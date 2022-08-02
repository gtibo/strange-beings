import { writable } from 'svelte/store';

function createPrompt() {
	const { subscribe, set, update } = writable(null);
  let callback = null;
	return {
		subscribe,
		launch: (new_callback, ...meta) =>{
      callback = new_callback;
      set({
				title: meta[0],
        content: meta[1],
				confirm_text: meta[2],
        cancel_text: meta[3] || false
      });
    },
    close: (value) => {
      callback(value);
      set(null);
    }
	};
}

export const loader = writable(null);
export const prompt = createPrompt();
export const token = writable(null);
