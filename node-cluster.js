const { Worker, isMainThread, parentPort } = require("worker_threads");

const products = [
  "product1",
  "product2",
  "product3",
  "product4",
  "product5",
  "product6",
];

// Worker function as a string
const workerFunctionString = `
  const { parentPort } = require('worker_threads');

  // Processing function to simulate product processing
  const processProduct = (product, workerId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(\`Worker \${workerId}: Processed \${product} successfully\`);
      }, Math.random() * 1000);
    });
  };

  parentPort.on('message', async ({ product, workerId }) => {
    const result = await processProduct(product, workerId);
    parentPort.postMessage(result);
  });
`;

const main = async () => {
  if (isMainThread) {
    const workers = [];
    const results = []; // Array to hold results
    const numberOfWorkers = 4; // Number of workers to use
    let productQueue = [...products]; // Copy of the products array

    // Create workers
    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker(workerFunctionString, { eval: true });
      workers.push(worker);

      // Listen for messages from the worker
      worker.on("message", (message) => {
        results.push(message); // Collect the success message
        console.log(`Received: ${message}`);

        // Check if there are products left to process
        if (productQueue.length > 0) {
          // Send the next product to the worker
          const product = productQueue.shift(); // Get the next product
          worker.postMessage({ product, workerId: i + 1 }); // Send it to the worker
          console.log(`Sending ${product} to Worker ${i + 1}`);
        } else {
          console.log(
            `Worker ${i + 1} has completed processing and will exit.`
          );
          worker.terminate(); // Terminate the worker if no products left
        }
      });

      // Start processing the first product immediately
      if (productQueue.length > 0) {
        const product = productQueue.shift(); // Get the next product
        worker.postMessage({ product, workerId: i + 1 }); // Send it to the worker
        console.log(`Sending ${product} to Worker ${i + 1}`);
      }
    }

    // Wait for all workers to finish processing
    await Promise.all(
      workers.map(
        (worker) =>
          new Promise((resolve) => {
            worker.on("exit", resolve);
          })
      )
    );

    // Log the results after all processing is complete
    console.log("All products processed. Results:", results);
  }
};

// Start the processing
main();
