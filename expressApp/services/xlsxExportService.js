const {BaseExportService} = require('./baseExportService')
const dateFormat = require("dateformat");

const xl = require('excel4node');
class XLSXExportService extends BaseExportService {

    constructor() {
        super('xlsx');
    }

    export(data, res) {
        data.forEach( event => {
            let evenStartDate = dateFormat(new Date(event.startDate), "mm-dd-yyyy");
            let outputFile = super.getOutputFilePath(event.name + "_" + evenStartDate); 
            let membersAttendance = event.membersAttendance; 
            let wb = new xl.Workbook();
            let ws = wb.addWorksheet('events'); 
            this.createHeaders(ws);
            this.createCells(ws,membersAttendance);
            wb.write(outputFile, res);
        })
    }

    createHeaders(ws){
        let headingColumnIndex = 1;
        ws.cell(1, headingColumnIndex++).string("Member Name");
        ws.cell(1, headingColumnIndex++).string("Time-In");
        ws.cell(1, headingColumnIndex).string("Time-Out");
    }

    createCells(ws,membersAttendance){
        let rowIndex = 2;
        membersAttendance.forEach( attendance => {
            let columnIndex = 1;
            ws.cell(rowIndex,columnIndex++)
            .string(attendance.member.name);
            ws.cell(rowIndex,columnIndex++)
            .string(attendance.timeIn);
            ws.cell(rowIndex++,columnIndex++)
            .string(attendance.timeOut);
        })
    }
}

exports.XLSXExportService = XLSXExportService;