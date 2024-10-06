import { Worker, isMainThread, parentPort } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

const products = [
  "product1",
  "product2",
  "product3",
  "product4",
  "product5",
  "product6",
  "product7",
  "product8",
  "product9",
  "product10",
  "product11",
  "product12",
  "product13",
  "product14",
  "product15",
];

// Get __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  if (isMainThread) {
    const workers = [];
    const results = []; // Array to hold results
    const numberOfWorkers = 4; // Number of workers to use
    let productQueue = [...products]; // Copy of the products array

    // Create workers
    for (let i = 0; i < numberOfWorkers; i++) {
      const worker = new Worker(path.resolve(__dirname, "worker.js")); // Use the worker file
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
    }

    // Start processing the products by sending them to the workers
    for (let i = 0; i < numberOfWorkers; i++) {
      if (productQueue.length > 0) {
        const product = productQueue.shift(); // Get the next product
        workers[i].postMessage({ product, workerId: i + 1 }); // Send it to the worker
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
