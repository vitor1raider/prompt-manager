import { PromptRepository } from '@/core/domain/prompts/prompt.repository';
import { UpdatePromptDTO } from './update-prompt.dto';

export class UpdatePromptUseCase {
  constructor(private readonly promptRepository: PromptRepository) {}

  async execute(data: UpdatePromptDTO): Promise<void> {
    const existingPrompt = await this.promptRepository.findById(data.id);
    if (!existingPrompt) {
      throw new Error('PROMPT_NOT_FOUND');
    }

    await this.promptRepository.update(data.id, {
      title: data.title,
      content: data.content,
    });
  }
}
