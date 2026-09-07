'use client';

import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash as DeleteIcon, Loader2 as LoadingIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { toast } from 'sonner';
import { deletePromptAction } from '@/app/actions/prompt.actions';
import { useRouter } from 'next/navigation';

export type PromptCardProps = {
  prompt: PromptSummary;
};

export function PromptCard({ prompt }: PromptCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deletePromptAction(prompt.id);
      if (!result.success) return toast.error(result.message);
      toast.success('Prompt removido com sucesso');
      router.refresh();
    } catch (error) {
      const _error = error as Error;
      toast.error(_error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.li
      className="p-2 rounded-lg transtion-all duration-200 group relative hover:bg-gray-700"
      aria-label={`${prompt.title}`}
      initial={{ opacity: 1, height: 'auto' }}
      exit={{
        opacity: 0,
        height: 0,
        marginBottom: 0,
        transition: { duration: 0.3, ease: 'easeInOut' },
      }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="flex items-center justify-between gap-3">
        <Link href={`/${prompt.id}`} prefetch className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-white group-hover:text-accent-300 transition-colors">
            {prompt.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">
            {prompt.content}
          </p>
        </Link>
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="icon"
                size="icon"
                title="Remover Prompt"
                aria-label="Remover Prompt"
              >
                <DeleteIcon className="h-3 w-3" />
              </Button>
            }
          ></AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Prompt</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover este prompt? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-200">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-900!"
              >
                {isDeleting && (
                  <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar remoção
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </header>
    </motion.li>
  );
}
