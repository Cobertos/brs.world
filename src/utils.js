export function noObserve (obj, excludeKeys=[]) {
  /*function noObserverObject(obj) {
    Object.keys(obj)
    .forEach((key) => {
        Object.defineProperty(obj, key, { configurable: false });
    });
  }*/

  //Mark all the properties as non-configurable and Vue won't iterate over them
  //and make them all observable
  //excludeKeys to continue to observe specific keys
  //TODO: In the future, it might be nice to make this configurable
  //with deeper .'d keys as well as observing everything off a specific key with .* syntax
  Object.keys(obj)
    .filter((key)=>!excludeKeys.includes(key))
    .forEach((key) => {
        Object.defineProperty(obj, key, { configurable: false });
    });
  return obj;
}
