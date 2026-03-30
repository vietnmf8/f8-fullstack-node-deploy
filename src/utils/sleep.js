function sleep(time) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

module.exports = sleep;

/* 
async function demo() {
  await sleep(1000);
  console.log("Done");
}

Tương đương với:

function demo() {
  sleep(1000).then(() => {
    console.log("Done");
  });
}

Nên:
- await = syntax sugar của .then()
- Không phải magic
- Không phải block thật
*/
