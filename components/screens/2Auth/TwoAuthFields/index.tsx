import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  code: string;
  onChangeCode: (code: string) => void;
  editable: boolean;
};

export const TwoAuthFields = ({ code, onChangeCode, editable }: Props) => {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginTop: 36 }}>
      <Pressable
        accessible={false}
        style={{ height: 56 }}
        onPress={() => inputRef.current?.focus()}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={{ flexDirection: 'row', gap: 5 }}
        >
          {Array.from({ length: 6 }, (_, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                borderWidth: 2,
                borderColor:
                  code[index] || (focused && index === Math.min(code.length, 5))
                    ? '#009BB9'
                    : '#FFFFFF',
                backgroundColor: code[index] ? '#BFDEE5' : '#CFDDE0',
              }}
            >
              <Text
                className="font-poppins_bold"
                style={{
                  fontSize: 28,
                  color: code[index] ? '#283B40' : '#A2A2A2',
                }}
              >
                {code[index] || '0'}
              </Text>
            </View>
          ))}
        </View>

        <TextInput
          ref={inputRef}
          caretHidden
          accessibilityLabel="Código de verificação de seis dígitos"
          autoComplete="one-time-code"
          editable={editable}
          keyboardType="number-pad"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.02,
            color: 'transparent',
          }}
          textContentType="oneTimeCode"
          value={code}
          onBlur={() => setFocused(false)}
          onChangeText={value =>
            onChangeCode(value.replace(/\D/g, '').slice(0, 6))
          }
          onFocus={() => setFocused(true)}
        />
      </Pressable>
    </View>
  );
};
