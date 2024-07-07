function getRandomValue(array){
  return array[Math.floor(Math.random() * array.length)];
}

function doSomeTask() {
  const ms = getRandomValue([100, 150, 200, 250, 300, 350, 400, 450, 500]);
  const shouldThrowError = getRandomValue([1,2,3,4,5,6,7,8]) === 8;

  if(shouldThrowError){
    const randomError = getRandomValue(["Failure", "Server down", "Access denied", "Not found error"])

    throw new Error(randomError)
  }

  return new Promise((res, rej) => setTimeout(() => res(ms), ms))
}

export default doSomeTask;