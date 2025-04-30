import { writable } from "svelte/store";

export const model = writable("llama2"); // default fallback

export function setModel(newModel: string) {
  model.set(newModel);
  localStorage.setItem("chat-model", newModel);
}

// Load saved model on initialization
if (typeof localStorage !== "undefined") {
  const saved = localStorage.getItem("chat-model");
  if (saved) model.set(saved);
}
