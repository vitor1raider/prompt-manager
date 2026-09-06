'use client';

import {
  CreatePromptDTO,
  createPromptSchema,
} from '@/core/application/prompts/create-prompt.dto';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldError } from '../ui/field';
import { useRouter } from 'next/navigation';
import {
  createPromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';
import { toast } from 'sonner';
import { CopyButton } from '../button-actions/copy-button';
import { Prompt } from '@/core/domain/prompts/prompt.entity';

type PromptFormProps = {
  prompt?: Prompt | null;
};

export function PromptForm({ prompt }: PromptFormProps) {
  const router = useRouter();

  const form = useForm<CreatePromptDTO>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: prompt?.title ?? '',
      content: prompt?.content ?? '',
    },
  });
  const content = useWatch({ control: form.control, name: 'content' });

  const isEdit = !!prompt?.id;

  const submit = async (data: CreatePromptDTO) => {
    const result = isEdit
      ? await updatePromptAction({ id: prompt.id, ...data })
      : await createPromptAction(data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.refresh();
  };

  return (
    <form action="" onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
        <CopyButton content={content} />
        <Button type="submit" size="sm">
          Salvar
        </Button>
      </header>

      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <Input
              placeholder="Título do prompt"
              variant="transparent"
              size="lg"
              autoFocus
              aria-invalid={fieldState.invalid}
              {...field}
            />

            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="content"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <Textarea
              placeholder="Digite o conteúdo do prompt..."
              variant="transparent"
              size="lg"
              aria-invalid={fieldState.invalid}
              {...field}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </form>
  );
}
