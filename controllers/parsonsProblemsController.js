const ParsonProblem = require('../models/parsonProblem');
const geminiInterface = require('../helpers/geminiInterface');

exports.createParsonProblem = async (req, res) => {

    try {
        
        // Extract information to create the PP :)))))
        const { topic, theme } = req.body;


        const { prompt, correctBlocks, scrambledBlocks } = await geminiInterface.generateProblemViaGemini(topic, theme); 

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