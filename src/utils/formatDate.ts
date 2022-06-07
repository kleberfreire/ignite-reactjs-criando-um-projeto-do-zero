import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export function dateFormatted(date: string): string {
  return format(
    new Date(
      format(new Date(date), 'dd MMM yyyy', {
        locale: ptBR,
      })
    ),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );
}
