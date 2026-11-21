import { CheckCircle2, ListChecks } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { QuizActivity } from '@/components/screens/Quiz/mock';
import { QuizQuestion } from '@/components/screens/Quiz/questions';
import { formatDeadline } from '@/utils/format';

export const ActivityDetails = ({
  activity,
  questions,
}: {
  activity: QuizActivity;
  questions: QuizQuestion[];
}) => (
  <View className="gap-6 pt-5">
    <View className="gap-3 rounded-[20px] bg-[#008EAD] p-5">
      <Text className="self-start rounded-full bg-white px-3 py-1 font-poppins_semibold text-[10px] text-[#253044]">
        {activity.schoolCourse}
      </Text>

      <Text className="font-poppins_bold text-xl text-white">
        {activity.title}
      </Text>

      <Text className="font-poppins text-xs text-white">
        Atividade avaliativa
      </Text>

      <Text className="font-poppins_semibold text-sm text-white">
        Data limite: {formatDeadline(activity.closesAt) ?? 'Sem prazo definido'}
      </Text>

      <View className="flex-row items-center gap-2 self-start rounded-xl bg-white px-3 py-2">
        <ListChecks color="#009DBD" size={15} />

        <Text className="font-poppins text-xs text-[#253044]">
          {questions.length} questões
        </Text>
      </View>
    </View>

    <Text className="font-poppins_bold text-sm text-[#253044]">Instruções</Text>

    <View className="gap-4 px-3">
      {[
        'Leia cada enunciado com atenção antes de responder.',
        'Cada questão possui apenas uma alternativa correta.',
        'Você pode voltar e revisar antes de enviar suas respostas.',
      ].map(text => (
        <View key={text} className="flex-row gap-3">
          <CheckCircle2 color="#22C55E" size={16} />

          <Text className="flex-1 font-poppins text-xs text-[#455165]">
            {text}
          </Text>
        </View>
      ))}
    </View>

    <View className="gap-3">
      <Text className="font-poppins_bold text-sm text-[#253044]">
        Conteúdos avaliados
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {[...new Set(questions.map(item => item.content))].map(content => (
          <Text
            key={content}
            className="rounded-full bg-[#DDF7FD] px-3 py-2 font-poppins text-[11px] text-[#008EAD]"
          >
            {content}
          </Text>
        ))}
      </View>
    </View>
  </View>
);
