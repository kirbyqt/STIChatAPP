const moment = require('moment');

function formatMessage(username, text) {
    return {
        username,
        text,
        time: moment().format('h:mm a')  // Formats time as '12:30 pm'
    };
}

module.exports = formatMessage;  // Export the correct function name
