export interface GenerateCompletionFeedbackRequest {
    courseTitle: string;
    score: number;
    total: number;
    studentName?: string; 
}