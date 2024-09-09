const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');


const genAI = new GoogleGenerativeAI(config.ai_api_key);


/**
 * Generates a Parson's problem based on a specific topic and theme using the Gemini model.
 * 
 * @param {String} topic - The topic for the Parson's problem. Should be one of the following:
 *                         'DataFrame', 'NMI', 'Sentence Splitting', 'Correlation',
 *                         'Linear Regression', 'Decision Tree Classifier', 'CSV'.
 * @param {String} theme - The theme for the Parson's problem.
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 * - {String} prompt - The question prompt for the Parson's problem.
 * - {Array<String>} correctBlocks - An array of strings representing the correct code blocks,
 *                                     ordered to solve the problem correctly.
 * - {Array<String>} scrambledBlocks - An array of strings representing the correct code blocks,
 *                                       but shuffled to provide a scrambled version of the solution.
 * 
 * @throws {Error} Throws an error if the topic is not one of the predefined values or if the
 *                  model generation or JSON parsing fails.
 */
exports.generateProblemViaGemini = async (topic, theme) => {

    // the query topic for the model to read
    let aiQueryTopic = '';
;
    switch (topic) {
        case 'DataFrame':
            aiQueryTopic += "Dataframes using Pandas";
            break;
        case 'NMI':
            aiQueryTopic += "Normalized Mutual Information (NMI) using scikit-learn";
            break;
        case 'Sentence Splitting':
            // aiQueryTopic += "Sentence splitting using nltk.sent_tokenize().";
            aiQueryTopic += "Sentence splitting";
            break;
        case 'Correlation':
            aiQueryTopic += "Correlations using Pandas.";
            break;
        case 'Linear Regression':
            aiQueryTopic += "Linear regression using Scikit-learn.";
            break;
        case 'Decision Tree Classifier':
            aiQueryTopic += "Decision tree classifiers using Scikit-learn.";
            break;
        case 'CSV':
            aiQueryTopic += "CSV files using pandas";
            break;
        default:
            throw new Error('Please select a prexisting topic');
    }

    // const doNotIncludeSpecials = 'Additionally, in the strings of the "codeBlocks" array, do not include formatting such as unecessary whitespaces preceeding bits of code and new line characters'

    // Construct the prompt based on the selected topic
    const aiQuestion = `Create a Parson's problem around the theme of ${theme} and the topic of ${aiQueryTopic}. The problem should ask the user to perform a task related to this theme in using the python blocks. Provide the correct code, split into blocks, ensuring the code logically aligns with the task. Format the response as a JSON object with two properties: "prompt": a string containing the question to be solved. "codeBlocks": an array of strings, where each string is a line of the correct code. Ensure the code blocks are ordered to solve the problem correctly and fit the theme. To be clear, the "codeBlocks" array strings should contain no newline characters at all.`;

    try {

        // Retrieves the gemini-pro model
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});

        // extract the response from gemini
        const result = await model.generateContent(aiQuestion);
        const geminiResponse = await result.response;

        // Basic formatting and removing code markers so the string (response.text) can be converted to JSON
        const problemJSON = JSON.parse(geminiResponse.text().replace(/```json|```|\*/g, ''));

        // Return the question prompt, scrambled blocks and solution
        return { 
            prompt: problemJSON['prompt'],
            correctBlocks: problemJSON['codeBlocks'],
            scrambledBlocks: [...problemJSON['codeBlocks']].sort(() => Math.random() - 0.5)
        }
    } catch (error) {

        // Pass error to createParsonProblem top level function
        throw error;
    }
};
