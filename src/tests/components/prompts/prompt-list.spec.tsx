import {
  PromptList,
  type PromptListProps,
} from '@/components/prompts/prompt-list';
import { render, screen } from '@/lib/test-utils';

const makeSut = ({ prompts }: PromptListProps) => {
  return render(<PromptList prompts={prompts} />);
};

describe('PromptList', () => {
  it('should display a list of prompts', () => {
    const prompts = [
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
    makeSut({ prompts });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Prompt 1')).toBeInTheDocument();
    expect(screen.getByText('Prompt 2')).toBeInTheDocument();
  });

  it('should display an empty list when no prompts are provided', () => {
    const prompts = [] as PromptListProps['prompts'];
    makeSut({ prompts });

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);
  });
});
