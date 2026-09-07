import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

export class DeletePromptUseCase {
  constructor(private readonly repository: PromptRepository) {}

  async execute(id: string): Promise<void> {
    const prompt = await this.repository.findById(id);
    if (!prompt) {
      throw new Error('PROMPT_NOT_FOUND');
    }

    await this.repository.delete(id);
  }
}
