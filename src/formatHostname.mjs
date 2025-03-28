const formatHostname = (arr) => {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    const b = arr[i];
    if (Array.isArray(b)) {
      result = result === '' ? formatHostname(b) : `${result}.${formatHostname(b)}`;
    } else {
      result = result === '' ? b.toString() : `${result}.${b.toString()}`;
    }
  }
  return result;
};

export default formatHostname;
