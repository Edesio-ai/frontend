import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  ChevronRight,
  GripVertical,
  Pencil,
  Check,
  Trash2
} from "lucide-react";
import { Course } from "@/types";
import { Button } from "../ui/button";

interface SortableCourseItemProps {
  course: Course;
  onSelect: (course: Course) => void;
  onRename: (courseId: string, newTitle: string) => void;
  onDelete?: (course: Course) => void;
  formatDate: (dateStr: string) => string;
}


export function SortableCourseItem({ course, onSelect, onRename, onDelete, formatDate }: SortableCourseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(course.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(course.title);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSaveEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (editTitle.trim() && editTitle !== course.title) {
      onRename(course.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit(e);
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(course.title);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(course);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-lg border bg-card hover-elevate cursor-pointer transition-all flex items-center gap-2"
      onClick={() => !isEditing && onSelect(course)}
      data-testid={`card-course-${course.id}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
        data-testid={`drag-handle-course-${course.id}`}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
                data-testid={`input-rename-course-${course.id}`}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleSaveEdit}
                data-testid={`button-confirm-rename-course-${course.id}`}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h5 className="font-medium truncate" data-testid={`text-course-title-${course.id}`}>
                  {course.title}
                </h5>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 opacity-50 hover:opacity-100 focus:opacity-100"
                  onClick={handleEditClick}
                  data-testid={`button-rename-course-${course.id}`}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                {onDelete && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-50 hover:opacity-100 focus:opacity-100 hover:text-destructive"
                    onClick={handleDeleteClick}
                    data-testid={`button-delete-course-${course.id}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {course.description && (
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {course.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(course.createdAt ?? "")}</span>
              </div>
            </>
          )}
        </div>
        {!isEditing && (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        )}
      </div>
    </div>
  );
}