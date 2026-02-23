import { createContext, useContext, useState, ReactNode } from "react";
import { deadlines } from "@/data/mockData";

export type QuestionType = "mcq" | "short-answer" | "long-answer";

export interface MCQQuestion {
    id: string;
    type: "mcq";
    text: string;
    options: string[];
    correctOption: number;
    points: number;
}

export interface ShortAnswerQuestion {
    id: string;
    type: "short-answer";
    text: string;
    points: number;
}

export interface LongAnswerQuestion {
    id: string;
    type: "long-answer";
    text: string;
    points: number;
}

export type Question = MCQQuestion | ShortAnswerQuestion | LongAnswerQuestion;

export interface Assignment {
    id: string;
    title: string;
    description: string;
    courseId: string;
    courseTitle: string;
    dueDate: string;
    points: number;
    questions: Question[];
    createdAt: string;
}

interface AssignmentContextType {
    assignments: Assignment[];
    addAssignment: (assignment: Omit<Assignment, "id" | "createdAt">) => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

const initialAssignments: Assignment[] = deadlines.map((d) => ({
    id: `assign-${d.id}`,
    title: d.task,
    description: `Complete the ${d.task} for ${d.course}.`,
    courseId: d.id,
    courseTitle: d.course,
    dueDate: d.due,
    points: 100,
    questions: [
        { id: `q-${d.id}-1`, type: "mcq" as const, text: `Sample MCQ for ${d.task}`, options: ["Option A", "Option B", "Option C", "Option D"], correctOption: 0, points: 25 },
        { id: `q-${d.id}-2`, type: "short-answer" as const, text: `Briefly explain the concept behind ${d.task}.`, points: 25 },
        { id: `q-${d.id}-3`, type: "long-answer" as const, text: `Write a detailed analysis for ${d.task}.`, points: 50 },
    ],
    createdAt: "2026-02-15",
}));

export const AssignmentProvider = ({ children }: { children: ReactNode }) => {
    const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);

    const addAssignment = (assignment: Omit<Assignment, "id" | "createdAt">) => {
        const newAssignment: Assignment = {
            ...assignment,
            id: `assign-${Date.now()}`,
            createdAt: new Date().toISOString().split("T")[0],
        };
        setAssignments((prev) => [newAssignment, ...prev]);
    };

    return (
        <AssignmentContext.Provider value={{ assignments, addAssignment }}>
            {children}
        </AssignmentContext.Provider>
    );
};

export const useAssignments = () => {
    const context = useContext(AssignmentContext);
    if (!context) throw new Error("useAssignments must be used within an AssignmentProvider");
    return context;
};
