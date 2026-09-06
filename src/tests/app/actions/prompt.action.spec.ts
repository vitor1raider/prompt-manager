import { searchPromptAction } from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

const mockedSearchExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
  });

  describe('searchPromptAction', () => {
    it('should return success when the prompt search is not empty', async () => {
      const input = [{ id: '1', title: 'Prompt 1', content: 'Content 1' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', 'test');

      const result = await searchPromptAction({ success: false }, formData);
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return success and list all prompts when the search is empty', async () => {
      const input = [
        { id: '1', title: 'Prompt 1', content: 'Content 1' },
        { id: '2', title: 'Prompt 2', content: 'Content 2' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '');
      const result = await searchPromptAction(
        { success: false },
        new FormData()
      );
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should return error when the prompt search fails', async () => {
      const error = new Error('Search failed');
      mockedSearchExecute.mockRejectedValue(error);

      const formData = new FormData();
      formData.append('q', 'test');
      const result = await searchPromptAction({ success: false }, formData);
      expect(result.success).toBe(false);
      expect(result.prompts).toBe(undefined);
      expect(result.message).toBe('Falha ao buscar prompts');
    });

    it('should trim the search query before executing the search', async () => {
      const input = [{ id: '1', title: 'Prompt 1', content: 'Content 1' }];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();
      formData.append('q', '    Prompt 1       ');

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('Prompt 1');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });

    it('should search for all prompts when the search query is empty', async () => {
      const input = [
        { id: '1', title: 'firs title', content: 'Content 1' },
        { id: '2', title: 'second title', content: 'Content 2' },
      ];
      mockedSearchExecute.mockResolvedValue(input);

      const formData = new FormData();

      const result = await searchPromptAction({ success: true }, formData);

      expect(mockedSearchExecute).toHaveBeenCalledWith('');
      expect(result.success).toBe(true);
      expect(result.prompts).toEqual(input);
    });
  });
});
