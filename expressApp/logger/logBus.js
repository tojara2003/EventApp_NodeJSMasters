const EventEmitter = require('events');
const fs = require('fs');
const emitter = new EventEmitter();

emitter.on('log', function (req) {
    const currentDateTime = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    const filename = `AttendanceMonitoringLogs-[${new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate()}].txt`;
    const contents = `LOG timestamp: ${currentDateTime}; Endpoint: ${req.url}; ReqParams: ${JSON.stringify(req.params)}; ReqQuery: ${JSON.stringify(req.query)}; ReqBody: ${JSON.stringify(req.body)}\n`;
    fs.appendFile(filename, contents, () => {
        console.log(contents);
    });
});

module.exports = emitter;