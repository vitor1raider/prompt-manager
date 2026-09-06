import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

describe('SearchPromptUseCase', () => {
  const input: Prompt[] = [
    {
      id: '1',
      title: 'Prompt 1',
      content: 'Content 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Prompt 2',
      content: 'Content 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const repository: PromptRepository = {
    findMany: async () => input,
    searchMany: async (term) =>
      input.filter(
        (prompt) =>
          prompt.title.toLowerCase().includes(term.toLocaleLowerCase()) ||
          prompt.content.toLowerCase().includes(term.toLocaleLowerCase())
      ),
  } as PromptRepository;

  it('should return all prompts when the search term is empty', async () => {
    const useCase = new SearchPromptsUseCase(repository);

    const results = await useCase.execute('');
    expect(results).toHaveLength(2);
  });

  it('should return filtered prompts when the search term is provided', async () => {
    const useCase = new SearchPromptsUseCase(repository);
    const query = 'prompt 1';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('1');
  });

  it('should return all prompts when the search term is only whitespace', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = '         ';

    const results = await useCase.execute(query);

    expect(results).toHaveLength(2);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });

  it('should trim whitespace when searching for terms', async () => {
    const firstElement = input.slice(0, 1);
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue(firstElement);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = ' title 2 ';

    const results = await useCase.execute(query);

    expect(results).toMatchObject(firstElement);
    expect(searchMany).toHaveBeenCalledWith(query.trim());
    expect(findMany).not.toHaveBeenCalled();
  });

  it('should return all prompts when the search term is null or undefined', async () => {
    const findMany = jest.fn().mockResolvedValue(input);
    const searchMany = jest.fn().mockResolvedValue([]);
    const repositoryWithSpies: PromptRepository = {
      ...repository,
      findMany,
      searchMany,
    };

    const useCase = new SearchPromptsUseCase(repositoryWithSpies);
    const query = undefined as unknown as string;

    const results = await useCase.execute(query);

    expect(results).toMatchObject(input);
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(searchMany).not.toHaveBeenCalled();
  });
});
