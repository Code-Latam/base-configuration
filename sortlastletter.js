var Myobj = {
    name: "Alice",
    age: 25,
    city: "New York",
    hobba: "reading",
    color: "blue",
    animal: "cat"
  };

  const myreturn = sortObjByReverseKey(Myobj);
  console.log(myreturn);


  function sortObjByReverseKey(obj) {
    return Object.keys(obj).sort(function (a, b) {
      return a.split("").reverse().join("").localeCompare(b.split("").reverse().join(""));
    }).reduce(function (result, key) {
      result[key] = obj[key];
      return result;
    }, {});
  }