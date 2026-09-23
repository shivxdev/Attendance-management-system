const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

// ==========================================
// EXCEL FILE LOCATION
// ==========================================

const excelFolder = path.join(
    __dirname,
    "..",
    "excel"
);

const excelFile = path.join(
    excelFolder,
    "Attendance.xlsx"
);


// ==========================================
// CREATE EXCEL FOLDER
// ==========================================

if (!fs.existsSync(excelFolder)) {

    fs.mkdirSync(
        excelFolder,
        {
            recursive: true
        }
    );

}


// ==========================================
// GET WORKBOOK
// ==========================================

async function getWorkbook() {

    const workbook =
        new ExcelJS.Workbook();

    if (fs.existsSync(excelFile)) {

        await workbook.xlsx.readFile(
            excelFile
        );

    }

    return workbook;

}


// ==========================================
// SAVE WORKBOOK
// ==========================================

async function saveWorkbook(
    workbook
) {

    await workbook.xlsx.writeFile(
        excelFile
    );

}


// ==========================================
// CREATE / GET CLASS + SUBJECT SHEET
// ==========================================

function getOrCreateSheet(
    workbook,
    classId,
    subjectCode
) {

    let sheetName =
        `${classId}_${subjectCode}`;

    // Excel sheet name max = 31 characters

    sheetName =
        sheetName.substring(
            0,
            31
        );


    let worksheet =
        workbook.getWorksheet(
            sheetName
        );


    if (!worksheet) {

        worksheet =
            workbook.addWorksheet(
                sheetName
            );


        worksheet.columns = [

            {
                header:
                    "University Roll No",

                key:
                    "roll_no",

                width:
                    22
            },

            {
                header:
                    "Student Name",

                key:
                    "student_name",

                width:
                    25
            }

        ];

    }


    return worksheet;

}


// ==========================================
// FIND / CREATE DATE COLUMN
// ==========================================

function getDateColumn(
    worksheet,
    date
) {

    // Check existing columns

    for (
        let column = 3;
        column <= worksheet.columnCount;
        column++
    ) {

        const value =
            worksheet.getCell(
                1,
                column
            ).value;


        if (
            String(value) ===
            String(date)
        ) {

            return column;

        }

    }


    // Create new date column

    const newColumn =
        worksheet.columnCount + 1;


    worksheet.getCell(
        1,
        newColumn
    ).value =
        date;


    worksheet.getColumn(
        newColumn
    ).width =
        15;


    return newColumn;

}


// ==========================================
// FIND STUDENT ROW
// ==========================================

function findStudentRow(
    worksheet,
    rollNo
) {

    for (
        let row = 2;
        row <= worksheet.rowCount;
        row++
    ) {

        const existingRoll =
            worksheet.getCell(
                row,
                1
            ).value;


        if (
            String(existingRoll) ===
            String(rollNo)
        ) {

            return row;

        }

    }


    return null;

}


// ==========================================
// UPDATE ATTENDANCE EXCEL
// ==========================================

async function updateAttendanceExcel({

    classId,

    subjectCode,

    subjectName,

    date,

    students

}) {

    try {

        const workbook =
            await getWorkbook();


        const worksheet =
            getOrCreateSheet(
                workbook,
                classId,
                subjectCode
            );


        // ======================================
        // DATE COLUMN
        // ======================================

        const dateColumn =
            getDateColumn(
                worksheet,
                date
            );


        // ======================================
        // STUDENT DATA
        // ======================================

        for (
            const student
            of students
        ) {

            const rollNo =
                String(
                    student.university_roll_no
                );


            const studentName =
                student.student_name ||
                "";


            // Find existing student

            let studentRow =
                findStudentRow(
                    worksheet,
                    rollNo
                );


            // ==================================
            // CREATE NEW STUDENT
            // ==================================

            if (!studentRow) {

                studentRow =
                    worksheet.rowCount + 1;


                worksheet.getCell(
                    studentRow,
                    1
                ).value =
                    rollNo;


                worksheet.getCell(
                    studentRow,
                    2
                ).value =
                    studentName;

            }


            // ==================================
            // UPDATE NAME
            // ==================================

            worksheet.getCell(
                studentRow,
                2
            ).value =
                studentName;


            // ==================================
            // UPDATE ATTENDANCE
            // ==================================

            worksheet.getCell(
                studentRow,
                dateColumn
            ).value =
                student.status;

        }


        // ======================================
        // SAVE
        // ======================================

        await saveWorkbook(
            workbook
        );


        console.log(
            "=========================================="
        );

        console.log(
            "✅ EXCEL ATTENDANCE UPDATED"
        );

        console.log(
            "Class:",
            classId
        );

        console.log(
            "Subject:",
            subjectCode
        );

        console.log(
            "Date:",
            date
        );

        console.log(
            "File:",
            excelFile
        );

        console.log(
            "=========================================="
        );


        return {

            success: true,

            file:
                excelFile

        };

    } catch (error) {

        console.error(
            "❌ Excel attendance update error:",
            error
        );

        throw error;

    }

}


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    updateAttendanceExcel

};