import { BookOpen, MessageCircle, Users } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentSessionWithStudent } from "@/types";

interface TabsListHeaderProps {
    sessionStudents: StudentSessionWithStudent[];
    pendingQuestionsCount: number;
}

export function TabsListHeader({ sessionStudents, pendingQuestionsCount }: TabsListHeaderProps) {
    return (
        <TabsList className="mx-6 mt-4 w-fit" data-testid="session-tabs">
            <TabsTrigger value="course" data-testid="tab-course">
                <BookOpen className="h-4 w-4 mr-2" />
                Cours
            </TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">
                <Users className="h-4 w-4 mr-2" />
                Élèves ({sessionStudents.length || "..."})
            </TabsTrigger>
            <TabsTrigger value="qa" data-testid="tab-qa" className="relative">
                <MessageCircle className="h-4 w-4 mr-2" />
                Questions
                {pendingQuestionsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                        {pendingQuestionsCount}
                    </span>
                )}
            </TabsTrigger>
        </TabsList>
    );
}