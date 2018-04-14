import range from 'lodash.range';

// key: functions mapping array element to sort key
export function argmax(array, key) {
  const keys = array.map(val => key(val));
  return range(array.length).reduce((i, j) => keys[i] > keys[j] ? i : j);
}
