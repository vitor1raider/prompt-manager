import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

type CopyButtonProps = {
  content: string;
};

export function CopyButton({ content }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const isContentEmpty = !content.trim();

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCopy = async () => {
    const text = content.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      clearTimer();

      timerRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      const _error = error as Error;
      toast.error(`Erro ao copiar: ${_error.message}`);
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="disabled:opacity-50 border border-gray-200"
      disabled={isContentEmpty}
      onClick={handleCopy}
    >
      {isCopied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span>{isCopied ? 'Copiado' : 'Copiar'}</span>
    </Button>
  );
}
