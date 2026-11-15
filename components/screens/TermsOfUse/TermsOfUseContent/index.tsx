import { Text, View } from 'react-native';

import { termsOfUseSections } from '../content';

export const TermsOfUseContent = ({ content }: { content?: string }) =>
  content !== undefined ? (
    <View className="px-6">
      <Text className="font-poppins text-[13px] leading-5 text-[#70839D]">
        {content}
      </Text>
    </View>
  ) : (
    <View className="px-6">
      {termsOfUseSections.map(section => (
        <View key={section.title}>
          <Text
            accessibilityRole="header"
            className="text-center font-poppins text-[13px] leading-[15px] text-[#70839D]"
          >
            {section.title}
          </Text>

          {section.paragraphs.map(paragraph => (
            <Text
              key={paragraph}
              className="text-center font-poppins text-[13px] leading-[15px] text-[#70839D]"
            >
              {paragraph}
            </Text>
          ))}

          {section.items?.map(item => (
            <Text
              key={item}
              className="text-center font-poppins text-[13px] leading-[15px] text-[#70839D]"
            >
              • {item}
            </Text>
          ))}

          {section.closing && (
            <Text className="text-center font-poppins text-[13px] leading-[15px] text-[#70839D]">
              {section.closing}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
