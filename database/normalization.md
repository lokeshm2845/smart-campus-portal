# Database Normalization Document

## Unnormalized Form (UNF)
In the initial unnormalized form, a conceptual table might have repeating groups. For example, a theoretical `Student Report` might look like:
`Student_Report(student_id, SName, SEmail, SPhone, SDepartment, {Course_ID, Course_Name, Credits, Faculty_Name, Attendance_Status, Internal_Marks, External_Marks, Total_Marks, Grade})`
This contains multiple repeating values for courses, attendance, and marks.

## First Normal Form (1NF)
**Rule**: Remove repeating groups. Every attribute must be atomic.
**Action**: We split the data into separate tables to ensure no lists or arrays exist in any column.
**Resulting tables**:
- `Students` (student_id, name, email, phone, department, year, hostel_id, hostel_name, room_number)
- `Faculty` (faculty_id, name, email, department, designation, phone)
- `Courses` (course_id, course_name, credits, faculty_id)
- `Student_Performance` (student_id, course_id, attendance_date, attendance_status, internal_marks, external_marks, total_marks, grade)
- `Users` (user_id, password_hash, role)

## Second Normal Form (2NF)
**Rule**: Must be in 1NF and have no partial dependencies (non-key attributes depend on the WHOLE primary key).
**Action**: Evaluate tables with composite primary keys. `Student_Performance` has a composite key of `(student_id, course_id, attendance_date)` for attendance and `(student_id, course_id)` for marks.
**Splitting Student_Performance**:
- `Attendance` (attendance_id (surrogate), student_id, course_id, date, status, semester) 
- `Marks` (mark_id (surrogate), student_id, course_id, internal_marks, external_marks, total_marks, grade)
Now, all non-key attributes fully depend on their respective primary keys.

## Third Normal Form (3NF)
**Rule**: Must be in 2NF and have no transitive dependencies (non-key attributes depending on other non-key attributes).
**Action**: Evaluate the `Students` table from 1NF.
`Students (student_id, name, email, phone, department, year, hostel_id, hostel_name, room_number)`
Here, `hostel_name` and `room_number` depend on `hostel_id`, not `student_id`. This is a transitive dependency!
**Splitting Students**:
- `Students` (student_id, name, email, phone, department, year, hostel_id)
- `Hostel` (hostel_id, hostel_name, room_number, fees_status)
This ensures every column is directly dependent on the primary key, the whole primary key, and nothing but the primary key.

## Boyce-Codd Normal Form (BCNF)
**Rule**: For every non-trivial functional dependency X -> Y, X must be a superkey.
**Verification**: 
Looking at our final schema:
- In `Students`, `student_id -> {name, email, ...}`. `student_id` is a superkey.
- In `Hostel`, `hostel_id -> {hostel_name, room_number...}`.
- In `Courses`, `course_id -> {course_name, credits, faculty_id}`.
- In `Faculty`, `faculty_id -> {name, email...}`.
Are there any overlaps? What if a faculty teaches only one department, and course depends on faculty, but course also has a department?
In `Courses` (course_id, course_name, credits, faculty_id, department): 
If `faculty_id -> department` but `faculty_id` is not a superkey in `Courses`. However, in our design, a course belongs to a department, and the faculty teaching it might be from the same or different department.
- In `Users`, `user_id -> {password_hash, role}` and `user_id` is a superkey.
Because every determinant is a candidate key, our schema satisfies BCNF.

## Conclusion
The provided database schema is fully normalized up to BCNF, eliminating data anomalies (insertion, deletion, and update anomalies) and ensuring structural integrity.
