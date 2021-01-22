const path = require('path');

class BaseExportService {
    
    constructor(fileExtension) {
        this.fileExtension = fileExtension;
    }

    getOutputFilePath(fileName) {
        // const outputsFolder = path.join(__dirname, 'outputs');
        // return `${outputsFolder}/${fileName}.${this.fileExtension}`;
        return `${fileName}.${this.fileExtension}`;
    }
}

exports.BaseExportService = BaseExportService;

