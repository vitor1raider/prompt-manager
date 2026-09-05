import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const makeSut = () => {
  return render(<SidebarContent />);
};

describe('SidebarContent', () => {
  const user = userEvent.setup();
  it('should render a new prompt button', () => {
    makeSut();

    expect(screen.getByRole('complementary')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Novo Prompt' })
    ).toBeInTheDocument();
  });

  describe('when the sidebar is collapsed', () => {
    it('should render the expand button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeVisible();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar menu/i,
      });
      expect(collapseButton).toBeInTheDocument();
    });

    it('should render the expand button when the sidebar is collapsed', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar menu/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir menu/i,
      });

      expect(expandButton).toBeInTheDocument();
    });
  });

  describe('new prompt button', () => {
    it('should navigate to /new when clicked', async () => {
      makeSut();

      const newPromptButton = screen.getByRole('button', {
        name: 'Novo Prompt',
      });

      await user.click(newPromptButton);

      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });
});
