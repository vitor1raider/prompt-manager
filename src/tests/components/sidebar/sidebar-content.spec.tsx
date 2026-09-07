import {
  SidebarContent,
  SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const pushMock = jest.fn();
const setQueryMock = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock('nuqs', () => ({
  useQueryState: (key: string) => {
    const [value, setValue] = useState(mockSearchParams.get(key) || '');
    const setQuery = (nextValue: string) => {
      setQueryMock(nextValue);
      setValue(nextValue);
    };

    return [value, setQuery] as const;
  },
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

      expect(screen.getByRole('complementary')).toBeInTheDocument();
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

  describe('SidebarContent - Mobile', () => {
    it('should open and close the mobile menu', async () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside.className).toContain('-translate-x-full');
      expect(aside.className).toContain('w-0');

      const openButton = screen.getByRole('button', { name: 'Abrir menu' });
      await user.click(openButton);
      expect(aside.className).toContain('translate-x-0');
      expect(aside.className).toContain('w-[80vw]');

      const closeButton = screen.getByRole('button', { name: 'Fechar menu' });
      await user.click(closeButton);
      expect(aside.className).toContain('-translate-x-full');
      expect(aside.className).toContain('w-0');
    });

    it('should minimize and expand the open mobile menu', async () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
      expect(aside.className).toContain('w-[80vw]');

      await user.click(screen.getByRole('button', { name: /minimizar menu/i }));
      expect(aside.className).toContain('w-18');

      await user.click(screen.getByRole('button', { name: /expandir menu/i }));
      expect(aside.className).toContain('w-[80vw]');
    });

    it('should close the collapsed mobile menu when creating a prompt', async () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      await user.click(screen.getByRole('button', { name: 'Abrir menu' }));
      await user.click(screen.getByRole('button', { name: /minimizar menu/i }));
      await user.click(screen.getByRole('button', { name: 'Novo Prompt' }));

      expect(aside.className).toContain('w-0');
      expect(aside.className).toContain('-translate-x-full');
      expect(
        screen.getByRole('button', { name: 'Abrir menu' })
      ).toHaveAttribute('aria-expanded', 'false');
      expect(pushMock).toHaveBeenCalledWith('/new');
    });
  });

  describe('when the sidebar is collapsed', () => {
    it('should render the expand button', () => {
      makeSut();

      const aside = screen.getByRole('complementary');
      expect(aside).toBeInTheDocument();

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
      ).toBeInTheDocument();
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

      expect(newPromptButton).toBeInTheDocument();
    });

    it('not should show the list of prompts when the sidebar is collapsed', async () => {
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

      expect(setQueryMock).toHaveBeenCalled();
      const lastCall = setQueryMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(text);

      await user.clear(searchInput);
      const lastClearCall = setQueryMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe('');
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

  it('should initialize the search input with the query parameter from the URL', async () => {
    const text = 'inicial';
    const searchParams = new URLSearchParams(`q=${text}`);
    mockSearchParams = searchParams;
    makeSut();
    const searchInput = screen.getByPlaceholderText('Pesquisar prompts');

    await waitFor(() => {
      expect(searchInput).toHaveValue(text);
    });
  });
});
