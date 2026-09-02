# Visão geral do Pulso Escolar Mobile

O **Pulso Escolar Mobile** integra o projeto de TCC Pulso Escolar, uma plataforma voltada ao acompanhamento da aprendizagem de estudantes do Ensino Médio. O aplicativo é destinado aos alunos e funciona em conjunto com a aplicação Web utilizada por administradores, coordenadores pedagógicos e professores.

## Proposta

O aplicativo foi idealizado para facilitar a participação dos estudantes em atividades avaliativas curtas e permitir que acompanhem seus próprios resultados. No escopo inicial do projeto, o aluno será adicionado à turma pela instituição e, por meio do aplicativo, poderá consultar as atividades disponibilizadas pelo professor, responder a questões objetivas e visualizar seu desempenho individual.

A proposta parte do entendimento de que uma nota geral nem sempre demonstra claramente em quais conteúdos ou habilidades o estudante apresenta maior dificuldade. Por isso, após a realização das atividades, o Pulso Escolar organiza os resultados em percentuais de acertos, permitindo que o aluno reconheça os assuntos que domina e aqueles que precisam de maior atenção.

## Funcionamento no projeto

O professor utilizará a aplicação Web para cadastrar questões, relacioná-las a conteúdos e habilidades e publicar atividades para suas turmas. O estudante realizará essas atividades pelo aplicativo Mobile. Após o envio das respostas, o sistema fará a correção automática com base no gabarito cadastrado e apresentará o resultado individual ao aluno.

Além da realização das atividades, o aplicativo permitirá o acesso à conta, a recuperação e alteração de senha, a consulta das matérias e turmas vinculadas, a visualização das atividades disponíveis e concluídas e o acompanhamento do desempenho acadêmico dentro da plataforma.

Como possibilidade de evolução futura, poderá ser implementado o ingresso do estudante em uma turma por meio de um código de convite. Essa funcionalidade não faz parte do escopo inicial do aplicativo.

## Contribuição esperada

O Pulso Escolar Mobile busca aproximar o estudante do próprio processo de aprendizagem, oferecendo informações mais detalhadas do que apenas uma nota final. A ferramenta não substitui a avaliação ou a orientação do professor, mas atua como apoio ao acompanhamento contínuo da aprendizagem.

Os resultados serão apresentados de maneira individual, sem rankings ou exposição pública entre estudantes. Dessa forma, o aplicativo pretende contribuir para que o aluno compreenda melhor seu desempenho e identifique os conteúdos que necessitam de revisão.

## Desenvolvimento

O aplicativo será desenvolvido com **React Native**, **Expo** e **TypeScript**. A comunicação com o back-end ocorrerá por meio de uma API REST, responsável pela autenticação dos usuários, disponibilização das atividades, registro das respostas e cálculo dos indicadores de desempenho.

O desenvolvimento considerará requisitos de segurança, usabilidade, acessibilidade e proteção de dados pessoais e acadêmicos, de acordo com os princípios da Lei Geral de Proteção de Dados Pessoais (LGPD).
