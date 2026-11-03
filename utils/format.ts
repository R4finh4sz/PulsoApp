export const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const normalize = (value: string) => {
  return value.replace(/\D/g, '');
};

export const formatClassroom = (name: string, identifier?: string) => {
  const grade = name.trim().match(/^(\d+)\s*[º°]?\s*ano(?:\s+([a-z]))?$/i);
  if (!grade) return name;
  const letter =
    grade[2] ?? identifier?.trim().match(/^(?:\d+\s*)?([a-z])$/i)?.[1];
  return `${grade[1]}º Ano${letter ? ` ${letter.toUpperCase()}` : ''}`;
};

export const formatName = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .map(part => part.charAt(0).toLocaleUpperCase('pt-BR') + part.slice(1))
    .join(' ');
