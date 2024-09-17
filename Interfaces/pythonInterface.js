const tmp = require('tmp');
const fs = require('fs');
const { exec } = require('child_process');

module.exports = handleTempFile = async (code) => {

    const command = 'flake8 temp_code.py'; 

    let result = {}

    // Format for testing temp files
    exec(command, (err, stdout, stderr) => {
      
        // Always log stdout and stderr
        if (err) {
            console.log(err);
        }

        if (stdout) {
            console.log('stdout:', stdout);
        }
        
        // Std error is null always it seems
        // Maybe don't need to include
        if (stderr) {
            console.error('stderr:', stderr);
        }

        result = {
            stdout: stdout || null,
            stderr: stderr || null,
            err: err || null
        }

        console.log(result);
    });
}