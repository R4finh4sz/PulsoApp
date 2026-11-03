import { CheckCircle2, Clock3, ListChecks } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { QuizActivity } from '@/components/screens/Quiz/mock';
import { QuizQuestion } from '@/components/screens/Quiz/questions';

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

      <View className="flex-row gap-3">
        {[
          {
            Icon: ListChecks,
            label: `${questions.length} questões`,
          },
          { Icon: Clock3, label: `${questions.length} min` },
        ].map(({ Icon, label }) => (
          <View
            key={label}
            className="flex-row items-center gap-2 rounded-xl bg-white px-3 py-2"
          >
            <Icon color="#009DBD" size={15} />

            <Text className="font-poppins text-xs text-[#253044]">{label}</Text>
          </View>
        ))}
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
