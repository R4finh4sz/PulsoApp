# Testes unitários

O app usa Jest 29, `jest-expo` 53 e React Native Testing Library 13.3,
com `react-test-renderer` na mesma versão do React (19.0.0).
Não é necessário abrir emulador nem iniciar o backend.

A organização segue o PulsoWeb:

- `auth/`: autenticação, restauração e expiração de sessão, 2FA, termos, cadastro, localização por CEP, foto de perfil, validações e formulários.
- `main/`: telas Home, Teams, Reports e Profile, fluxo do quiz, correção por conteúdo, serviços, stores, hooks, utilitários e componentes compartilhados.
- `setup.ts`: mocks de módulos nativos, roteamento e navegação.
- `mocks/`: substitutos de SVG e CSS para execução no Jest.

## Comandos

```sh
yarn test
yarn test:auth
yarn test:main
yarn test:watch
yarn test:coverage
```

Os mesmos scripts funcionam com `npm run`. Para executar apenas um arquivo:

```sh
yarn test tests/auth/services.test.ts --runInBand
```

## Cobertura

O relatório HTML fica em `coverage/index.html`. A cobertura considera todos os
arquivos TypeScript de `app`, `components`, `contexts`, `hooks`, `services`, `store`,
`utils` e `validation`, inclusive os ainda sem testes. Apenas arquivos de dados
`mock.ts` e `mock.tsx` são excluídos, mantendo o escopo original.

`yarn test:coverage` exige pelo menos **70%** global de linhas, instruções, funções
e ramificações; o comando falha se qualquer métrica ficar abaixo da meta.

Na validação de 08/10/2026, passaram 194 testes em 22 suítes: **79,71%** de linhas,
**79,91%** de instruções, **81,15%** de funções e **74,12%** de ramificações.
Esses números medem execução de código, não percentual de funcionalidades garantidas.
Ainda há lacunas, como o fluxo completo do cadastro e a inicialização do app.
Os testes simulam serviços externos e recursos nativos; testes em dispositivo
continuam necessários para câmera, teclado, animações e navegação real.

## Adicionando testes

Crie arquivos `*.test.ts` para lógica e `*.test.tsx` para componentes no grupo
correspondente. Mantenha os testes fora de `app/`, pois essa pasta contém rotas
do Expo Router. Use o alias `@/` para importar o código real.

Teste o comportamento visível com `renderAsync`, `screen` e `userEvent`.
Simule o transporte HTTP em testes de serviços, sem realizar chamadas reais.
Os testes de serviços forçam `isMockEnabled: false` para validar os contratos HTTP,
independentemente do `.env` local. Limpe stores e mocks entre cenários.
