import { renderAsync, screen } from '@testing-library/react-native';

import ErrorText from '@/components/ui/ErrorText';
import { TabPlaceholder } from '@/components/ui/TabPlaceholder';

it('exibe o erro e o remove quando o campo é corrigido', async () => {
  const { rerenderAsync } = await renderAsync(
    <ErrorText text="Campo obrigatório" />,
  );
  expect(screen.getByText('Campo obrigatório')).toBeOnTheScreen();
  await rerenderAsync(<ErrorText />);
  expect(screen.queryByText('Campo obrigatório')).not.toBeOnTheScreen();
});

it('exibe o título e a mensagem da aba indisponível', async () => {
  await renderAsync(
    <TabPlaceholder message="Nenhum relatório disponível" title="Relatórios" />,
  );
  expect(screen.getByText('Relatórios')).toBeOnTheScreen();
  expect(screen.getByText('Nenhum relatório disponível')).toBeOnTheScreen();
});
