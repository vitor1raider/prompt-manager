import {
  createPromptAction,
  deletePromptAction,
  searchPromptAction,
  updatePromptAction,
} from '@/app/actions/prompt.actions';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockedSearchExecute = jest.fn();
const mockedCreateExecute = jest.fn();
const mockedUpdateExecute = jest.fn();
const mockedDeleteExecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
  SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedSearchExecute,
  })),
}));

jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
  CreatePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedCreateExecute,
  })),
}));

jest.mock('@/core/application/prompts/update-prompt.use-case', () => ({
  UpdatePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedUpdateExecute,
  })),
}));

jest.mock('@/core/application/prompts/delete-prompt.use-case', () => ({
  DeletePromptUseCase: jest.fn().mockImplementation(() => ({
    execute: mockedDeleteExecute,
  })),
}));

describe('Server Actions: Prompts', () => {
  beforeEach(() => {
    mockedSearchExecute.mockReset();
    mockedCreateExecute.mockReset();
    mockedUpdateExecute.mockReset();
    mockedDeleteExecute.mockReset();
    (revalidatePath as jest.Mock).mockReset();
  });

  describe('createPromptAction', () => {
    it('should return success when the prompt is created successfully', async () => {
      mockedCreateExecute.mockResolvedValue(undefined);

      const data = { title: 'New Prompt', content: 'Some content' };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Prompt criado com sucesso');
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });

    it('should return error when the prompt data is invalid', async () => {
      const data = { title: '', content: '' };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });

    it('should return error when the PROMPT_ALREADY_EXISTS error is thrown', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('PROMPT_ALREADY_EXISTS'));

      const data = { title: 'Existing Prompt', content: 'Some content' };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Este prompt já existe');
    });

    it('should return error when an unexpected error is thrown', async () => {
      mockedCreateExecute.mockRejectedValue(new Error('UNKNOWN'));

      const data = { title: 'New Prompt', content: 'Some content' };

      const result = await createPromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Falha ao criar prompt');
    });
  });

  describe('updatePromptAction', () => {
    it('should return success when the prompt is updated successfully', async () => {
      mockedUpdateExecute.mockResolvedValue({});
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const result = await updatePromptAction(data);

      expect(result).toMatchObject({
        success: true,
        message: 'Prompt atualizado com sucesso',
      });
    });

    it('should return validation error when the prompt data is invalid', async () => {
      const data = { id: '1', title: '', content: '' };

      const result = await updatePromptAction(data);

      expect(result?.success).toBe(false);
      expect(result?.message).toBe('Erro de validação');
      expect(result?.errors).toBeDefined();
    });

    it('should return PROMPT_NOT_FOUND when the prompt does not exist', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('PROMPT_NOT_FOUND'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });

    it('should return error when an unexpected error is thrown', async () => {
      mockedUpdateExecute.mockRejectedValue(new Error('UNKNOWN'));
      const promptId = '1';
      const data = {
        id: promptId,
        title: 'Updated Title',
        content: 'Updated Content',
      };

      const result = await updatePromptAction(data);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao atualizar o prompt');
    });
  });

  describe('deletePromptAction', () => {
    it('should return success when the prompt is deleted successfully', async () => {
      mockedDeleteExecute.mockResolvedValue(undefined);
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result).toMatchObject({
        success: true,
        message: 'Prompt removido com sucesso',
      });
      expect(revalidatePath).toHaveBeenCalledTimes(1);
    });

    it('should return error when the id is empty', async () => {
      const promptId = '';
      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ID do prompt não fornecido');
    });

    it('should return error when the prompt is not found', async () => {
      const errorMsg = 'PROMPT_NOT_FOUND';
      mockedDeleteExecute.mockRejectedValue(new Error(errorMsg));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Prompt não encontrado');
    });

    it('should return error when an unexpected error is thrown', async () => {
      const errorMsg = 'UNKNOWN_ERROR';
      mockedDeleteExecute.mockRejectedValue(new Error(errorMsg));
      const promptId = '1';

      const result = await deletePromptAction(promptId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Falha ao remover o prompt');
    });
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
