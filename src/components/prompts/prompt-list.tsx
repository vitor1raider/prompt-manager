import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PromptCard } from './prompt-card';

type PromptListProips = {
  prompts: PromptSummary[];
};

export function PromptList({ prompts }: PromptListProips) {
  return (
    <ul className="space-y-2">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </ul>
  );
}
