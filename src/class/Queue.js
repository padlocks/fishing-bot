const PQueue = require("@esm2cjs/p-queue").default;

class Queue {
  constructor(concurrency) {
    this.queue = new PQueue({ concurrency });
  }

  add(task) {
    return this.queue.add(() => task());
  }
}

module.exports = { Queue };