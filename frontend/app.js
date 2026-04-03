var app = angular.module('campusApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/admin', {
            templateUrl: 'views/admin.html',
            controller: 'AdminCtrl',
            resolve: {
                auth: ['$rootScope', '$location', '$q', function($rootScope, $location, $q) {
                    if($rootScope.userRole !== 'Admin') {
                        $location.path('/');
                        return $q.reject('Unauthorized');
                    }
                }]
            }
        })
        .when('/student', {
            templateUrl: 'views/student.html',
            controller: 'StudentCtrl',
            resolve: {
                auth: ['$rootScope', '$location', '$q', function($rootScope, $location, $q) {
                    if($rootScope.userRole !== 'Student') {
                        $location.path('/');
                        return $q.reject('Unauthorized');
                    }
                }]
            }
        })
        .when('/faculty', {
            templateUrl: 'views/faculty.html',
            controller: 'FacultyCtrl',
            resolve: {
                auth: ['$rootScope', '$location', '$q', function($rootScope, $location, $q) {
                    if($rootScope.userRole !== 'Faculty') {
                        $location.path('/');
                        return $q.reject('Unauthorized');
                    }
                }]
            }
        })
        .when('/executive', {
            templateUrl: 'views/executive.html',
            controller: 'ExecutiveCtrl',
            resolve: {
                auth: ['$rootScope', '$location', '$q', function($rootScope, $location, $q) {
                    if(['HOD', 'Dean', 'Associate Dean', 'Director'].indexOf($rootScope.userRole) === -1) {
                        $location.path('/');
                        return $q.reject('Unauthorized');
                    }
                }]
            }
        })
        .when('/librarian', {
            templateUrl: 'views/librarian.html',
            controller: 'LibrarianCtrl',
            resolve: {
                auth: ['$rootScope', '$location', '$q', function($rootScope, $location, $q) {
                    if($rootScope.userRole !== 'Librarian') {
                        $location.path('/');
                        return $q.reject('Unauthorized');
                    }
                }]
            }
        })
        .otherwise({
            redirectTo: '/'
        });
});

app.controller('MainController', function($scope, $rootScope, $location) {
    $rootScope.isLoggedIn = false;
    $rootScope.userId = null;
    $rootScope.userRole = null;

    $scope.logout = function() {
        $rootScope.isLoggedIn = false;
        $rootScope.userId = null;
        $rootScope.userRole = null;
        $location.path('/');
    };
});

app.controller('LoginCtrl', function($scope, $http, $rootScope, $location) {
    $scope.credentials = { user_id: '', password: '', role: 'Student' };
    $scope.errorMsg = '';

    $scope.login = function() {
        if ($scope.loginForm.$invalid) return;

        $http.post('/api/login', $scope.credentials)
            .then(function(res) {
                if (res.data.success) {
                    $rootScope.isLoggedIn = true;
                    $rootScope.userId = res.data.user.user_id;
                    $rootScope.userRole = res.data.user.role;
                    
                    if ($rootScope.userRole === 'Admin') $location.path('/admin');
                    else if ($rootScope.userRole === 'Student') $location.path('/student');
                    else if ($rootScope.userRole === 'Faculty') $location.path('/faculty');
                    else if (['HOD', 'Dean', 'Associate Dean', 'Director'].includes($rootScope.userRole)) $location.path('/executive');
                    else if ($rootScope.userRole === 'Librarian') $location.path('/librarian');
                }
            }, function(err) {
                $scope.errorMsg = (err.data && err.data.message) ? err.data.message : 'Login failed';
            });
    };
});

app.controller('AdminCtrl', function($scope, $http) {
    $scope.stats = {};
    $scope.students = [];
    $scope.newStudent = { hostel_id: null };
    $scope.complaints = [];

    // Load Stats
    $http.get('/api/stats').then(function(res) { $scope.stats = res.data; });
    
    // Load Students
    $scope.loadStudents = function() {
        $http.get('/api/students').then(function(res) { $scope.students = res.data; });
    };
    $scope.loadStudents();

    $scope.addStudent = function() {
        if ($scope.studentForm.$invalid) return;
        $http.post('/api/students', $scope.newStudent).then(function(res) {
            alert('Student added successfully');
            $scope.newStudent = { hostel_id: null };
            $scope.loadStudents();
            $scope.studentForm.$setPristine();
            $scope.studentForm.$setUntouched();
        });
    };

    $scope.deleteStudent = function(id) {
        if(confirm('Are you sure?')) {
            $http.delete('/api/students/' + id).then(function(res) {
                $scope.loadStudents();
            });
        }
    };

    // Load Complaints
    $scope.loadComplaints = function() {
        $http.get('/api/complaints').then(function(res) { $scope.complaints = res.data; });
    };
    $scope.loadComplaints();

    $scope.resolveComplaint = function(id) {
        $http.put('/api/complaints/' + id + '/resolve').then(function() {
            $scope.loadComplaints();
        });
    };
});

app.controller('StudentCtrl', function($scope, $http, $rootScope) {
    $scope.profile = {};
    $scope.attendance = [];
    $scope.marks = [];
    $scope.library = [];
    $scope.fees = [];
    $scope.assignments = [];
    $scope.availableCourses = [];
    $scope.uniqueFacultyList = [];
    $scope.complaintText = '';
    
    $scope.activeAssignment = null;
    $scope.submissionLink = '';
    $scope.enrollment = { course_id: '' };
    $scope.feedback = { faculty_id: '', rating: 5, text: '' };

    function initData() {
        $http.get('/api/student/' + $rootScope.userId).then(function(res) { $scope.profile = res.data; });
        $http.get('/api/student/' + $rootScope.userId + '/attendance').then(function(res) { $scope.attendance = res.data; });
        $http.get('/api/student/' + $rootScope.userId + '/marks').then(function(res) { $scope.marks = res.data; });
        $http.get('/api/student/' + $rootScope.userId + '/library').then(function(res) { $scope.library = res.data; });
        $http.get('/api/student/' + $rootScope.userId + '/assignments').then(function(res) { $scope.assignments = res.data; });
        $http.get('/api/courses').then(function(res) { 
            $scope.availableCourses = res.data; 
            // Extract unique faculty for feedback dropdown
            const fMap = {};
            res.data.forEach(c => {
                if(c.faculty_id && !fMap[c.faculty_id]) fMap[c.faculty_id] = { faculty_id: c.faculty_id, name: c.faculty_name };
            });
            $scope.uniqueFacultyList = Object.values(fMap);
        });
    }
    initData();

    $scope.submitComplaint = function() {
        if(!$scope.complaintText) return;
        $http.post('/api/student/complaint', { student_id: $rootScope.userId, complaint_text: $scope.complaintText })
        .then(function() {
            alert('Complaint submitted to higher authorities.');
            $scope.complaintText = '';
        });
    };

    $scope.submitAssignmentFlow = function(asn) {
        $scope.activeAssignment = asn;
        $scope.submissionLink = '';
    };

    $scope.postAssignment = function() {
        $http.post('/api/student/assignments/submit', {
            assignment_id: $scope.activeAssignment.assignment_id,
            student_id: $rootScope.userId,
            submission_link: $scope.submissionLink
        }).then(function() {
            alert('Assignment submitted successfully!');
            $scope.activeAssignment = null;
        });
    };

    $scope.enrollCourse = function() {
        if(!$scope.enrollment.course_id) return;
        // Mock enrollment process: creates an absent entry in attendance database as an enrollment tracker placeholder
        $http.post('/api/faculty/attendance', {
            student_id: $rootScope.userId,
            course_id: $scope.enrollment.course_id,
            status: 'Absent',
            semester: 1
        }).then(function() {
            alert('Enrollment requested successfully.');
            $scope.enrollment.course_id = '';
            initData(); // Refresh UI
        });
    };

    $scope.submitFeedback = function() {
        if(!$scope.feedback.faculty_id || !$scope.feedback.text) return;
        $http.post('/api/student/feedback', {
            student_id: $rootScope.userId,
            faculty_id: $scope.feedback.faculty_id,
            feedback_text: $scope.feedback.text,
            rating: $scope.feedback.rating
        }).then(function() {
            alert('Anonymous Feedback recorded for AI analysis.');
            $scope.feedback = { faculty_id: '', rating: 5, text: '' };
        });
    };
});


app.controller('FacultyCtrl', function($scope, $http, $rootScope) {
    $scope.courses = [];
    $scope.attRecord = {};
    $scope.markRecord = {};
    $scope.newAssignment = {};

    $http.get('/api/faculty/' + $rootScope.userId + '/courses').then(function(res) {
        $scope.courses = res.data;
    });

    $scope.createAssignment = function() {
        if ($scope.assignmentForm.$invalid) return;
        $http.post('/api/faculty/assignments', $scope.newAssignment).then(function() {
            alert('Assignment Deployed to Student Dashboards Successfully!');
            $scope.newAssignment = {};
            $scope.assignmentForm.$setPristine();
            $scope.assignmentForm.$setUntouched();
        });
    };

    $scope.markAttendance = function() {
        if ($scope.attendanceForm.$invalid) return;
        $scope.attRecord.semester = 1; // Defaulting
        $http.post('/api/faculty/attendance', $scope.attRecord).then(function() {
            alert('Attendance marked!');
            $scope.attRecord = {};
            $scope.attendanceForm.$setPristine();
            $scope.attendanceForm.$setUntouched();
        });
    };

    $scope.enterMarks = function() {
        if ($scope.marksForm.$invalid) return;
        $http.post('/api/faculty/marks', $scope.markRecord).then(function() {
            alert('Marks Entered!');
            $scope.markRecord = {};
            $scope.marksForm.$setPristine();
            $scope.marksForm.$setUntouched();
        });
    };
});

app.controller('ExecutiveCtrl', function($scope, $http, $rootScope) {
    $scope.campusStats = {};
    $scope.title = $rootScope.userRole + ' Dashboard - NMIMS Shirpur';
    $http.get('/api/stats').then(function(res) { $scope.campusStats = res.data; });
});

app.controller('LibrarianCtrl', function($scope, $http, $rootScope) {
    $scope.library = [];
    $scope.title = 'Library Management - NMIMS Shirpur';
});
