# Integração do aluno

Contrato conferido no repositório local `../PulsoBackend`.
Todos os caminhos abaixo têm o prefixo `/api`.

## Conectado nesta alteração

| Método e rota                          | Uso no app                                                             |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `GET /student/activities`              | Pendentes, concluídas, filtros por turma/disciplina, Home e Relatórios |
| `GET /activities/{id}/quiz`            | Questões e alternativas reais                                          |
| `POST /activities/{id}/submissions`    | Entrega das respostas, com React Query e atualização da lista          |
| `GET /submissions/{id}/result`         | Nota e desempenho por tema após correção do professor                  |
| `POST /auth/password-recovery/request` | Solicitar código de recuperação                                        |
| `POST /auth/password-recovery/verify`  | Validar código de recuperação                                          |
| `POST /auth/password-recovery/reset`   | Salvar senha com o token de recuperação                                |
| `PATCH /auth/password`                | Trocar senha pelo perfil com `currentPassword` e `newPassword`          |
| `GET /me/profile`                      | Perfil completo com escolas e solicitação de exclusão                  |
| `GET /me/photo`                        | Foto autenticada do perfil                                             |
| `GET /notifications`                  | Lista de notificações do aluno                                         |
| `PATCH /notifications/{id}/read`      | Marcar uma notificação como lida                                        |

Turmas, disciplinas, autenticação, cadastro e termos já tinham serviços.
O modo de demonstração continua disponível com `EXPO_PUBLIC_USE_MOCK=true`.
Para usar a API, desative esse modo e configure `EXPO_PUBLIC_API_URL` para um endereço acessível pelo dispositivo.

O perfil exibe a escola ativa, as escolas vinculadas, a turma e a última solicitação de exclusão.
A foto autenticada é compartilhada entre Perfil e os cabeçalhos de Home, Matérias e Relatórios via React Query, sem cache de imagem em disco. Se não houver foto, o app mantém as iniciais ou o ícone. O perfil permite atualizar os dados puxando a tela para baixo.

## Rotas disponíveis que ainda precisam de fluxo no app

| Método e rota                                               | O que falta                                        |
| ----------------------------------------------------------- | -------------------------------------------------- |
| `PATCH /me/active-school`                                   | Troca de escola ativa e limpeza dos dados em cache |
| `GET /me/school-invitations`                                | Convites recebidos                                 |
| `PATCH /me/school-invitations/{id}`                         | Responder convite                                  |
| `GET /me/export`                                            | Exportação dos dados pessoais                      |
| `POST /me/deletion-requests`                                | Solicitação de exclusão da conta                   |
| `GET /me/deletion-requests`                                 | Acompanhamento da solicitação                      |
| `GET /rankings/students?year=...&bimester=...&schoolId=...` | Ranking com seleção de período; escola é opcional  |
| `GET /classrooms/{classroomId}/subjects/{subjectId}/themes` | Consulta separada dos temas da disciplina          |

As rotas de criação/correção de atividades, gestão de alunos e matrícula são administrativas e não pertencem ao fluxo do aluno.
O backend não oferece uma rota de alteração direta da senha autenticada com o formulário atual de `ResetPassword`; a recuperação exige código e token.

## Limites do contrato

- Pendentes na Home e nas listas são somente atividades com `status: OPEN` e sem `submission`. Atividades vencidas sem entrega não entram nesse grupo. Concluídas são as entregas do aluno, mesmo que o prazo continue aberto ou a correção ainda esteja pendente.

### Conferência de cadastro e termos

| Rota                  | Resultado da comparação com o backend                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /schools/search` | Corrigido: consulta pública pelo CEP informado e todas as páginas; antes retornava escolas fictícias também fora do modo mock                    |
| `POST /auth/register` | Multipart `data` + `photo` opcional compatível; escola enviada como número, nascimento em ISO, e-mail normalizado e confirmação de senha omitida |
| `GET /terms`          | Documento público com `title`, `version` e `content` compatível tanto no cadastro quanto no app                                                  |
| `GET /terms/accepted` | Lista de versões aceitas pelo usuário autenticado compatível                                                                                     |
| `POST /terms/accept`  | Corpo `{ version, termsAccepted: true }` compatível                                                                                              |

O cadastro valida nome e sobrenome, idade mínima de 15 anos, RA numérico, escola positiva, e-mail com até 254 caracteres e senha entre 8 caracteres e 72 bytes UTF-8. Após falha no envio, recarrega os termos e exige novo aceite para permitir recuperar uma versão desatualizada.
O backend recebe o cadastro como solicitação pendente de aprovação; o app já informa isso na conclusão. Fotos passam pela validação do servidor (JPEG/PNG, até 2 MB e 4 milhões de pixels).
O histórico `GET /terms/history` existe no backend e ainda não é exibido no app.
Verificação: testes automatizados do app e comparação dos controllers/DTOs/services locais. Na revisão inicial, a tentativa HTTP em `http://localhost:8080/api/terms` recebeu `ECONNREFUSED`. Com o servidor disponível, `GET /schools/search?cep=08970000` respondeu HTTP 200 com duas escolas; a consulta por `city=Salesópolis&state=SP` retornou zero porque essas escolas estão cadastradas como São Paulo/SP. O app usa agora o CEP diretamente. Não houve teste de cadastro real nem execução dos testes Java do backend.

- A nota é calculada pelo professor: uma entrega sem `gradedAt` aparece como aguardando correção.
- A API não retorna título, professor ou habilidades da atividade. O app usa `Atividade {id}`, mostra a disciplina quando disponível e usa os temas reais das questões.
- Os relatórios calculam a média das notas corrigidas retornadas para a turma/escola ativa, sem inventar notas para entregas pendentes de correção.
- A busca de escolas foi validada no servidor ativo; o fluxo completo em dispositivo físico ainda não foi validado.
