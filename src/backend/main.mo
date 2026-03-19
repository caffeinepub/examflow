import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";

actor {
  public type Student = {
    username : Text;
    password : Text;
    name : Text;
  };

  public type Exam = {
    title : Text;
    description : Text;
    durationMinutes : Nat;
  };

  public type Question = {
    questionText : Text;
    options : [Text];
    correctAnswer : Nat;
  };

  public type StudentResult = {
    studentName : Text;
    examTitle : Text;
    score : Nat;
    totalQuestions : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // State
  let studentsMap = Map.empty<Text, Student>();
  let exams = List.empty<Exam>();
  let questionsMap = Map.empty<Text, List.List<Question>>();
  let results = List.empty<StudentResult>();

  // Kept for upgrade compatibility with previous version
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  // Student Registration
  public shared func registerStudent(username : Text, password : Text, name : Text) : async () {
    if (studentsMap.containsKey(username)) {
      Runtime.trap("Username already exists");
    };
    let student : Student = { username; password; name };
    studentsMap.add(username, student);
  };

  // Student Login
  public shared func studentLogin(username : Text, password : Text) : async Bool {
    switch (studentsMap.get(username)) {
      case (null) { false };
      case (?student) { student.password == password };
    };
  };

  // Instructor/Admin Login
  public shared func instructorLogin(username : Text, password : Text) : async Bool {
    username == "instructor" and password == "head2468";
  };

  // Create Exam
  public shared func createExam(title : Text, description : Text, durationMinutes : Nat) : async () {
    if (title == "") {
      Runtime.trap("Exam title cannot be empty");
    };
    let exam : Exam = { title; description; durationMinutes };
    exams.add(exam);
    if (not questionsMap.containsKey(title)) {
      questionsMap.add(title, List.empty<Question>());
    };
  };

  // Add Question
  public shared func addQuestion(examTitle : Text, questionText : Text, options : [Text], correctAnswer : Nat) : async () {
    if (options.size() != 4) {
      Runtime.trap("There must be exactly four options");
    };
    let question : Question = { questionText; options; correctAnswer };
    switch (questionsMap.get(examTitle)) {
      case (null) { Runtime.trap("Exam does not exist") };
      case (?questionList) { questionList.add(question) };
    };
  };

  // Submit Exam
  public shared func submitExam(studentName : Text, examTitle : Text, answers : [Nat]) : async Nat {
    let questionList = switch (questionsMap.get(examTitle)) {
      case (null) { Runtime.trap("Exam does not exist") };
      case (?questions) { questions };
    };
    let questionsArray = questionList.values().toArray();
    if (questionsArray.size() != answers.size()) {
      Runtime.trap("Number of answers does not match number of questions");
    };
    var score = 0;
    let size = questionsArray.size();
    var i = 0;
    while (i < size) {
      if (answers[i] == questionsArray[i].correctAnswer) {
        score += 1;
      };
      i += 1;
    };
    let result : StudentResult = {
      studentName;
      examTitle;
      score;
      totalQuestions = questionsArray.size();
    };
    results.add(result);
    score;
  };

  // Get All Results
  public query func getAllResults() : async [StudentResult] {
    results.values().toArray();
  };

  // Get Exams
  public query func getExams() : async [Exam] {
    exams.toArray();
  };

  // Get Questions for an Exam
  public query func getExamQuestions(examTitle : Text) : async [Question] {
    switch (questionsMap.get(examTitle)) {
      case (null) { [] };
      case (?questions) { questions.toArray() };
    };
  };
};
