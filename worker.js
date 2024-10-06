// worker.js
const { parentPort } = require("worker_threads");

// Processing function to simulate product processing
const processProduct = (product, workerId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Worker ${workerId}: Processed ${product} successfully`);
    }, Math.random() * 1000); // Random delay to simulate processing time
  });
};

// Listen for messages from the parent thread
parentPort.on("message", async ({ product, workerId }) => {
  const result = await processProduct(product, workerId);
  parentPort.postMessage(result); // Send the result back to the parent
});
