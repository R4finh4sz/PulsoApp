import { Text, View } from 'react-native';

import { QuizQuestion } from '@/components/screens/Quiz/questions';
import Pressable from '@/components/ui/Pressable';

export const ActivityQuestion = ({
  question,
  step,
  selected,
  onAnswer,
}: {
  question: QuizQuestion;
  step: number;
  selected?: number;
  onAnswer: (index: number) => void;
}) => (
  <View className="gap-6 pt-8">
    <Text className="font-poppins_bold text-xs text-[#006D83]">
      Questão {step + 1}
    </Text>

    <Text
      accessibilityRole="header"
      className="font-poppins_medium text-base leading-6 text-[#354052]"
    >
      {question.prompt}
    </Text>

    <View accessibilityRole="radiogroup" className="gap-3">
      {question.options.map((option, index) => (
        <Pressable
          key={option}
          accessibilityLabel={`${String.fromCharCode(65 + index)}. ${option}`}
          accessibilityRole="radio"
          accessibilityState={{
            checked: selected === index,
          }}
          className={`min-h-16 flex-row items-center gap-3 rounded-xl border-2 p-4 ${selected === index ? 'border-[#006D83] bg-[#E6F4F7]' : 'border-[#CBD5E1] bg-white'}`}
          onPress={() => onAnswer(index)}
        >
          <View
            className={`h-8 w-8 items-center justify-center rounded-full ${selected === index ? 'bg-[#006D83]' : 'bg-[#F1F5F9]'}`}
          >
            <Text
              className={`font-poppins_semibold text-xs ${selected === index ? 'text-white' : 'text-[#455165]'}`}
            >
              {String.fromCharCode(65 + index)}
            </Text>
          </View>

          <Text className="flex-1 font-poppins_medium text-sm text-[#455165]">
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  </View>
);
