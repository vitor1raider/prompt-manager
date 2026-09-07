import { DeletePromptUseCase } from '@/core/application/prompts/delete-prompt.use-case';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

const makeRepository = (
  overrides: Partial<PromptRepository> = {} as PromptRepository
) => {
  const base = {
    delete: jest.fn(async () => {}),
    findById: jest.fn(async () => {}),
  };

  return { ...base, ...overrides } as PromptRepository;
};

describe('DeletePromptUseCase', () => {
  it('should return a success message when the prompt is deleted', async () => {
    const now = new Date();
    const prompt = {
      id: '1',
      title: 'Prompt 1',
      content: 'Content 1',
      createdAt: now,
      updatedAt: now,
    };
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue(prompt),
      delete: jest.fn().mockResolvedValue(undefined),
    });

    const useCase = new DeletePromptUseCase(repository);
    const result = await useCase.execute(prompt.id);

    expect(result).toBeUndefined();
    expect(repository.delete).toHaveBeenCalledWith(prompt.id);
  });

  it('should throw an error PROMPT_NOT_FOUND when the prompt is not found', async () => {
    const repository = makeRepository({
      findById: jest.fn().mockResolvedValue(null),
    });

    const useCase = new DeletePromptUseCase(repository);

    await expect(useCase.execute('1')).rejects.toThrow('PROMPT_NOT_FOUND');
  });
});
