import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Loader2,
  LogOut,
  Play,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Exam, Question } from "../backend.d";
import { useActor } from "../hooks/useActor";

interface Props {
  studentName: string;
  studentUsername: string;
  onLogout: () => void;
}

type View = "dashboard" | "taking" | "results";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function StudentDashboard({
  studentName,
  studentUsername,
  onLogout,
}: Props) {
  const { actor } = useActor();
  const [view, setView] = useState<View>("dashboard");
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(false);

  // Exam taking
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Results
  const [score, setScore] = useState<number>(0);
  const [totalQ, setTotalQ] = useState<number>(0);
  const [resultExamTitle, setResultExamTitle] = useState("");

  const loadExams = useCallback(async () => {
    setExamsLoading(true);
    try {
      if (!actor) return;
      const list = await actor.getExams();
      setExams(list);
    } catch {
      toast.error("Failed to load exams.");
    } finally {
      setExamsLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // Timer
  useEffect(() => {
    if (view !== "taking" || !activeExam) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, activeExam]);

  // Auto-submit when time runs out
  // biome-ignore lint/correctness/useExhaustiveDependencies: only trigger on timeLeft change
  useEffect(() => {
    if (view === "taking" && timeLeft === 0 && activeExam && !submitLoading) {
      toast.warning("Time's up! Submitting your exam...");
      doSubmit(answers, activeExam, questions);
    }
  }, [timeLeft]);

  const handleStartExam = async (exam: Exam) => {
    setQuestionsLoading(true);
    try {
      if (!actor) {
        toast.error("Service unavailable.");
        return;
      }
      const qs = await actor.getExamQuestions(exam.title);
      if (qs.length === 0) {
        toast.error("This exam has no questions yet.");
        return;
      }
      setActiveExam(exam);
      setQuestions(qs);
      setAnswers({});
      setTimeLeft(Number(exam.durationMinutes) * 60);
      setView("taking");
    } catch {
      toast.error("Failed to load exam questions.");
    } finally {
      setQuestionsLoading(false);
    }
  };

  const doSubmit = async (
    currentAnswers: Record<number, number>,
    exam: Exam,
    qs: Question[],
  ) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitLoading(true);
    try {
      const answerArray = qs.map((_, i) =>
        currentAnswers[i] !== undefined ? BigInt(currentAnswers[i]) : BigInt(0),
      );
      if (!actor) {
        toast.error("Service unavailable.");
        return;
      }
      const result = await actor.submitExam(
        studentUsername,
        exam.title,
        answerArray,
      );
      const scoreNum = Number(result);
      setScore(scoreNum);
      setTotalQ(qs.length);
      setResultExamTitle(exam.title);
      setView("results");
      toast.success("Exam submitted successfully!");
    } catch {
      toast.error("Failed to submit exam. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSubmitExam = () => {
    if (!activeExam) return;
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`,
      );
      if (!confirmed) return;
    }
    doSubmit(answers, activeExam, questions);
  };

  const handleAnswer = (qIdx: number, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const optionLabels = ["A", "B", "C", "D"];
  const timerDanger = timeLeft <= 60 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-xs sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">
                ExamFlow
              </span>
              <Badge variant="secondary" className="ml-2 text-xs">
                Student
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              Welcome,{" "}
              <strong className="text-foreground">{studentName}</strong>
            </span>
            {view !== "dashboard" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("dashboard")}
                className="gap-1"
                data-ocid="student.back_button"
              >
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="gap-2"
              data-ocid="student.logout_button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {view === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">
                  Available Exams
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Select an exam to begin. The timer starts as soon as you click
                  "Take Exam".
                </p>
              </div>

              {examsLoading ? (
                <div
                  className="flex items-center justify-center py-20"
                  data-ocid="exams.loading_state"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : exams.length === 0 ? (
                <div
                  className="text-center py-20 text-muted-foreground"
                  data-ocid="exams.empty_state"
                >
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">No exams available yet</p>
                  <p className="text-sm mt-1">
                    Your instructor hasn't published any exams yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {exams.map((exam, i) => (
                    <motion.div
                      key={exam.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      data-ocid={`exams.item.${i + 1}`}
                    >
                      <Card className="shadow-card hover:shadow-card-hover transition-shadow border-border h-full flex flex-col">
                        <CardHeader>
                          <CardTitle className="text-base">
                            {exam.title}
                          </CardTitle>
                          <CardDescription className="text-xs leading-relaxed line-clamp-3">
                            {exam.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{Number(exam.durationMinutes)} minutes</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full gap-2"
                            onClick={() => handleStartExam(exam)}
                            disabled={questionsLoading}
                            data-ocid={`exams.take_button.${i + 1}`}
                          >
                            {questionsLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                            Take Exam
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === "taking" && activeExam && (
            <motion.div
              key="taking"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Sticky exam header */}
              <div className="sticky top-16 z-40 bg-background/95 backdrop-blur py-3 border-b border-border -mx-6 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      {activeExam.title}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {questions.length} questions
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg ${
                      timerDanger
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                    data-ocid="exam.timer"
                  >
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all rounded-full"
                    style={{
                      width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(answers).length} / {questions.length} answered
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {questions.map((q, qi) => (
                  <Card
                    key={`${q.questionText.slice(0, 20)}-${qi}`}
                    className="shadow-card border-border"
                    data-ocid={`exam.question.${qi + 1}`}
                  >
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold text-foreground">
                        Question {qi + 1} of {questions.length}
                      </CardTitle>
                      <p className="text-base text-foreground mt-1">
                        {q.questionText}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <label
                            key={`opt-${qi}-${opt}`}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              answers[qi] === oi
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/40 hover:bg-accent/30"
                            }`}
                            data-ocid={`exam.option.${qi + 1}.${oi + 1}`}
                          >
                            <input
                              type="radio"
                              name={`q-${qi}`}
                              value={oi}
                              checked={answers[qi] === oi}
                              onChange={() => handleAnswer(qi, oi)}
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                answers[qi] === oi
                                  ? "border-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            >
                              {answers[qi] === oi && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="font-medium text-sm text-muted-foreground w-5">
                              {optionLabels[oi]}.
                            </span>
                            <span className="text-sm text-foreground">
                              {opt}
                            </span>
                          </label>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="sticky bottom-6">
                <Button
                  size="lg"
                  className="w-full shadow-card-hover"
                  onClick={handleSubmitExam}
                  disabled={submitLoading}
                  data-ocid="exam.submit_button"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Exam ({Object.keys(answers).length}/
                      {questions.length} answered)
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {view === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg mx-auto"
            >
              <Card className="shadow-card-hover border-border text-center">
                <CardHeader className="pb-4">
                  <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 bg-primary/10">
                    {score / totalQ >= 0.7 ? (
                      <Trophy className="w-10 h-10 text-primary" />
                    ) : (
                      <CheckCircle2 className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <CardTitle className="text-2xl">Exam Submitted!</CardTitle>
                  <CardDescription>{resultExamTitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="bg-secondary/60 rounded-xl p-6"
                    data-ocid="exam.results_card"
                  >
                    <div className="text-5xl font-extrabold text-primary mb-1">
                      {score}{" "}
                      <span className="text-2xl text-muted-foreground font-medium">
                        / {totalQ}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      questions correct
                    </p>
                    <Separator className="my-4" />
                    <div className="text-3xl font-bold text-foreground">
                      {totalQ > 0 ? Math.round((score / totalQ) * 100) : 0}%
                    </div>
                    <Badge
                      className="mt-2"
                      variant={
                        score / totalQ >= 0.7
                          ? "default"
                          : score / totalQ >= 0.4
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {score / totalQ >= 0.7
                        ? "Excellent"
                        : score / totalQ >= 0.4
                          ? "Average"
                          : "Needs Improvement"}
                    </Badge>
                  </div>
                  {score / totalQ < 1 && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground bg-accent/40 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>
                        Keep practicing! Review the material and try again to
                        improve your score.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setView("dashboard");
                      setActiveExam(null);
                      setQuestions([]);
                      setAnswers({});
                    }}
                    data-ocid="results.back_button"
                  >
                    Back to Dashboard
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center">
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
