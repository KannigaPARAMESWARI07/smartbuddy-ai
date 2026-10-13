import React, { useState } from "react";
import { createRoot } from "react-dom/client";

const TOPICS = ["Python", "Web Development", "Artificial Intelligence", "Science", "General Knowledge"];
const DURATIONS = [5, 10, 15];

function App() {
  const [topic, setTopic] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [lesson, setLesson] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shortening, setShortening] = useState(false);
  const [shortLesson, setShortLesson] = useState("");
  const [shortError, setShortError] = useState(false);
  const [viewMode, setViewMode] = useState<"full" | "short">("full");
  const [takingLong, setTakingLong] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [quiz, setQuiz] = useState<{ q: string; a: string }[]>([]);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const requestIdRef = React.useRef(0);
  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [qaHistory, setQaHistory] = useState<{ q: string; a: string }[]>([]);
  const answerRef = React.useRef<HTMLDivElement | null>(null);

  async function generateLesson(t: string, d: number) {
    if (loading) return; // prevent duplicate requests
    const myRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(false);
    setCancelled(false);
    setLesson("");
    setShortLesson("");
    setShortError(false);
    setViewMode("full");
    setQuiz([]);
    setRevealed({});
    setTakingLong(false);
    const longTimer = setTimeout(() => setTakingLong(true), 7000);

    try {
      const basePrompt = `Create a beginner-friendly ${d}-minute micro-lesson on "${t}" for someone with very little time (e.g. waiting somewhere). Keep it concise and scaled to ${d} minutes of reading.`;

      const { response } = await complete([
        {
          role: "user",
          content: [
            {
              text: `${basePrompt} Format your reply as plain text with these exact section headers and nothing else around them:\n\n### Explanation\n(short, simple explanation)\n\n### Example\n(one clear example)\n\n### Quiz\nWrite 2-3 quiz questions. For EACH question use exactly this 3-line pattern with no extra blank lines between the three lines:\nQ: <question text>\nA: <correct answer>\nE: <one short beginner-friendly sentence explaining why>\n\nUse plain text, no markdown bold symbols, no numbering before Q/A/E.`,
            },
          ],
        },
      ]);

      // Ignore stale/cancelled results
      if (requestIdRef.current !== myRequestId) return;

      const quizMatch = response.split(/###\s*Quiz/i);
      const beforeQuiz = quizMatch[0].trim();
      const quizBlock = quizMatch[1] || "";

      const parsedQuiz: { q: string; a: string; e: string }[] = [];
      const lines = quizBlock.split("\n").map((l) => l.trim()).filter(Boolean);
      let current: { q?: string; a?: string; e?: string } = {};
      for (const line of lines) {
        if (/^Q:/i.test(line)) {
          if (current.q) parsedQuiz.push({ q: current.q, a: current.a || "", e: current.e || "" });
          current = { q: line.replace(/^Q:/i, "").trim() };
        } else if (/^A:/i.test(line)) {
          current.a = line.replace(/^A:/i, "").trim();
        } else if (/^E:/i.test(line)) {
          current.e = line.replace(/^E:/i, "").trim();
        }
      }
      if (current.q) parsedQuiz.push({ q: current.q, a: current.a || "", e: current.e || "" });

      setLesson(beforeQuiz);
      setQuiz(parsedQuiz.map((item) => ({ q: item.q, a: `${item.a}${item.e ? " — " + item.e : ""}` })));
    } catch (e) {
      if (requestIdRef.current !== myRequestId) return;
      setError(true);
    } finally {
      clearTimeout(longTimer);
      if (requestIdRef.current === myRequestId) {
        setLoading(false);
        setTakingLong(false);
      }
    }
  }

  function cancelGeneration() {
    // We cannot truly abort the in-flight AI request, so we mark this request
    // as stale and stop showing the waiting state. Any late result is ignored.
    requestIdRef.current++;
    setLoading(false);
    setTakingLong(false);
    setCancelled(true);
  }

  function switchDuration(d: number) {
    if (!topic || d === duration) return;
    setDuration(d);
    generateLesson(topic, d);
  }

  async function makeShorter() {
    if (!topic || !lesson || shortening) return;
    setShortening(true);
    setShortError(false);
    try {
      const { response } = await complete([
        {
          role: "user",
          content: [
            {
              text: `Here is a micro-lesson on "${topic}":\n\n${lesson}\n\nCondense this into a very short version for someone with almost no time. Keep only: the key takeaway, one essential sentence of explanation, and one brief example. Leave out the quiz entirely. Format with these exact sections:\n\n### Key Takeaway\n### Essential Explanation\n### Brief Example\n\nUse plain text, no markdown bold symbols.`,
            },
          ],
        },
      ]);
      setShortLesson(response);
      setViewMode("short");
    } catch (e) {
      setShortError(true);
    } finally {
      setShortening(false);
    }
  }

  async function askQuestion() {
    if (!question.trim() || !topic || askLoading) return;
    setAskLoading(true);
    setAskError(false);
    setLastQuestion(question);
    const askedQuestion = question;
    try {
      const { response } = await complete([
        {
          role: "user",
          content: [
            { text: `Topic: ${topic}. Answer this question simply and briefly for a beginner: ${askedQuestion}` },
          ],
        },
      ]);
      setQaHistory((prev) => [...prev, { q: askedQuestion, a: response }]);
      setQuestion("");
    } catch (e) {
      setAskError(true);
    } finally {
      setAskLoading(false);
    }
  }

  function retryQuestion() {
    if (!lastQuestion) return;
    setQuestion(lastQuestion);
    askQuestion();
  }

  React.useEffect(() => {
    if (qaHistory.length > 0 && answerRef.current) {
      answerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [qaHistory.length]);

  function reset() {
    setTopic(null);
    setDuration(null);
    setLesson("");
    setShortLesson("");
    setShortError(false);
    setViewMode("full");
    setQuiz([]);
    setRevealed({});
    setCancelled(false);
    setQuestion("");
    setQaHistory([]);
    setAskError(false);
    setLastQuestion("");
  }

  function toggleReveal(i: number) {
    setRevealed((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function handleQuestionKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      askQuestion();
    }
  }

  return (
    <div className="top-clearance bottom-clearance min-h-screen bg-blue-50 flex items-start justify-center px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-5 sm:p-8 mt-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-1">SmartBuddy AI</h1>
        <p className="text-blue-400 text-sm mb-6 sm:mb-8">Learn something small while you wait.</p>

        {!topic && (
          <div>
            <h2 className="text-blue-900 font-semibold mb-3 text-lg">Choose a topic</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  aria-pressed={topic === t}
                  className="min-h-[52px] px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-900 font-semibold rounded-lg hover:bg-blue-100 transition text-left text-lg sm:text-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {topic && !duration && (
          <div>
            <button onClick={reset} className="text-blue-600 text-base mb-4 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
              ← Back
            </button>
            <h2 className="text-blue-900 font-semibold mb-3 text-lg">
              {topic}: how much time do you have?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDuration(d);
                    generateLesson(topic, d);
                  }}
                  className="flex-1 min-h-[52px] px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-lg sm:text-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  {d} minutes
                </button>
              ))}
            </div>
          </div>
        )}

        {topic && duration && (
          <div>
            <button onClick={reset} className="text-blue-600 text-base mb-4 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">
              ← Start over
            </button>
            <h2 className="text-blue-900 font-semibold mb-1 text-lg">
              {topic} · {duration} min session
            </h2>

            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => switchDuration(d)}
                  disabled={loading}
                  aria-pressed={d === duration}
                  className={`min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold transition disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                    d === duration
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-900 border-2 border-blue-300 hover:bg-blue-100"
                  }`}
                >
                  {d} min
                </button>
              ))}
              {lesson && !loading && viewMode === "full" && (
                <button
                  onClick={makeShorter}
                  disabled={shortening}
                  className="min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 transition disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-amber-300"
                >
                  {shortening ? "Shortening..." : "Make it shorter"}
                </button>
              )}
              {shortLesson && !loading && viewMode === "short" && (
                <button
                  onClick={() => setViewMode("full")}
                  className="min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold bg-blue-50 text-blue-900 border-2 border-blue-300 hover:bg-blue-100 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  View full lesson
                </button>
              )}
            </div>

            {loading && (
              <div className="flex flex-col items-center text-center mt-6 mb-2 bg-blue-50 border-2 border-blue-200 rounded-xl py-6 px-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-blue-900 text-lg sm:text-xl font-bold">
                  Preparing your mini-lesson...
                </p>
                <p className="text-blue-700 text-sm sm:text-base mt-2">
                  This can take a few moments. You can wait here while we prepare it.
                </p>
                {takingLong && (
                  <p className="text-blue-700 text-sm sm:text-base mt-2 font-medium">
                    We're still preparing your lesson. Thanks for waiting.
                  </p>
                )}
                <button
                  onClick={cancelGeneration}
                  className="mt-4 min-h-[48px] px-5 py-2 bg-white text-blue-700 font-semibold rounded-lg border-2 border-blue-400 hover:bg-blue-50 transition text-base focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Cancel generation
                </button>
              </div>
            )}

            {cancelled && !loading && (
              <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
                <p className="text-blue-900 text-base font-medium mb-3">
                  Stopped waiting. We can't confirm the request itself was cancelled, but any result that
                  arrives late will be ignored.
                </p>
                <button
                  onClick={() => generateLesson(topic, duration)}
                  className="min-h-[48px] px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-base focus:outline-none focus:ring-4 focus:ring-blue-300"
                >
                  Try again
                </button>
              </div>
            )}

            {error && !loading && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
                <p className="text-red-800 text-base font-semibold mb-3">
                  Something went wrong generating your lesson.
                </p>
                <button
                  onClick={() => generateLesson(topic, duration)}
                  className="min-h-[48px] px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-base focus:outline-none focus:ring-4 focus:ring-red-300"
                >
                  Retry
                </button>
              </div>
            )}

            {shortError && !shortening && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-xl p-4 text-center">
                <p className="text-red-800 text-base font-semibold mb-3">
                  Couldn't shorten the lesson. Your original lesson is still here.
                </p>
                <button
                  onClick={makeShorter}
                  className="min-h-[48px] px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-base focus:outline-none focus:ring-4 focus:ring-red-300"
                >
                  Retry
                </button>
              </div>
            )}

            {lesson && !loading && viewMode === "full" && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 whitespace-pre-wrap text-blue-900 text-base sm:text-lg leading-relaxed">
                {lesson}
              </div>
            )}

            {quiz.length > 0 && !loading && viewMode === "full" && (
              <div className="mt-4">
                <h3 className="text-blue-900 font-semibold mb-2 text-base">Check your answers</h3>
                <div className="space-y-3">
                  {quiz.map((item, i) => (
                    <div key={i} className="bg-white border-2 border-blue-200 rounded-xl p-4">
                      <p className="text-blue-900 text-base sm:text-lg font-medium mb-2">{item.q}</p>
                      <button
                        onClick={() => toggleReveal(i)}
                        aria-expanded={!!revealed[i]}
                        className="min-h-[44px] px-4 py-2 bg-blue-50 text-blue-800 font-semibold rounded-lg border-2 border-blue-300 hover:bg-blue-100 transition text-sm focus:outline-none focus:ring-4 focus:ring-blue-300"
                      >
                        {revealed[i] ? "Hide answer" : "Reveal answer"}
                      </button>
                      {revealed[i] && (
                        <p className="mt-3 text-blue-950 text-base leading-relaxed bg-blue-50 border border-blue-200 rounded-lg p-3">
                          {item.a}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shortLesson && !loading && viewMode === "short" && (
              <div className="mt-4">
                <p className="text-amber-700 text-xs font-bold uppercase tracking-wide mb-2">
                  Shortened version
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 whitespace-pre-wrap text-blue-900 text-base sm:text-lg leading-relaxed">
                  {shortLesson}
                </div>
              </div>
            )}

            {lesson && (
              <div className="mt-6">
                <h3 className="text-blue-900 font-semibold mb-2 text-base">Ask a question about {topic}</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={handleQuestionKeyDown}
                    placeholder="Type your question..."
                    aria-label="Your question"
                    className="flex-1 min-h-[48px] px-3 py-2 border-2 border-blue-300 rounded-lg focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg"
                  />
                  <button
                    onClick={askQuestion}
                    disabled={askLoading || !question.trim()}
                    className="min-h-[48px] px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    {askLoading ? "Asking..." : "Ask"}
                  </button>
                </div>

                {askLoading && (
                  <div className="flex items-center gap-3 mt-3 bg-blue-100 border-2 border-blue-400 rounded-lg p-4">
                    <div className="w-7 h-7 border-4 border-blue-300 border-t-blue-700 rounded-full animate-spin flex-shrink-0" />
                    <p className="text-blue-900 font-bold text-lg">Finding your answer...</p>
                  </div>
                )}

                {askError && !askLoading && (
                  <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-lg p-3">
                    <p className="text-red-800 text-sm font-semibold mb-2">
                      Couldn't get an answer for "{lastQuestion}". Please try again.
                    </p>
                    <button
                      onClick={retryQuestion}
                      className="min-h-[44px] px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition text-sm focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {qaHistory.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {qaHistory.map((item, i) => (
                      <div
                        key={i}
                        ref={i === qaHistory.length - 1 ? answerRef : null}
                        className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4 shadow-sm"
                      >
                        <p className="text-blue-700 text-sm font-semibold mb-2">Q: {item.q}</p>
                        <p className="text-blue-900 text-xs font-bold uppercase tracking-wide mb-1">
                          Your Answer
                        </p>
                        <p className="text-blue-950 text-lg leading-relaxed whitespace-pre-wrap">{item.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
