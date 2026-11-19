import {
  fireEventAsync,
  renderAsync,
  screen,
} from '@testing-library/react-native';
import { useForm } from 'react-hook-form';

import { RegisterAccess } from '@/components/screens/Register/RegisterAccess';
import { RegisterTerms } from '@/components/screens/Register/RegisterTerms';
import {
  RegisterForm,
  requiresGuardian,
} from '@/validation/Register.validation';

const terms = {
  title: 'Termo do Estudante',
  content: 'Documento do estudante',
  version: '1.2',
};
const privacy = {
  title: 'Política de Privacidade',
  content: 'Documento de privacidade',
  version: '1.3',
};
const Fields = ({ birthDate }: { birthDate: string }) => {
  const { control } = useForm<RegisterForm>({
    defaultValues: {
      birthDate,
      guardianName: '',
      guardianEmail: '',
      termsAccepted: false,
      privacyAccepted: false,
    },
  });
  return (
    <>
      <RegisterAccess
        control={control}
        photo={null}
        onPhotoChange={jest.fn()}
      />

      {(['terms', 'privacy'] as const).map(kind => (
        <RegisterTerms
          key={kind}
          control={control}
          error={false}
          kind={kind}
          loading={false}
          privacy={privacy}
          retry={jest.fn()}
          terms={
            requiresGuardian(birthDate)
              ? terms
              : { ...terms, title: 'Termos Gerais' }
          }
        />
      ))}
    </>
  );
};

beforeEach(() => jest.useFakeTimers().setSystemTime(new Date(2026, 10, 15)));
afterEach(() => jest.useRealTimers());

it.each([
  ['16/11/2008', true],
  ['15/11/2008', false],
])(
  'exibe o responsável ao lado dos dados de acesso conforme a idade (%s)',
  async (birthDate, minor) => {
    await renderAsync(<Fields birthDate={birthDate as string} />);
    expect(screen.getByLabelText('E-mail')).toBeOnTheScreen();
    expect(!!screen.queryByLabelText('Nome do responsável legal')).toBe(minor);
    expect(!!screen.queryByLabelText('E-mail do responsável legal')).toBe(
      minor,
    );
  },
);

it('exibe os dois documentos e mantém os aceites independentes', async () => {
  await renderAsync(<Fields birthDate="15/11/2008" />);
  expect(screen.getByText(terms.content)).toBeOnTheScreen();
  expect(screen.getByText(privacy.content)).toBeOnTheScreen();
  expect(screen.getByText('Termos Gerais')).toBeOnTheScreen();
  expect(screen.getByText('Li e concordo com o termo')).toBeOnTheScreen();
  expect(
    screen.getByText('Li e concordo com a Política de Privacidade'),
  ).toBeOnTheScreen();
  const [student, policy] = screen.getAllByRole('checkbox');
  expect(student).not.toBeChecked();
  expect(policy).not.toBeChecked();
  await fireEventAsync.press(student);
  expect(student).toBeChecked();
  expect(policy).not.toBeChecked();
  await fireEventAsync.press(policy);
  expect(policy).toBeChecked();
});

it('mantém a ciência do termo do estudante para menores', async () => {
  await renderAsync(<Fields birthDate="16/11/2008" />);
  expect(
    screen.getByText('Li e estou ciente do Termo do Estudante'),
  ).toBeOnTheScreen();
  expect(screen.queryByText('Li e concordo com o termo')).not.toBeOnTheScreen();
});
