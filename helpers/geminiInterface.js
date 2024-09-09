const ParsonProblem = require('../models/parsonProblem');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');


const genAI = new GoogleGenerativeAI(config.ai_api_key);


// Route to generate a Parsons Problem using AI API
exports.generateProblemViaGemini = async (req) => {
    const { topic, theme } = req.body;
    let pTopic = '';
    const pTheme = theme
;
    switch (topic) {
        case 'DataFrame':
            pTopic += "Dataframes using Pandas";
            break;
        case 'NMI':
            pTopic += "Normalized Mutual Information (NMI) using scikit-learn";
            break;
        case 'Sentence Splitting':
            pTopic += "Sentence splitting using nltk.sent_tokenize().";
            break;
        case 'Correlation':
            pTopic += "Correlations using Pandas.";
            break;
        case 'Linear Regression':
            pTopic += "Linear regression using Scikit-learn.";
            break;
        case 'Decision Tree Classifier':
            pTopic += "Decision tree classifiers using Scikit-learn.";
            break;
        case 'CSV':
            pTopic += "CSV files using pandas";
            break;
        default:
            return res.status(404).send({ error: 'Please select a prexisting topic' });
    }

    // const doNotIncludeSpecials = 'Additionally, in the strings of the "codeBlocks" array, do not include formatting such as unecessary whitespaces preceeding bits of code and new line characters'

    // Construct the prompt based on the selected topic
    const prompt = `Create a Parson's problem around the theme of ${pTheme} and the topic of ${pTopic}. The problem should ask the user to perform a task related to this theme in using the python blocks. Provide the correct code, split into blocks, ensuring the code logically aligns with the task. Format the response as a JSON object with two properties: "prompt": a string containing the question to be solved. "codeBlocks": an array of strings, where each string is a line of the correct code. Ensure the code blocks are ordered to solve the problem correctly and fit the theme. To be clear, the "codeBlocks" array strings should contain no newline characters at all.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const problemJSON = JSON.parse(response.text().replace(/```json|```|\*/g, ''));   // Get text part of the response and replace eliminate code markers and then convert to json

        // Scramble the code lines (simple random shuffling)
        const scrambledBlocks = [...problemJSON['codeBlocks']].sort(() => Math.random() - 0.5);

        // Save the problem in MongoDB
        const parsonProblem = new ParsonProblem({
            prompt: problemJSON['prompt'],
            topic: pTopic,
            theme: pTheme,
            correctBlocks: problemJSON['codeBlocks'],
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
