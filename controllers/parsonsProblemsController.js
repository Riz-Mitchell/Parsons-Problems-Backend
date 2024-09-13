const ParsonProblem = require('../models/parsonProblem');
const geminiInterface = require('../helpers/geminiInterface');
const { exec } = require('child_process');

exports.createParsonProblem = async (req, res) => {
    try {
      const { topic, theme } = req.body;
  
      // Retry the problem generation and Python execution indefinitely until it succeeds
      const { prompt, correctBlocks, scrambledBlocks } = await generateAndRunPython(topic, theme);
  
      // Save the problem in MongoDB
      const parsonProblem = new ParsonProblem({
        prompt: prompt,
        topic: topic,
        theme: theme,
        correctBlocks: correctBlocks,
        scrambledBlocks: scrambledBlocks,
        ipAddress: req.ip
      });
  
      await parsonProblem.save();
  
      // Respond with the scrambled code to the frontend
      res.status(200).send({
        problemId: parsonProblem._id,
        prompt: parsonProblem.prompt,
        scrambledBlocks: parsonProblem.scrambledBlocks
      });
  
    } catch (error) {
      // Catch and handle any unexpected errors
      res.status(500).json({ error: error.message });
    }
  };

exports.submitSolution = async (req, res) => {
    const parsonProblemId = req.params.id;
    const userCode = req.body;

    try {
        const parsonProblem = await ParsonProblem.findById(parsonProblemId);

        if (!problem) {
            return res.status(404).send('Problem not found');
        }

        const solution = parsonProblem.solution;

        res.send(
        {
            data: solution,
        }
        ).status(200);
    } catch (error) {
        res.send(`Internal server error: ${error}`).status(500);
    }
}

// Function to run Python code and return a promise
// promise: to wait for the Python execution to finish before proceeding with saving the problem and responding to the frontend.
const runPythonCode = (codeString) => {
    return new Promise((resolve, reject) => {
      exec(`python -c "${codeString}"`, (error) => {
        if (error) {
          return reject(error); // Reject the promise with the error
        }
        resolve(); // Resolve the promise when the code runs successfully
      });
    });
  };
  
// Function to continuously retry problem generation and Python execution until success
const generateAndRunPython = async (topic, theme) => {
    while (true) { // Infinite loop to retry until success
        try {
            const { prompt, correctBlocks, scrambledBlocks } = await geminiInterface.generateProblemViaGemini(topic, theme);

            const correctCodeString = correctBlocks.map(line => line.replace(/"/g, '\\"')).join('; ');

            await runPythonCode(correctCodeString); // Only check for success/failure

            // If Python code runs successfully, return the problem data
            console.log('successfully ran');
            return { prompt, correctBlocks, scrambledBlocks };

        } catch (error) {
            console.error(`Error: ${error}. Retrying...`);
        }
    }
};