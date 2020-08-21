let J = 0;
const mock_results = [true, true, false, true, true];

function compute(i) {
  return new Promise(r => setTimeout(() => r(mock_results[J++]), 500));
}

async function* gen() {
  for (let i = 0; i < 4; i++) {
    const res = await compute(i);
    const retry = yield { message: `Element ${i} - ${res}`, success: res };
    if (retry) {
      i--;
    }
  }
}

async function runGen(g, retry = false) {
  for (r = await g.next(retry); !r.done; r = await g.next(false)) {
    console.log(r.value.message);
    if (!r.value.success) {
      setTimeout(() => {
        runGen(g, true);
      }, 2000);
      break;
    }
  }
}

runGen(gen());
