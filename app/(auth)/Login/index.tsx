import { zodResolver } from '@hookform/resolvers/zod';
import { updateId } from 'expo-updates';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { LinearTransition } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import useAuth from '@/contexts/authContext';
import { LoginForm, LoginSchema } from '@/validation/Login.validation';
import { height, width } from 'global/constants';

const Login = () => {
  const { login, logout } = useAuth();
  const [showUpdateId, setShowUpdateId] = useState(false);
  const { control, handleSubmit, setValue, watch } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const toggleStayConnected = () => {
    setValue('requestRefresh', !watch('requestRefresh'));
  };

  useEffect(() => {
    logout();
  }, []);

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
    >
      <View
        className="items-center justify-center gap-3 p-6"
        style={{ minHeight: height, width }}
      >
        <Input
          control={control}
          keyboardType="email-address"
          label="E-mail"
          name="identifier"
          placeholder="E-mail"
        />

        <Input
          password
          control={control}
          label="Senha"
          name="password"
          placeholder="Senha"
        />

        <Animated.View
          className="w-full flex-row items-center gap-2"
          layout={LinearTransition}
        >
          <Checkbox
            isChecked={watch('requestRefresh')}
            onPress={toggleStayConnected}
          />

          <Text className="text-base text-neutral-60">Lembrar de mim</Text>
        </Animated.View>

        <Button text="ENTRAR" onPress={handleSubmit(login)} />

        <TouchableOpacity
          className="absolute bottom-8 h-4 w-full items-center justify-center"
          onPress={() => setShowUpdateId(!showUpdateId)}
        >
          {showUpdateId && (
            <Text className="text-xs text-neutral-100">{updateId}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Login;
