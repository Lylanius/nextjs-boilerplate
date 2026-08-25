"use client";

import React, { useState, useMemo } from "react";
import {
  TeacherAssignment,
  UkCurriculumYear,
} from "@/lib/types";
import {
  loadTeacherData,
  saveTeacherData,
  TeacherStoreData,
} from "@/lib/teacherData";
import {
  CURRICULUM_STAGES,
  generatePrintableWorksheet,
} from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import {
  ArrowLeft,
  Users,
  Grid3X3,
  BookOpen,
  Printer,
  Award,
  Settings,
  Plus,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

interface TeacherHubProps {
  onBack: () => void;
}

type TeacherTab =
  | "roster"
  | "gap-analysis"
  | "assignments"
  | "worksheets"
  | "certificates"
  | "send-settings";

export default function TeacherHub({ onBack }: TeacherHubProps) {
  const [storeData, setStoreData] = useState<TeacherStoreData>(() => loadTeacherData());
  const [activeTab, setActiveTab] = useState<TeacherTab>("roster");
  const [selectedClassId, setSelectedClassId] = useState<string>("class_y4_beech");
  const [worksheetSeed, setWorksheetSeed] = useState<number>(1);

  // Worksheet generator state
  const [worksheetStage, setWorksheetStage] = useState<UkCurriculumYear>("ks2-y4");
  const [worksheetCount, setWorksheetCount] = useState<number>(25);
  const [showAnswerKey, setShowAnswerKey] = useState<boolean>(false);

  // Certificate generator state
  const [certStudentName, setCertStudentName] = useState<string>("Maya Patel");
  const [certAwardTitle, setCertAwardTitle] = useState<string>("UK MTC 25/25 Perfect Score Champion");
  const [certTeacherSignature, setCertTeacherSignature] = useState<string>(storeData.teacherName);
  const [certSchoolName, setCertSchoolName] = useState<string>(storeData.schoolName);

  // New assignment modal
  const [showNewAssignModal, setShowNewAssignModal] = useState<boolean>(false);
  const [newAssignTitle, setNewAssignTitle] = useState<string>("");
  const [newAssignTopic, setNewAssignTopic] = useState<string>("7, 8 and 9 Times Tables");
  const [newAssignTarget, setNewAssignTarget] = useState<number>(25);
  const [newAssignAccuracy, setNewAssignAccuracy] = useState<number>(80);

  const activeClass =
    storeData.classes.find((c) => c.id === selectedClassId) || storeData.classes[0];

  const generatedWorksheet = useMemo(() => {
    // worksheetSeed is a dependency to allow re-generating fresh questions
    if (worksheetSeed < 0) return null;
    return generatePrintableWorksheet(worksheetStage, worksheetCount, true);
  }, [worksheetStage, worksheetCount, worksheetSeed]);

  const handleUpdateStore = (updated: TeacherStoreData) => {
    setStoreData(updated);
    saveTeacherData(updated);
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignTitle) return;

    const newAssignment: TeacherAssignment = {
      id: `asg_${Date.now()}`,
      title: newAssignTitle,
      targetYear: activeClass.yearGroup,
      topic: newAssignTopic,
      targetQuestions: newAssignTarget,
      minAccuracyPercent: newAssignAccuracy,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      assignedToClass: activeClass.id,
      completedCount: 0,
      totalStudents: activeClass.students.length,
    };

    const updated = {
      ...storeData,
      assignments: [newAssignment, ...storeData.assignments],
    };
    handleUpdateStore(updated);
    setShowNewAssignModal(false);
    setNewAssignTitle("");
    sound.playLevelUp();
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportCsv = () => {
    if (!activeClass) return;
    const headers = "Name,Year Group,Level,Accuracy %,Avg Recall (ms),MTC Score,SATs Score,Mastery Status,Trouble Spots\n";
    const rows = activeClass.students
      .map(
        (s) =>
          `"${s.name}","${s.yearGroup}",${s.level},${s.accuracyRate}%,${s.avgRecallMs},${s.mtcScore}/25,${s.satsScore}/40,"${s.masteryStatus}","${s.troubleSpots.join("; ")}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeClass.name.replace(/\s+/g, "_")}_Diagnostic_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-sm font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Student Hub
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl font-black text-white">Teacher & Parent Analytics Portal</h1>
            </div>
            <p className="text-xs text-slate-400">
              {storeData.schoolName} • {storeData.teacherName}
            </p>
          </div>
        </div>

        {/* Class Selector & CSV Export */}
        <div className="flex items-center gap-2">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
          >
            {storeData.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls.students.length} pupils)
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Export Class Diagnostics as CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-900/60 rounded-2xl border border-slate-800">
        {[
          { id: "roster" as const, label: "Class Roster", icon: Users },
          { id: "gap-analysis" as const, label: "Diagnostic Gap Analyzer", icon: Grid3X3 },
          { id: "assignments" as const, label: "Curriculum Assignments", icon: BookOpen },
          { id: "worksheets" as const, label: "Printable Worksheets", icon: Printer },
          { id: "certificates" as const, label: "Award Certificates", icon: Award },
          { id: "send-settings" as const, label: "SEND & Accessibility", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLASS ROSTER */}
      {activeTab === "roster" && activeClass && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">{activeClass.name}</h2>
              <p className="text-xs text-slate-400">
                {activeClass.students.length} enrolled pupils • Target: {CURRICULUM_STAGES[activeClass.yearGroup]?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400">Class Avg Accuracy: </span>
                <span className="font-black text-emerald-400">
                  {Math.round(
                    activeClass.students.reduce((acc, s) => acc + s.accuracyRate, 0) /
                      activeClass.students.length
                  )}
                  %
                </span>
              </div>
              <div className="bg-sky-950/40 border border-sky-800/40 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-slate-400">Avg Recall: </span>
                <span className="font-black text-sky-400">
                  {(
                    activeClass.students.reduce((acc, s) => acc + s.avgRecallMs, 0) /
                    (activeClass.students.length * 1000)
                  ).toFixed(1)}
                  s
                </span>
              </div>
            </div>
          </div>

          {/* Pupils Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Pupil Name</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5">Accuracy</th>
                  <th className="p-3.5">Avg Recall</th>
                  <th className="p-3.5">MTC Mock</th>
                  <th className="p-3.5">SATs Score</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Key Trouble Spots</th>
                  <th className="p-3.5 rounded-r-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {activeClass.students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-black shadow-md">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <span>{student.name}</span>
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {student.lastActive}
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-amber-400">Lvl {student.level}</td>
                    <td className="p-3.5">
                      <span
                        className={`font-black ${
                          student.accuracyRate >= 85
                            ? "text-emerald-400"
                            : student.accuracyRate >= 70
                            ? "text-amber-400"
                            : "text-rose-400"
                        }`}
                      >
                        {student.accuracyRate}%
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {(student.avgRecallMs / 1000).toFixed(1)}s
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-1 rounded-lg font-black ${
                          student.mtcScore >= 24
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : student.mtcScore >= 18
                            ? "bg-amber-950 text-amber-300 border border-amber-800"
                            : "bg-rose-950 text-rose-300 border border-rose-800"
                        }`}
                      >
                        {student.mtcScore}/25
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-purple-300">
                      {student.satsScore > 0 ? `${student.satsScore}/40` : "—"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                          student.masteryStatus === "Master"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            : student.masteryStatus === "Fluent"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : student.masteryStatus === "Developing"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {student.masteryStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-rose-300 font-mono">
                      {student.troubleSpots.length > 0 ? (
                        student.troubleSpots.slice(0, 3).join(", ")
                      ) : (
                        <span className="text-emerald-400 font-sans">None (Mastered)</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setCertStudentName(student.name);
                          setActiveTab("certificates");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition-all"
                      >
                        Award Cert
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNOSTIC GAP ANALYZER & HEATMAP */}
      {activeTab === "gap-analysis" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-indigo-400" />
              Whole-Class Diagnostic Gap Analyzer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Live heat map identifying class-wide speed and accuracy misconceptions across all 144 multiplication facts.
            </p>
          </div>

          {/* Intervention Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-950/40 border border-rose-800/40 rounded-2xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-2">
                <AlertTriangle className="w-4 h-4" />
                High-Priority Intervention
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>4 pupils</strong> (Liam, Chloe, Sophie, Oliver) take <strong>&gt;3.5 seconds</strong> on <strong>7×8</strong> and <strong>8×9</strong>.
              </p>
              <div className="mt-3 text-[11px] text-rose-300 bg-rose-900/30 p-2 rounded-xl">
                💡 <em>Action: Assign 7s & 8s Target Dojo Sprint.</em>
              </div>
            </div>

            <div className="p-4 bg-amber-950/40 border border-amber-800/40 rounded-2xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                <Lightbulb className="w-4 h-4" />
                Developing Fluency Group
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>6×7 and 12×6</strong> show a 28% error rate on inverse division questions.
              </p>
              <div className="mt-3 text-[11px] text-amber-300 bg-amber-900/30 p-2 rounded-xl">
                💡 <em>Action: Practice fact family inverse bonds.</em>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-2">
                <CheckCircle2 className="w-4 h-4" />
                Class Strengths
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>2s, 5s, 10s and 11s tables</strong> are at 96% class-wide instant recall (&lt;1.4s).
              </p>
              <div className="mt-3 text-[11px] text-emerald-300 bg-emerald-900/30 p-2 rounded-xl">
                💡 <em>Ready for Year 5 Multi-digit & fractions extension.</em>
              </div>
            </div>
          </div>

          {/* 12x12 Class Heatmap Grid */}
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">
              Class 12×12 Times Tables Heat Map (Green = Mastered, Red = Misconception)
            </h3>

            <div className="grid grid-cols-13 gap-1 max-w-2xl mx-auto font-mono text-[10px] text-center">
              <div className="p-1 font-bold text-slate-500">×</div>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                <div key={c} className="p-1 font-bold text-indigo-400 bg-slate-900 rounded">
                  {c}
                </div>
              ))}

              {Array.from({ length: 12 }, (_, r) => r + 1).map((row) => (
                <React.Fragment key={row}>
                  <div className="p-1 font-bold text-indigo-400 bg-slate-900 rounded flex items-center justify-center">
                    {row}
                  </div>
                  {Array.from({ length: 12 }, (_, c) => c + 1).map((col) => {
                    // Tricky pairs simulated
                    const isTricky =
                      (row === 7 && col === 8) ||
                      (row === 8 && col === 7) ||
                      (row === 8 && col === 9) ||
                      (row === 9 && col === 8) ||
                      (row === 6 && col === 7) ||
                      (row === 7 && col === 6) ||
                      (row === 12 && col === 8) ||
                      (row === 8 && col === 12);

                    const isModerate =
                      (row === 7 && col === 9) ||
                      (row === 9 && col === 7) ||
                      (row === 6 && col === 8) ||
                      (row === 8 && col === 6) ||
                      (row === 12 && col === 7);

                    let bg = "bg-emerald-600/80 text-white font-bold hover:bg-emerald-500";
                    if (isTricky) bg = "bg-rose-600 text-white font-black hover:bg-rose-500 animate-pulse";
                    else if (isModerate) bg = "bg-amber-500 text-slate-950 font-bold hover:bg-amber-400";

                    return (
                      <div
                        key={col}
                        className={`aspect-square rounded flex items-center justify-center cursor-pointer transition-all shadow-sm ${bg}`}
                        title={`${row} × ${col} = ${row * col} (Class Accuracy: ${
                          isTricky ? "58%" : isModerate ? "74%" : "96%"
                        })`}
                      >
                        {row * col}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS & HOMEWORK */}
      {activeTab === "assignments" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Active Class Assignments
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Targeted curriculum tasks with accuracy benchmarks and due dates.
              </p>
            </div>
            <button
              onClick={() => setShowNewAssignModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Set New Task
            </button>
          </div>

          {/* Assignments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeData.assignments.map((asg) => {
              const pct = Math.round((asg.completedCount / asg.totalStudents) * 100);
              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase">
                        {CURRICULUM_STAGES[asg.targetYear]?.code || "KS2"}
                      </span>
                      <span className="text-xs text-slate-400">Due: {asg.dueDate}</span>
                    </div>

                    <h3 className="font-black text-white text-base mb-1">{asg.title}</h3>
                    <p className="text-xs text-slate-300 mb-4">{asg.topic}</p>

                    <div className="space-y-1 text-xs mb-4">
                      <div className="flex justify-between text-slate-400">
                        <span>Class Completion:</span>
                        <span className="font-bold text-white">
                          {asg.completedCount} / {asg.totalStudents} pupils ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-700/60">
                    <span className="text-slate-400">Target Accuracy: {asg.minAccuracyPercent}%</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* New Assignment Modal */}
          {showNewAssignModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                <h3 className="text-lg font-black text-white mb-4">Create New Homework Task</h3>
                <form onSubmit={handleAddAssignment} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Year 4 Tricky 8s & 9s Blitz"
                      value={newAssignTitle}
                      onChange={(e) => setNewAssignTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Curriculum Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 7 and 8 multiplication and division facts"
                      value={newAssignTopic}
                      onChange={(e) => setNewAssignTopic(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Questions</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={newAssignTarget}
                        onChange={(e) => setNewAssignTarget(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Min Accuracy (%)</label>
                      <input
                        type="number"
                        min={50}
                        max={100}
                        value={newAssignAccuracy}
                        onChange={(e) => setNewAssignAccuracy(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowNewAssignModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-md"
                    >
                      Publish Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRINTABLE WORKSHEETS */}
      {activeTab === "worksheets" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                Printable Worksheet & Test Paper Generator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Generate clean, classroom-ready test papers with student header lines and optional teacher answer keys.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAnswerKey}
                  onChange={(e) => setShowAnswerKey(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                />
                Show Answer Key
              </label>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Paper
              </button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Curriculum Stage</label>
              <select
                value={worksheetStage}
                onChange={(e) => setWorksheetStage(e.target.value as UkCurriculumYear)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                {Object.values(CURRICULUM_STAGES).map((stg) => (
                  <option key={stg.id} value={stg.id}>
                    {stg.name} ({stg.ageRange})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Question Count</label>
              <select
                value={worksheetCount}
                onChange={(e) => setWorksheetCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value={10}>10 Questions (Quick Check)</option>
                <option value={25}>25 Questions (Standard Test)</option>
                <option value={36}>36 Questions (SATs Arithmetic Paper)</option>
                <option value={50}>50 Questions (Comprehensive Marathon)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setWorksheetSeed((s) => s + 1)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 transition-all"
              >
                🔄 Refresh Questions
              </button>
            </div>
          </div>

          {/* Printable Sheet Preview Box */}
          {generatedWorksheet && (
            <div className="bg-white text-slate-950 p-8 rounded-2xl shadow-2xl font-serif max-w-3xl mx-auto border-2 border-slate-300">
              {/* Header Box */}
              <div className="border-b-2 border-slate-900 pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{generatedWorksheet.title}</h3>
                    <p className="text-xs text-slate-600 font-sans mt-0.5">
                      {storeData.schoolName} • Key Stage Mathematics
                    </p>
                  </div>
                  <div className="border-2 border-slate-900 p-2 rounded text-center min-w-[90px] font-sans">
                    <span className="block text-[10px] font-bold uppercase text-slate-600">Score</span>
                    <span className="text-lg font-black text-slate-900">____ / {generatedWorksheet.questions.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 font-sans text-xs">
                  <div>
                    <span className="font-bold">Pupil Name:</span> ___________________________
                  </div>
                  <div>
                    <span className="font-bold">Date:</span> ___________________________
                  </div>
                </div>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm font-sans">
                {generatedWorksheet.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-slate-200 pb-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 w-6">{(idx + 1).toString().padStart(2, "0")}.</span>
                      <span className="font-bold text-slate-900 text-base">{q.formattedText}</span>
                    </div>
                    <div className="w-16 h-8 border-2 border-slate-400 rounded flex items-center justify-center font-bold text-slate-800">
                      {showAnswerKey ? (
                        <span className="text-rose-600 font-black">{String(q.answer)}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-500 font-sans">
                Grid Guardians National Curriculum Assessment • Aligned with DfE Mathematics Framework
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CERTIFICATE GENERATOR */}
      {activeTab === "certificates" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Award Certificate Generator
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Create high-resolution certificate awards with gold seals for student achievements.
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Certificate
            </button>
          </div>

          {/* Form Options */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Pupil Name</label>
              <input
                type="text"
                value={certStudentName}
                onChange={(e) => setCertStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Award Title</label>
              <select
                value={certAwardTitle}
                onChange={(e) => setCertAwardTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value="UK MTC 25/25 Perfect Score Champion">UK MTC 25/25 Perfect Score</option>
                <option value="Times Tables Rockstar Master">Times Tables Rockstar Master</option>
                <option value="Key Stage 2 SATs Arithmetic Titan">KS2 SATs Arithmetic Titan</option>
                <option value="Early Years Math Garden Star">Early Years Math Garden Star</option>
                <option value="12×12 Rapid Fluency Grandmaster">12×12 Rapid Fluency Grandmaster</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">Teacher Signature</label>
              <input
                type="text"
                value={certTeacherSignature}
                onChange={(e) => setCertTeacherSignature(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold mb-1">School Name</label>
              <input
                type="text"
                value={certSchoolName}
                onChange={(e) => setCertSchoolName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          {/* Certificate Visual Render */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 text-slate-900 p-10 rounded-3xl border-8 border-amber-600/40 shadow-2xl max-w-3xl mx-auto text-center relative overflow-hidden font-serif">
            <div className="absolute top-4 left-4 text-3xl">🌟</div>
            <div className="absolute top-4 right-4 text-3xl">🌟</div>
            <div className="absolute bottom-4 left-4 text-3xl">🌟</div>
            <div className="absolute bottom-4 right-4 text-3xl">🌟</div>

            <div className="text-4xl mb-2">🏆</div>
            <p className="text-xs uppercase tracking-widest text-amber-900 font-sans font-bold">
              {certSchoolName}
            </p>
            <h2 className="text-3xl font-black text-amber-950 uppercase tracking-wide mt-2 mb-1">
              Certificate of Mathematical Excellence
            </h2>
            <p className="text-xs text-amber-800 italic mb-6">
              This prestigious certificate is proudly awarded to
            </p>

            <div className="text-3xl font-black text-indigo-950 font-serif border-b-2 border-amber-900/30 pb-2 mb-4 max-w-md mx-auto">
              {certStudentName}
            </div>

            <p className="text-sm text-slate-800 mb-2">
              For outstanding achievement, perseverance and mastery in:
            </p>
            <div className="text-lg font-black text-amber-900 bg-amber-200/60 py-2 px-6 rounded-full inline-block mb-8 border border-amber-400">
              {certAwardTitle}
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs font-sans mt-6 pt-6 border-t border-amber-900/20 max-w-lg mx-auto">
              <div>
                <span className="font-bold block text-slate-900">{certTeacherSignature}</span>
                <span className="text-slate-600 text-[10px]">Class Teacher / Math Lead</span>
              </div>
              <div>
                <span className="font-bold block text-slate-900">
                  {new Date().toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="text-slate-600 text-[10px]">Date of Award</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SEND & ACCESSIBILITY SETTINGS */}
      {activeTab === "send-settings" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              SEND & Examination Accessibility Accommodations
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure timing concessions and assistive formats aligned with statutory DfE SEND guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-white">MTC Check Timing Accommodations</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard DfE statutory check permits 6.0 seconds per question. Teachers can adjust this for pupils with SEND timing concessions.
              </p>

              <div>
                <label className="block text-xs text-slate-400 font-bold mb-1">
                  Seconds Per Question:
                </label>
                <select
                  value={storeData.sendTimerSeconds}
                  onChange={(e) =>
                    handleUpdateStore({
                      ...storeData,
                      sendTimerSeconds: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold"
                >
                  <option value={6}>6.0s (Official Standard DfE Timer)</option>
                  <option value={8}>8.0s (33% Extra Time Accommodation)</option>
                  <option value={10}>10.0s (66% Extra Time Accommodation)</option>
                  <option value={15}>15.0s (150% Extra Time Concession)</option>
                  <option value={0}>Untimed (Practice & Confidence Mode)</option>
                </select>
              </div>
            </div>

            <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-4">
              <h3 className="text-sm font-black text-white">Audio & Visual Accessibility</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Assistive speech synthesis for questions and high-contrast color formatting.
              </p>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl cursor-pointer">
                  <span className="text-slate-300 font-bold">Audible Text-to-Speech (TTS) Reader</span>
                  <input
                    type="checkbox"
                    checked={storeData.sendReadAloud}
                    onChange={(e) =>
                      handleUpdateStore({
                        ...storeData,
                        sendReadAloud: e.target.checked,
                      })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900 rounded-xl cursor-pointer">
                  <span className="text-slate-300 font-bold">High-Contrast Dyslexic Friendly Mode</span>
                  <input
                    type="checkbox"
                    checked={storeData.sendHighContrast}
                    onChange={(e) =>
                      handleUpdateStore({
                        ...storeData,
                        sendHighContrast: e.target.checked,
                      })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
