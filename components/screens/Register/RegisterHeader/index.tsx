import { Text, View } from 'react-native';

const descriptions = [
  'Cadastre-se para ter acesso completo às funcionalidades.',
  'Informe seus dados para continuar.',
  'Informe os dados de onde é sua escola para continuar.',
  'Estamos quase lá! Informe seus dados de acesso para concluir seu cadastro com segurança.',
  'Para concluir seu cadastro, é necessário concordar com nossos Termos de Uso e Política de Privacidade.',
  'Seu cadastro foi enviado para análise de um coordenador. Aguarde o aviso no e-mail cadastrado.',
];
export const RegisterHeader = ({
  step,
  mock,
}: {
  step: number;
  mock: boolean;
}) => {
  let title = 'Cadastro';
  if (step === 0) {
    title = 'Vamos começar!';
  }
  if (step === 5) {
    title = 'Cadastro enviado\ncom sucesso!';
  }
  return (
    <View className="gap-3 pb-8 pt-5">
      <Text
        accessibilityRole="header"
        className="text-center font-poppins_bold text-2xl text-primary-100"
      >
        {title}
      </Text>

      <Text className="text-center font-poppins text-base leading-7 text-neutral-60">
        {step === 5 && mock
          ? 'Você concluiu a simulação do cadastro. Nenhuma conta foi criada ou enviada para aprovação.'
          : descriptions[step]}
      </Text>
    </View>
  );
};
