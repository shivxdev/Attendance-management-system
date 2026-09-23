-- =========================================
-- ATTENDANCE MANAGEMENT SYSTEM
-- DATABASE SCHEMA
-- =========================================

CREATE DATABASE IF NOT EXISTS attendance_management;

USE attendance_management;


-- =========================================
-- 1. USERS TABLE
-- =========================================

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,

    password VARCHAR(255) NOT NULL,

    role ENUM('student', 'teacher', 'admin') NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 2. STUDENTS TABLE
-- =========================================

CREATE TABLE students (

    student_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE,

    university_roll_no VARCHAR(30) UNIQUE NOT NULL,

    student_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(15),

    year INT NOT NULL,

    branch VARCHAR(50) NOT NULL,

    section VARCHAR(20) NOT NULL,

    semester INT NOT NULL,

    class_id VARCHAR(50) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================
-- 3. TEACHERS TABLE
-- =========================================

CREATE TABLE teachers (

    teacher_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE,

    teacher_code VARCHAR(30) UNIQUE NOT NULL,

    teacher_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(15),

    department VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================
-- 4. ADMINS TABLE
-- =========================================

CREATE TABLE admins (

    admin_id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNIQUE,

    admin_code VARCHAR(30) UNIQUE NOT NULL,

    admin_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================================
-- 5. CLASSES TABLE
-- =========================================

CREATE TABLE classes (

    class_id VARCHAR(50) PRIMARY KEY,

    year INT NOT NULL,

    branch VARCHAR(50) NOT NULL,

    section VARCHAR(20) NOT NULL,

    semester INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 6. SUBJECTS TABLE
-- =========================================

CREATE TABLE subjects (

    subject_id INT AUTO_INCREMENT PRIMARY KEY,

    subject_code VARCHAR(30) UNIQUE NOT NULL,

    subject_name VARCHAR(100) NOT NULL,

    semester INT NOT NULL,

    department VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 7. CLASS-SUBJECT ASSIGNMENT
-- =========================================

CREATE TABLE class_subjects (

    id INT AUTO_INCREMENT PRIMARY KEY,

    class_id VARCHAR(50) NOT NULL,

    subject_id INT NOT NULL,

    teacher_id INT,

    FOREIGN KEY (class_id)
        REFERENCES classes(class_id)
        ON DELETE CASCADE,

    FOREIGN KEY (subject_id)
        REFERENCES subjects(subject_id)
        ON DELETE CASCADE,

    FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON DELETE SET NULL
);


-- =========================================
-- 8. ATTENDANCE LECTURES
-- =========================================

CREATE TABLE lectures (

    lecture_id INT AUTO_INCREMENT PRIMARY KEY,

    class_id VARCHAR(50) NOT NULL,

    subject_id INT NOT NULL,

    teacher_id INT,

    lecture_date DATE NOT NULL,

    lecture_number INT NOT NULL,

    status ENUM('conducted', 'cancelled', 'holiday')
        DEFAULT 'conducted',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (class_id)
        REFERENCES classes(class_id),

    FOREIGN KEY (subject_id)
        REFERENCES subjects(subject_id),

    FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
);


-- =========================================
-- 9. ATTENDANCE RECORDS
-- =========================================

CREATE TABLE attendance (

    attendance_id INT AUTO_INCREMENT PRIMARY KEY,

    lecture_id INT NOT NULL,

    student_id INT NOT NULL,

    attendance_status ENUM('P', 'A')
        NOT NULL,

    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (
        lecture_id,
        student_id
    ),

    FOREIGN KEY (lecture_id)
        REFERENCES lectures(lecture_id)
        ON DELETE CASCADE,

    FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE
);