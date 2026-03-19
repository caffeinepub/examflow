import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  ListChecks,
  Loader2,
  LogOut,
  Plus,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Exam, Question, StudentResult } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  onLogout: () => void;
}

type Tab = "create-exam" | "add-questions" | "results";

export default function AdminDashboard({ onLogout }: Props) {
  const { actor } = useActor();
  const [activeTab, setActiveTab] = useState<Tab>("create-exam");

  // Create Exam
  const [examTitle, setExamTitle] = useState("");
  const [examDesc, setExamDesc] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [examLoading, setExamLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // Add Questions
  const [selectedExam, setSelectedExam] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Results
  const [results, setResults] = useState<StudentResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const loadExams = useCallback(async () => {
    if (!actor) return;
    setExamsLoading(true);
    try {
      const list = await actor.getExams();
      setExams(list);
    } catch {
      toast.error("Failed to load exams.");
    } finally {
      setExamsLoading(false);
    }
  }, [actor]);

  const loadResults = useCallback(async () => {
    if (!actor) return;
    setResultsLoading(true);
    try {
      const list = await actor.getAllResults();
      setResults(list);
    } catch {
      toast.error("Failed to load results.");
    } finally {
      setResultsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  useEffect(() => {
    if (activeTab === "results") loadResults();
  }, [activeTab, loadResults]);

  const loadQuestionsForExam = async (title: string) => {
    if (!title) return;
    setQuestionsLoading(true);
    try {
      if (!actor) return;
      const list = await actor.getExamQuestions(title);
      setQuestions(list);
    } catch {
      toast.error("Failed to load questions.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSelectExam = (val: string) => {
    setSelectedExam(val);
    loadQuestionsForExam(val);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim() || !examDesc.trim() || !examDuration.trim()) {
      toast.error("Please fill in all exam fields.");
      return;
    }
    const duration = Number.parseInt(examDuration, 10);
    if (Number.isNaN(duration) || duration < 1) {
      toast.error("Duration must be a positive number.");
      return;
    }
    setExamLoading(true);
    try {
      if (!actor) {
        toast.error("Service unavailable.");
        return;
      }
      await actor.createExam(
        examTitle.trim(),
        examDesc.trim(),
        BigInt(duration),
      );
      toast.success(`Exam "${examTitle}" created successfully!`);
      setExamTitle("");
      setExamDesc("");
      setExamDuration("");
      await loadExams();
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("already") || msg.includes("exists")) {
        toast.error("An exam with this title already exists.");
      } else {
        toast.error("Failed to create exam. Please try again.");
      }
    } finally {
      setExamLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) {
      toast.error("Please select an exam first.");
      return;
    }
    if (
      !questionText.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim()
    ) {
      toast.error("Please fill in the question and all options.");
      return;
    }
    if (correctAnswer === "") {
      toast.error("Please select the correct answer.");
      return;
    }
    setQuestionLoading(true);
    try {
      if (!actor) {
        toast.error("Service unavailable.");
        return;
      }
      await actor.addQuestion(
        selectedExam,
        questionText.trim(),
        [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        BigInt(correctAnswer),
      );
      toast.success("Question added successfully!");
      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("");
      await loadQuestionsForExam(selectedExam);
    } catch {
      toast.error("Failed to add question. Please try again.");
    } finally {
      setQuestionLoading(false);
    }
  };

  const navItems: {
    id: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "create-exam", label: "Create Exam", icon: Plus },
    { id: "add-questions", label: "Add Questions", icon: HelpCircle },
    { id: "results", label: "Student Results", icon: BarChart3 },
  ];

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">
                ExamFlow
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                Admin
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="gap-2"
            data-ocid="admin.logout_button"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Mobile Tab Bar — visible only below md */}
      <div className="block md:hidden border-b border-border bg-card sticky top-[65px] z-40">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                activeTab === item.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
              data-ocid={`admin.${item.id.replace("-", "_")}_tab`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 gap-0 md:gap-8">
        {/* Desktop Sidebar — hidden on mobile */}
        <aside className="hidden md:flex md:flex-col w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
                data-ocid={`admin.${item.id.replace("-", "_")}_tab`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 mt-4 md:mt-0">
          <AnimatePresence mode="wait">
            {activeTab === "create-exam" && (
              <motion.div
                key="create-exam"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Create Exam
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Set up a new exam with title, description, and duration
                  </p>
                </div>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      New Exam
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreateExam} className="space-y-4">
                      <div>
                        <Label htmlFor="exam-title">Exam Title</Label>
                        <Input
                          id="exam-title"
                          placeholder="e.g. Mathematics Final Exam"
                          value={examTitle}
                          onChange={(e) => setExamTitle(e.target.value)}
                          disabled={examLoading}
                          className="mt-1"
                          data-ocid="create_exam.input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="exam-desc">Description</Label>
                        <Textarea
                          id="exam-desc"
                          placeholder="Describe the exam topics and instructions..."
                          value={examDesc}
                          onChange={(e) => setExamDesc(e.target.value)}
                          disabled={examLoading}
                          className="mt-1 min-h-[100px]"
                          data-ocid="create_exam.textarea"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="exam-duration"
                          className="flex items-center gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Duration (minutes)
                        </Label>
                        <Input
                          id="exam-duration"
                          type="number"
                          placeholder="e.g. 60"
                          min={1}
                          value={examDuration}
                          onChange={(e) => setExamDuration(e.target.value)}
                          disabled={examLoading}
                          className="mt-1 w-40"
                          data-ocid="create_exam.duration_input"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={examLoading}
                        data-ocid="create_exam.submit_button"
                      >
                        {examLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Exam"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Exams List */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-primary" />
                      All Exams
                      {examsLoading && (
                        <Loader2 className="w-4 h-4 animate-spin ml-1 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!examsLoading && exams.length === 0 ? (
                      <div
                        className="text-center py-8 text-muted-foreground"
                        data-ocid="exams.empty_state"
                      >
                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No exams created yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {exams.map((exam, i) => (
                          <div
                            key={exam.title}
                            className="flex items-start justify-between p-4 rounded-lg bg-secondary/50 border border-border"
                            data-ocid={`exams.item.${i + 1}`}
                          >
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {exam.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {exam.description}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="shrink-0 ml-4 flex items-center gap-1"
                            >
                              <Clock className="w-3 h-3" />
                              {Number(exam.durationMinutes)} min
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "add-questions" && (
              <motion.div
                key="add-questions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Add Questions
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Select an exam and add questions with correct answers
                  </p>
                </div>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Step 1 — Select Exam
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {exams.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No exams available. Create an exam first.
                      </p>
                    ) : (
                      <Select
                        value={selectedExam}
                        onValueChange={handleSelectExam}
                      >
                        <SelectTrigger
                          className="w-full max-w-sm"
                          data-ocid="add_questions.select"
                        >
                          <SelectValue placeholder="Choose an exam..." />
                        </SelectTrigger>
                        <SelectContent>
                          {exams.map((exam) => (
                            <SelectItem key={exam.title} value={exam.title}>
                              {exam.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>

                {selectedExam && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base">
                        Step 2 — Add Question
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddQuestion} className="space-y-5">
                        <div>
                          <Label htmlFor="q-text">Question Text</Label>
                          <Textarea
                            id="q-text"
                            placeholder="Enter the question..."
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            disabled={questionLoading}
                            className="mt-1"
                            data-ocid="add_questions.textarea"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[optionA, optionB, optionC, optionD].map(
                            (val, idx) => {
                              const setter = [
                                setOptionA,
                                setOptionB,
                                setOptionC,
                                setOptionD,
                              ][idx];
                              return (
                                <div key={optionLabels[idx]}>
                                  <Label htmlFor={`opt-${idx}`}>
                                    Option {optionLabels[idx]}
                                  </Label>
                                  <Input
                                    id={`opt-${idx}`}
                                    placeholder={`Enter option ${optionLabels[idx]}`}
                                    value={val}
                                    onChange={(e) => setter(e.target.value)}
                                    disabled={questionLoading}
                                    className="mt-1"
                                    data-ocid={`add_questions.option_${optionLabels[idx].toLowerCase()}_input`}
                                  />
                                </div>
                              );
                            },
                          )}
                        </div>

                        <div>
                          <Label className="text-sm font-semibold text-foreground mb-3 block">
                            <CheckCircle2 className="inline w-4 h-4 mr-1 text-primary" />
                            Select Correct Answer
                          </Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {optionLabels.map((lbl, idx) => (
                              <label
                                key={lbl}
                                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                                  correctAnswer === String(idx)
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border hover:border-primary/40"
                                }`}
                                data-ocid={`add_questions.correct_${lbl.toLowerCase()}_radio`}
                              >
                                <input
                                  type="radio"
                                  name="correct-answer"
                                  value={String(idx)}
                                  checked={correctAnswer === String(idx)}
                                  onChange={(e) =>
                                    setCorrectAnswer(e.target.value)
                                  }
                                  className="sr-only"
                                />
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    correctAnswer === String(idx)
                                      ? "border-primary"
                                      : "border-muted-foreground"
                                  }`}
                                >
                                  {correctAnswer === String(idx) && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                  )}
                                </div>
                                <span className="text-sm font-medium">
                                  Option {lbl}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={questionLoading}
                          data-ocid="add_questions.submit_button"
                        >
                          {questionLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Question"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Questions list */}
                {selectedExam && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        Questions in &ldquo;{selectedExam}&rdquo;
                        {questionsLoading && (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!questionsLoading && questions.length === 0 ? (
                        <div
                          className="text-center py-6 text-muted-foreground"
                          data-ocid="questions.empty_state"
                        >
                          <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No questions added yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {questions.map((q, i) => (
                            <div
                              key={`q-${i}-${q.questionText.slice(0, 10)}`}
                              className="p-4 rounded-lg bg-secondary/50 border border-border"
                              data-ocid={`questions.item.${i + 1}`}
                            >
                              <p className="font-medium text-sm text-foreground mb-2">
                                {i + 1}. {q.questionText}
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {q.options.map((opt, oi) => (
                                  <div
                                    key={`opt-${i}-${opt}`}
                                    className={`text-xs px-2 py-1.5 rounded border flex items-center gap-1.5 ${
                                      Number(q.correctAnswer) === oi
                                        ? "bg-primary/10 border-primary/30 text-primary font-medium"
                                        : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    {Number(q.correctAnswer) === oi && (
                                      <CheckCircle2 className="w-3 h-3" />
                                    )}
                                    <span>
                                      {optionLabels[oi]}. {opt}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {activeTab === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      Student Results
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                      All exam results across all students
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadResults}
                    disabled={resultsLoading}
                    data-ocid="results.reload_button"
                  >
                    {resultsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>

                <Card className="border-border">
                  <CardContent className="p-0">
                    {resultsLoading ? (
                      <div
                        className="flex items-center justify-center py-12"
                        data-ocid="results.loading_state"
                      >
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : results.length === 0 ? (
                      <div
                        className="text-center py-12 text-muted-foreground"
                        data-ocid="results.empty_state"
                      >
                        <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">
                          No results yet. Students haven&apos;t taken any exams.
                        </p>
                      </div>
                    ) : (
                      <Table data-ocid="results.table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Exam Title</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {results.map((r, i) => {
                            const pct =
                              Number(r.totalQuestions) > 0
                                ? Math.round(
                                    (Number(r.score) /
                                      Number(r.totalQuestions)) *
                                      100,
                                  )
                                : 0;
                            return (
                              <TableRow
                                key={`${r.studentName}-${r.examTitle}-${i}`}
                                data-ocid={`results.row.${i + 1}`}
                              >
                                <TableCell className="text-muted-foreground">
                                  {i + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {r.studentName}
                                </TableCell>
                                <TableCell>{r.examTitle}</TableCell>
                                <TableCell>
                                  <span className="font-semibold">
                                    {Number(r.score)}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {" "}
                                    / {Number(r.totalQuestions)}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      pct >= 70
                                        ? "default"
                                        : pct >= 40
                                          ? "secondary"
                                          : "destructive"
                                    }
                                  >
                                    {pct}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
