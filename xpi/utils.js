export async function getOptions() {
 let result = await browser.storage.sync.get("options");
 return result.options;
}


export async function getOption(key, defaultValue) {
 let result = await browser.storage.sync.get("options");
 let options = result.options;
 if (options[key] === undefined)
  return defaultValue;
 return options[key];
}
