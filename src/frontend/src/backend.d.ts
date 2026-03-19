export interface Exam {
    title: string;
    description: string;
    durationMinutes: bigint;
}
export interface Question {
    correctAnswer: bigint;
    questionText: string;
    options: Array<string>;
}
export interface StudentResult {
    examTitle: string;
    studentName: string;
    score: bigint;
    totalQuestions: bigint;
}
export interface backendInterface {
    addQuestion(examTitle: string, questionText: string, options: Array<string>, correctAnswer: bigint): Promise<void>;
    createExam(title: string, description: string, durationMinutes: bigint): Promise<void>;
    getAllResults(): Promise<Array<StudentResult>>;
    getExamQuestions(examTitle: string): Promise<Array<Question>>;
    getExams(): Promise<Array<Exam>>;
    instructorLogin(username: string, password: string): Promise<boolean>;
    registerStudent(username: string, password: string, name: string): Promise<void>;
    studentLogin(username: string, password: string): Promise<boolean>;
    submitExam(studentName: string, examTitle: string, answers: Array<bigint>): Promise<bigint>;
}
