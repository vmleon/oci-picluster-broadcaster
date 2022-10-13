const vector = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const result = vector.reduce((prev, curr, idx) => {
  const elem = (value) => ({bin: 0, bins: {bin: 0, count: value}});
  return [...prev, elem(curr)];
}, []);

console.log(vector);
console.log(result);
