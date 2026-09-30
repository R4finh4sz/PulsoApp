import { QuizActivity } from './mock';

export type QuizQuestion = {
  prompt: string;
  content: string;
  options: string[];
  correct: number;
};

// Banco demonstrativo, limitado a dez questões por atividade.
export const getQuestions = (activity: QuizActivity): QuizQuestion[] => {
  const count = Math.min(10, Math.max(1, activity.questions));
  return Array.from({ length: count }, (_, index) => {
    const n = index + 1;
    let prompt: string;
    let content: string;
    let options: string[];
    if (activity.kind === 'reading') {
      const items = [
        [
          '“Ana levou o guarda-chuva porque iria chover.” Por que Ana levou o guarda-chuva?',
          'Compreensão',
          'Porque iria chover',
          'Porque fazia sol',
          'Porque estava nevando',
          'Porque estava com fome',
        ],
        [
          'Em “Pedro correu rapidamente”, qual palavra indica o modo da ação?',
          'Linguagem',
          'Rapidamente',
          'Pedro',
          'Correu',
          'Nenhuma',
        ],
        [
          '“Embora estivesse cansada, Lia estudou.” O que podemos concluir?',
          'Inferência',
          'Lia estudou apesar do cansaço',
          'Lia não estudou',
          'Lia não estava cansada',
          'Lia estava dormindo',
        ],
        [
          'Qual é a finalidade principal de uma notícia?',
          'Compreensão',
          'Informar sobre acontecimentos',
          'Ensinar uma receita',
          'Vender um produto',
          'Listar regras de um jogo',
        ],
        [
          'Em “O livro é uma viagem”, há qual recurso de linguagem?',
          'Linguagem',
          'Metáfora',
          'Uma medida de distância',
          'Uma ordem',
          'Uma pergunta',
        ],
        [
          '“A rua estava molhada e as pessoas fechavam os guarda-chuvas.” O que provavelmente aconteceu?',
          'Inferência',
          'Choveu há pouco',
          'Nevou o dia todo',
          'Faltou energia',
          'Houve uma festa',
        ],
        [
          'Qual palavra estabelece uma oposição em “Queria sair, mas choveu”?',
          'Linguagem',
          'Mas',
          'Queria',
          'Sair',
          'Choveu',
        ],
        [
          'Em “Maria encontrou Joana e entregou-lhe a carta”, quem recebeu a carta?',
          'Compreensão',
          'Joana',
          'Maria',
          'O carteiro',
          'Ninguém',
        ],
      ];
      const item = items[index % items.length];
      [prompt, content] = item;
      options = item.slice(2);
    } else if (activity.kind === 'science') {
      const items = [
        [
          'Qual ligação envolve transferência de elétrons?',
          'Ligação iônica',
          'Iônica',
          'Covalente',
          'Metálica',
          'De hidrogênio',
        ],
        [
          'Na ligação covalente, os átomos…',
          'Ligação covalente',
          'Compartilham elétrons',
          'Perdem prótons',
          'Criam nêutrons',
          'Destroem núcleos',
        ],
        [
          'Qual ligação explica a boa condução elétrica dos metais?',
          'Ligação metálica',
          'Metálica',
          'Iônica no estado sólido',
          'Covalente apolar',
          'De hidrogênio',
        ],
        [
          'Qual composto apresenta ligação iônica?',
          'Ligação iônica',
          'NaCl',
          'O₂',
          'H₂',
          'N₂',
        ],
        [
          'A molécula O₂ apresenta ligação…',
          'Ligação covalente',
          'Covalente',
          'Metálica',
          'Iônica',
          'Nuclear',
        ],
        [
          'Na ligação metálica, os elétrons podem…',
          'Ligação metálica',
          'Mover-se pela estrutura',
          'Virar prótons',
          'Desaparecer',
          'Permanecer apenas no núcleo',
        ],
      ];
      const item = items[index % items.length];
      [prompt, content] = item;
      options = item.slice(2);
    } else {
      let answer: number;
      if (activity.title.includes('Geometria')) {
        content = index % 2 ? 'Perímetro' : 'Área';
        prompt =
          index % 2
            ? `Qual é o perímetro de um quadrado de lado ${n} cm?`
            : `Qual é a área de um quadrado de lado ${n} cm?`;
        answer = index % 2 ? 4 * n : n * n;
      } else if (activity.title.includes('2º')) {
        content = index % 2 ? 'Coeficientes' : 'Função quadrática';
        prompt =
          index % 2
            ? `Qual é o coeficiente de x² em f(x) = ${n}x² + 2x + 3?`
            : `Para f(x) = x² + 3, qual é f(${n})?`;
        answer = index % 2 ? n : n * n + 3;
      } else if (activity.title.includes('linear')) {
        content = 'Equações';
        prompt = `Resolva a equação: 2x + 3 = ${2 * n + 3}.`;
        answer = n;
      } else {
        content = ['Função afim', 'Gráficos', 'Coeficientes'][index % 3];
        prompt = [
          `Uma função afim é dada por f(x) = 2x + 3. Qual é o valor de f(x) quando x = ${n + 3}?`,
          `Em qual valor do eixo y o gráfico de f(x) = 2x + ${n} cruza esse eixo?`,
          `Qual é o coeficiente angular de f(x) = ${n}x + 3?`,
        ][index % 3];
        answer = index % 3 === 0 ? 2 * (n + 3) + 3 : n;
      }
      options = [
        String(answer),
        String(answer + 2),
        String(answer - 1),
        String(answer + 4),
      ];
    }
    const correct = index % 4;
    const first = options.shift()!;
    options.splice(correct, 0, first);
    return { prompt, content, options, correct };
  });
};

export const calculateResult = (
  questions: QuizQuestion[],
  answers: number[],
) => {
  const correct = questions.filter(
    (question, index) => question.correct === answers[index],
  ).length;
  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    contents: [...new Set(questions.map(question => question.content))].map(
      name => {
        const indices = questions.flatMap((question, index) =>
          question.content === name ? [index] : [],
        );
        return {
          name,
          percentage: Math.round(
            (indices.filter(
              index => questions[index].correct === answers[index],
            ).length /
              indices.length) *
              100,
          ),
        };
      },
    ),
  };
};
