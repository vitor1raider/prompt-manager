import { PromptForm, PromptFormProps } from '@/components/prompts/prompt-form';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const refreshMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

const createActionMock = jest.fn();
const updateActionMock = jest.fn();

jest.mock('@/app/actions/prompt.actions', () => ({
  createPromptAction: (...args: unknown[]) => createActionMock(...args),
  updatePromptAction: (...args: unknown[]) => updateActionMock(...args),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const makeSut = ({ prompt }: PromptFormProps = {} as PromptFormProps) => {
  return render(<PromptForm prompt={prompt} />);
};

describe('PromptForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    createActionMock.mockReset();
    updateActionMock.mockReset();
    refreshMock.mockReset();
    (toast.success as jest.Mock).mockReset();
    (toast.error as jest.Mock).mockReset();
  });

  it('should create a new prompt with success', async () => {
    const successMessage = 'Prompt criado com sucesso';
    createActionMock.mockResolvedValueOnce({
      success: true,
      message: successMessage,
    });
    makeSut();

    const titleInput = screen.getByPlaceholderText('Título do prompt');
    await user.type(titleInput, 'title');
    const contentInput = screen.getByPlaceholderText(
      'Digite o conteúdo do prompt...'
    );
    await user.type(contentInput, 'content');

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(createActionMock).toHaveBeenCalledWith({
      title: 'title',
      content: 'content',
    });

    expect(toast.success).toHaveBeenCalledWith(successMessage);
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it('should display an error message when creation fails', async () => {
    const errorMessage = 'Erro ao criar prompt';
    createActionMock.mockResolvedValueOnce({
      success: false,
      message: errorMessage,
    });
    makeSut();

    const titleInput = screen.getByPlaceholderText('Título do prompt');
    await user.type(titleInput, 'title');
    const contentInput = screen.getByPlaceholderText(
      'Digite o conteúdo do prompt...'
    );
    await user.type(contentInput, 'content');

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('should display validation errors when fields are empty', async () => {
    makeSut();

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(screen.getByText('O título é obrigatório')).toBeVisible();
    expect(screen.getByText('O conteúdo é obrigatório')).toBeVisible();
    expect(createActionMock).not.toHaveBeenCalled();
  });

  it('should update an existing prompt with success', async () => {
    updateActionMock.mockResolvedValueOnce({
      success: true,
      message: 'Prompt atualizado com sucesso',
    });
    const now = new Date();
    const prompt = {
      id: '1',
      title: 'Prompt 1',
      content: 'Content 1',
      createdAt: now,
      updatedAt: now,
    };
    makeSut({ prompt });
    const titleInput = screen.getByPlaceholderText('Título do prompt');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Title');

    const contentInput = screen.getByPlaceholderText(
      'Digite o conteúdo do prompt...'
    );
    await user.clear(contentInput);
    await user.type(contentInput, 'Updated Content');

    const submitButton = screen.getByRole('button', { name: 'Salvar' });
    await user.click(submitButton);

    expect(updateActionMock).toHaveBeenCalledWith({
      id: prompt.id,
      title: 'Updated Title',
      content: 'Updated Content',
    });

    expect(toast.success).toHaveBeenCalledWith('Prompt atualizado com sucesso');
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
