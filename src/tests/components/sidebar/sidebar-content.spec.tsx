import {
  SidebarContent,
  SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => mockSearchParams,
}));

const makeSut = (
  { prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps
) => {
  return render(<SidebarContent prompts={prompts} />);
};

const initialPrompts = [
  {
    id: '1',
    title: 'Prompt 1',
    content: 'Content 1',
  },
];

describe('SidebarContent', () => {
  const user = userEvent.setup();

  describe('base', () => {
    it('should render a new prompt button', () => {
      makeSut();

      expect(screen.getByRole('complementary')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Novo Prompt' })
      ).toBeInTheDocument();
    });

    it('should render a list of prompts', () => {
      const input = [
        {
          id: '1',
          title: 'Prompt 1',
          content: 'Content 1',
        },
        {
          id: '2',
          title: 'Prompt 2',
          content: 'Content 2',
        },
      ];
      makeSut({ prompts: input });

      expect(screen.getByText(input[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole('paragraph')).toHaveLength(input.length);
    });

    it('should update the input search value when typing', async () => {
      const text = 'Prompt 1';
      makeSut();

      const searchInput = screen.getByPlaceholderText(
        /pesquisar prompts/i
      ) as HTMLInputElement;

      await user.type(searchInput, text);

      expect(searchInput.value).toBe(text);
    });
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

    it('should expand again when clicking the expand button', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar menu/i,
      });

      await user.click(collapseButton);

      const expandButton = screen.getByRole('button', {
        name: /expandir menu/i,
      });

      await user.click(expandButton);

      expect(
        screen.getByRole('button', { name: /minimizar menu/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('navigation', { name: /lista de prompts/i })
      ).toBeVisible();
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

    it('should show the new prompt button when the sidebar is collapsed', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar menu/i,
      });

      await user.click(collapseButton);

      const newPromptButton = screen.getByRole('button', {
        name: /novo prompt/i,
      });

      expect(newPromptButton).toBeVisible();
    });

    it.only('not should show the list of prompts when the sidebar is collapsed', async () => {
      makeSut();

      const collapseButton = screen.getByRole('button', {
        name: /minimizar menu/i,
      });

      await user.click(collapseButton);

      const nav = screen.queryByRole('navigation', {
        name: /lista de prompts/i,
      });

      expect(nav).not.toBeInTheDocument();
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

  describe('search', () => {
    it('should navigate with the encoded URL when typing and clear the search', async () => {
      const text = 'A B';
      makeSut();

      const searchInput = screen.getByPlaceholderText(
        /pesquisar prompts/i
      ) as HTMLInputElement;

      await user.type(searchInput, text);

      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(`/?q=A%20B`);

      await user.clear(searchInput);
      const lastClearCall = pushMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe(`/`);
    });

    it('should submit the form when entering a search term', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);
      const text = 'Prompt 1';
      makeSut();

      const searchInput = screen.getByPlaceholderText(
        /pesquisar prompts/i
      ) as HTMLInputElement;

      await user.type(searchInput, text);

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });

    it('should automatically submit the form on mount when a query is present', async () => {
      const submitSpy = jest
        .spyOn(HTMLFormElement.prototype, 'requestSubmit')
        .mockImplementation(() => undefined);

      const text = 'Prompt 1';
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;
      makeSut();

      expect(submitSpy).toHaveBeenCalled();
      submitSpy.mockRestore();
    });
  });

  it('should initialize the search input with the query parameter from the URL', () => {
    const text = 'inicial';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();
    const searchInput = screen.getByPlaceholderText('Pesquisar prompts');

    expect(searchInput).toHaveValue(text);
  });
});
