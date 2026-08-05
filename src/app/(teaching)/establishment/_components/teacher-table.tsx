"use client";

import { useState } from "react";

import { CourseViewModal } from "@/components/establishment/CourseViewModal";
import { SessionStudentsModal } from "@/components/establishment/SessionStudentModal";
import { TeacherRow } from "@/components/establishment/TeacherRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEstablishment } from "../_contexts/establishment-context";
import { useTranslations } from "@/lib/i18n/client";
import type { SessionDetails, SessionWithStudentCount, Student, TeacherWithStats } from "@/types";

export function TeacherTable({ teachers }: { teachers: TeacherWithStats[] }) {
  const t = useTranslations();
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [selectedSessionDetails, setSelectedSessionDetails] = useState<SessionDetails | null>(null);
  const { getSessionDetails, getSessionCourse, getStudentSessions } = useEstablishment();

  const [selectedSession, setSelectedSession] = useState<SessionWithStudentCount | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sessionStudents, setSessionStudents] = useState<Student[]>([]);

  const handleViewCourse = async (courseId: string) => {
    setShowCourseModal(true);
    setLoadingCourse(true);
    setSelectedSessionDetails(null);
    const details = await getSessionDetails(courseId);
    setSelectedSessionDetails(details);
    setLoadingCourse(false);
  };

  const handleViewStudents = async (session: SessionWithStudentCount) => {
    setSelectedSession(session);
    setLoadingStudents(true);
    const students = await getStudentSessions(session.id);
    setSessionStudents(students);
    setLoadingStudents(false);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.establishment.name}</TableHead>
            <TableHead>{t.establishment.email}</TableHead>
            <TableHead>{t.establishment.classes}</TableHead>
            <TableHead>{t.establishment.students}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher: TeacherWithStats) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              onViewStudents={handleViewStudents}
              onViewCourse={handleViewCourse}
              getSessionCourse={getSessionCourse}
            />
          ))}
        </TableBody>
      </Table>
      <SessionStudentsModal
        session={selectedSession}
        students={sessionStudents}
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        loading={loadingStudents}
      />
      <CourseViewModal
        isOpen={showCourseModal}
        onClose={() => {
          setShowCourseModal(false);
          setSelectedSessionDetails(null);
        }}
        sessionDetails={selectedSessionDetails}
        loading={loadingCourse}
      />
    </>
  );
}
