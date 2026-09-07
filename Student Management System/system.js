// ==========================================
// Student Management System
// ==========================================

let students = JSON.parse(localStorage.getItem("students")) || [];
let editingStudentId = null;


// ==========================================
// DOM Elements
// ==========================================

const studentName = document.getElementById("studentName");
const rollNo = document.getElementById("rollNo");
const course = document.getElementById("course");
const marks = document.getElementById("marks");

const addStudentBtn = document.getElementById("addStudentBtn");

const searchInput = document.getElementById("searchInput");
const studentTableBody = document.getElementById("studentTableBody");
const emptyMessage = document.getElementById("emptyMessage");

const totalStudents = document.getElementById("totalStudents");
const averageMarks = document.getElementById("averageMarks");


// ==========================================
// Get Grade
// ==========================================

function getGrade(mark) {

    mark = Number(mark);

    if (mark >= 90) {
        return "A+";
    } else if (mark >= 80) {
        return "A";
    } else if (mark >= 70) {
        return "B+";
    } else if (mark >= 60) {
        return "B";
    } else if (mark >= 50) {
        return "C+";
    } else if (mark >= 40) {
        return "C";
    } else {
        return "F";
    }
}


// ==========================================
// Grade CSS Class
// ==========================================

function getGradeClass(grade) {

    switch (grade) {

        case "A+":
            return "grade-a-plus";

        case "A":
            return "grade-a";

        case "B+":
            return "grade-b-plus";

        case "B":
            return "grade-b";

        case "C+":
            return "grade-c-plus";

        case "C":
            return "grade-c";

        default:
            return "grade-f";
    }
}


// ==========================================
// Add / Update Student
// ==========================================

addStudentBtn.addEventListener("click", function () {

    const name = studentName.value.trim();
    const roll = rollNo.value.trim();
    const selectedCourse = course.value;
    const studentMarks = Number(marks.value);

    // Validation

    if (!name || !roll || !selectedCourse || marks.value === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (studentMarks < 0 || studentMarks > 100) {
        alert("Marks must be between 0 and 100.");
        return;
    }


    // Check duplicate roll number when adding

    const duplicateRoll = students.some(student =>
        student.rollNo.toLowerCase() === roll.toLowerCase() &&
        student.id !== editingStudentId
    );

    if (duplicateRoll) {
        alert("A student with this roll number already exists.");
        return;
    }


    // Editing existing student

    if (editingStudentId !== null) {

        const student = students.find(
            student => student.id === editingStudentId
        );

        if (student) {
            student.name = name;
            student.rollNo = roll;
            student.course = selectedCourse;
            student.marks = studentMarks;
        }

        editingStudentId = null;
        addStudentBtn.textContent = "Add Student";

    }

    // Adding new student

    else {

        const newStudent = {
            id: Date.now(),
            name: name,
            rollNo: roll,
            course: selectedCourse,
            marks: studentMarks
        };

        students.push(newStudent);
    }


    saveStudents();
    clearForm();
    displayStudents();

});


// ==========================================
// Display Students
// ==========================================

function displayStudents() {

    const searchTerm = searchInput.value.trim().toLowerCase();

    studentTableBody.innerHTML = "";

    const filteredStudents = students.filter(student => {

        return (
            student.name.toLowerCase().includes(searchTerm) ||
            student.rollNo.toLowerCase().includes(searchTerm)
        );

    });


    // Empty table

    if (filteredStudents.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }


    // Create rows

    filteredStudents.forEach(student => {

        const row = document.createElement("tr");

        const grade = getGrade(student.marks);
        const gradeClass = getGradeClass(grade);

        row.innerHTML = `
            <td>${escapeHTML(student.rollNo)}</td>

            <td>${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.course)}</td>

            <td>${student.marks}</td>

            <td>
                <span class="grade ${gradeClass}">
                    ${grade}
                </span>
            </td>

            <td>
                <button
                    class="edit-btn"
                    onclick="editStudent(${student.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudent(${student.id})"
                >
                    Delete
                </button>
            </td>
        `;

        studentTableBody.appendChild(row);
    });


    updateStatistics();
}


// ==========================================
// Edit Student
// ==========================================

function editStudent(id) {

    const student = students.find(student => student.id === id);

    if (!student) {
        return;
    }

    studentName.value = student.name;
    rollNo.value = student.rollNo;
    course.value = student.course;
    marks.value = student.marks;

    editingStudentId = id;

    addStudentBtn.textContent = "Update Student";

    // Scroll to form

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==========================================
// Delete Student
// ==========================================

function deleteStudent(id) {

    const student = students.find(student => student.id === id);

    if (!student) {
        return;
    }

    const confirmDelete = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmDelete) {
        return;
    }

    students = students.filter(student => student.id !== id);

    saveStudents();

    displayStudents();
}


// ==========================================
// Search
// ==========================================

searchInput.addEventListener("input", function () {
    displayStudents();
});


// ==========================================
// Statistics
// ==========================================

function updateStatistics() {

    totalStudents.textContent = students.length;

    if (students.length === 0) {
        averageMarks.textContent = "0";
        return;
    }

    const totalMarks = students.reduce(
        (total, student) => total + Number(student.marks),
        0
    );

    const average = totalMarks / students.length;

    averageMarks.textContent = average.toFixed(2);
}


// ==========================================
// Save to Local Storage
// ==========================================

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );
}


// ==========================================
// Clear Form
// ==========================================

function clearForm() {

    studentName.value = "";
    rollNo.value = "";
    course.value = "";
    marks.value = "";

    editingStudentId = null;

    addStudentBtn.textContent = "Add Student";

    studentName.focus();
}


// ==========================================
// Prevent HTML Injection
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// Initial Load
// ==========================================

displayStudents();
