# Entity-Relationship (ER) Diagram & Relational Model

## ER Diagram Entities & Attributes
1. **Students**: student_id (PK), name, email, phone, department, year, hostel_id (FK)
2. **Faculty**: faculty_id (PK), name, email, department, designation, phone
3. **Courses**: course_id (PK), course_name, credits, faculty_id (FK), department
4. **Attendance**: attendance_id (PK), student_id (FK), course_id (FK), date, status, semester
5. **Marks/Grades**: mark_id (PK), student_id (FK), course_id (FK), internal_marks, external_marks, total_marks, grade
6. **Library**: book_id (PK), title, author, student_id (FK), issue_date, return_date, status
7. **Hostel**: hostel_id (PK), hostel_name, room_number, fees_status
8. **Events**: event_id (PK), event_name, date, venue, description, organized_by (FK)
9. **Complaints**: complaint_id (PK), student_id (FK), complaint_text, status, date_submitted
10. **FeePayment**: payment_id (PK), student_id (FK), amount, payment_date, semester, payment_status
11. **Users**: user_id (PK), password_hash, role (ENUM: Student, Faculty, Admin, HOD, Dean, Director, Librarian)

## Relationships
- **Student-Hostel** (Many-to-One): Many students can stay in one hostel. 
- **Faculty-Course** (One-to-Many): One faculty member can teach multiple courses.
- **Student-Course** (Many-to-Many): Implemented through bridging tables `Attendance` and `Marks`.
- **Student-Library** (One-to-Many): One student can borrow multiple books.
- **Faculty-Event** (One-to-Many): One faculty organizes many events.
- **Student-Complaint** (One-to-Many): One student can file multiple complaints.
- **Student-FeePayment** (One-to-Many): One student can make multiple fee payments.

## Mermaid ER Diagram Representation

```mermaid
erDiagram
    Students ||--o{ Complaints : files
    Students ||--o{ FeePayment : makes
    Students ||--o{ Attendance : has
    Students ||--o{ Marks : receives
    Students ||--o{ Library : borrows
    Students }o--|| Hostel : stays_in
    Faculty ||--o{ Courses : teaches
    Faculty ||--o{ Events : organizes
    Courses ||--o{ Attendance : recorded_for
    Courses ||--o{ Marks : assigned_for

    Students {
        string student_id PK
        string name
        string email
        string phone
        string department
        int year
        string hostel_id FK
    }
    Faculty {
        string faculty_id PK
        string name
        string email
        string department
        string designation
        string phone
    }
    Courses {
        string course_id PK
        string course_name
        int credits
        string faculty_id FK
        string department
    }
    Attendance {
        int attendance_id PK
        string student_id FK
        string course_id FK
        date date
        string status
        int semester
    }
    Marks {
        int mark_id PK
        string student_id FK
        string course_id FK
        decimal internal_marks
        decimal external_marks
        decimal total_marks
        string grade
    }
    Library {
        string book_id PK
        string title
        string author
        string student_id FK
        date issue_date
        date return_date
        string status
    }
    Hostel {
        string hostel_id PK
        string hostel_name
        string room_number
        string fees_status
    }
    Events {
        string event_id PK
        string event_name
        date date
        string venue
        string description
        string organized_by FK
    }
    Complaints {
        int complaint_id PK
        string student_id FK
        string complaint_text
        string status
        date date_submitted
    }
    FeePayment {
        int payment_id PK
        string student_id FK
        decimal amount
        date payment_date
        int semester
        string payment_status
    }
    Users {
        string user_id PK
        string password_hash
        string role
    }
```

## Relational Model Schema

- **Hostel** (hostel_id, hostel_name, room_number, fees_status)
- **Students** (student_id, name, email, phone, department, year, hostel_id)
- **Faculty** (faculty_id, name, email, department, designation, phone)
- **Courses** (course_id, course_name, credits, faculty_id, department)
- **Attendance** (attendance_id, student_id, course_id, date, status, semester)
- **Marks** (mark_id, student_id, course_id, internal_marks, external_marks, total_marks, grade)
- **Library** (book_id, title, author, student_id, issue_date, return_date, status)
- **Events** (event_id, event_name, date, venue, description, organized_by)
- **Complaints** (complaint_id, student_id, complaint_text, status, date_submitted)
- **FeePayment** (payment_id, student_id, amount, payment_date, semester, payment_status)
- **Users** (user_id, password_hash, role)
