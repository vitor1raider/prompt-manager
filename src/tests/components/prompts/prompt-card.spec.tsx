import {
  PromptCard,
  type PromptCardProps,
} from '@/components/prompts/prompt-card';
import { render, screen } from '@/lib/test-utils';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

const deleteMock = jest.fn();
jest.mock('@/app/actions/prompt.actions', () => ({
  deletePromptAction: (id: string) => deleteMock(id),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const makeSut = ({ prompt }: PromptCardProps) => {
  return render(<PromptCard prompt={prompt} />);
};

describe('PromptCard', () => {
  const user = userEvent.setup();
  const prompt = {
    id: '1',
    title: 'Prompt 1',
    content: 'Content 1',
  };

  it('should display the prompt title as a link', () => {
    makeSut({ prompt });
    const link = screen.getByRole('link');

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `/${prompt.id}`);
  });

  it('should display a delete button', async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);

    expect(screen.getByText('Remover Prompt')).toBeInTheDocument();
  });

  it('should show a success message when the prompt is deleted', async () => {
    deleteMock.mockResolvedValue({
      success: true,
      message: 'Prompt removido com sucesso',
    });
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.success).toHaveBeenCalledWith('Prompt removido com sucesso');
  });

  it('should show an error message when the prompt deletion fails', async () => {
    const errorMessage = 'Erro ao remover o prompt';
    deleteMock.mockResolvedValue({
      success: false,
      message: errorMessage,
    });
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });

  it('should show an error message when the prompt deletion throws an error', async () => {
    const errorMessage = 'Erro ao remover o prompt';
    deleteMock.mockRejectedValueOnce(new Error(errorMessage));
    makeSut({ prompt });

    const deleteButton = screen.getByRole('button', { name: 'Remover Prompt' });
    await user.click(deleteButton);
    await user.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
  });
});
