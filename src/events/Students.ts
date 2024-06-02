import pool from '../database';

function parseStudents(studentsInput: string) {
    const students = studentsInput.split(',').map(student => student.trim());
    return students.map(student => {
        const [fullName, personalCode] = student.split(':');
        const names = fullName.split(' ');
        let lastName = names.pop();
        let name = names.join('-');
        return { name, lastName, personalCode };
    });
}

export async function addStudentsToDB(group: string, roleID: string, studentsInput: string) {
    const students = parseStudents(studentsInput);
    for (const student of students) {
        const { name, lastName, personalCode } = student;
        // Trigger the check using the imported function
        const exists = await checkStudentExists(personalCode);
        if (!exists) {
            await pool.query(
                'INSERT INTO students (name, lastName, personalCode, groupName, roleId) VALUES (?, ?, ?, ?, ?)',
                [name, lastName, personalCode, group, roleID]
            );
        } else {
            console.log(`Student ${name} already exists.`);
        }
    }
}

export async function checkStudentExists(personalCode: string): Promise<boolean> {
    try {
        const student = await findStudentByName(personalCode);
        return student !== undefined;
    } catch (error) {
        console.error('Error checking if student exists:', error);
        throw error;
    }
}

export async function findStudentByName(personalCode: string) {
    try {
        const [rows] = await pool.query('SELECT * FROM students WHERE personalCode = ?', [personalCode]);
        if (!rows || rows.length === 0) {
            console.log(`No student found with personalCode: ${personalCode}`);
            return undefined;
        }
        return rows[0];
    } catch (error) {
        console.error('Error finding student:', error);
        throw error;
    }
}
//make exrpot that will return data
export const data = {
    firstname: '',
    lastname: '',
    grupe: '',
    roleID: '',
}




