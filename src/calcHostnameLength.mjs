export default (arr) => {
  let result = 0;
  const len = arr.length;
  if (len === 0) {
    return 0;
  }
  for (let i = 0; i < len; i++) {
    const b = arr[i];
    if (Array.isArray(b)) {
      result += 2;
    } else {
      result += b.length + 1;
    }
  }
  if (Array.isArray(arr[len - 1])) {
    return result;
  }
  return result + 1;
};
