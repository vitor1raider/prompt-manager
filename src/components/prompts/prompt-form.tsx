'use client';

import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { FieldGroup } from '../ui/field';
import { useRouter } from 'next/navigation';
import { createPromptAction } from '@/app/actions/prompt.actions';

export function PromptForm() {
  const router = useRouter();

  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const submit = async (data: CreatePromptDTO) => {
    const result = await createPromptAction(data);

    if (!result.success) {
      return;
    }
    router.refresh();
  };

  return (
    <form action="" onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <Button type="submit" size="sm">
          Salvar
        </Button>
      </header>

      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field }) => (
            <Input
              placeholder="Título do prompt"
              variant="transparent"
              size="lg"
              autoFocus
              {...field}
            />
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="content"
          control={form.control}
          render={({ field }) => (
            <Textarea
              placeholder="Digite o conteúdo do prompt..."
              variant="transparent"
              size="lg"
              {...field}
            />
          )}
        />
      </FieldGroup>
    </form>
  );
}
