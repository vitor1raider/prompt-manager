import { Logo } from '@/components/logo/logo';
import { render, screen } from '@testing-library/react';

describe('Logo', () => {
  it('should render the logo with the correct text', () => {
    render(<Logo />);

    const logoElement = screen.getByRole('link', { name: 'PROMPTS' });
    expect(logoElement).toBeVisible();
  });
});
