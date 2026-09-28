import * as ImagePicker from 'expo-image-picker';
import { Camera, UserRound } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { Linking, Modal, Platform, Pressable, Text, View } from 'react-native';

import Button from '@/components/ui/Button';
import ErrorText from '@/components/ui/ErrorText';
import Image from '@/components/ui/Image';
import { colors } from '@/global/colors';

type Props = {
  value: ImagePicker.ImagePickerAsset | null;
  onChange: (photo: ImagePicker.ImagePickerAsset | null) => void;
};

const ProfilePhotoPicker = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const picking = useRef(false);
  const pick = async (camera: boolean) => {
    if (picking.current) {
      return;
    }
    picking.current = true;
    setBusy(true);
    setError('');
    setBlocked(false);
    try {
      if (Platform.OS !== 'web') {
        const getPermission = camera
          ? ImagePicker.getCameraPermissionsAsync
          : ImagePicker.getMediaLibraryPermissionsAsync;
        const requestPermission = camera
          ? ImagePicker.requestCameraPermissionsAsync
          : ImagePicker.requestMediaLibraryPermissionsAsync;
        let permission = await getPermission();
        if (!permission.granted && permission.canAskAgain) {
          permission = await requestPermission();
        }
        if (!permission.granted) {
          setBlocked(!permission.canAskAgain);
          setError(
            `Permita o acesso à ${camera ? 'câmera' : 'galeria'} para escolher sua foto. Você também pode continuar sem foto.`,
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };
      const result = await (camera
        ? ImagePicker.launchCameraAsync(options)
        : ImagePicker.launchImageLibraryAsync(options));
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0]);
      }
      setOpen(false);
    } catch {
      setError(
        'Não foi possível abrir a câmera ou galeria. Tente novamente ou continue sem foto.',
      );
    } finally {
      picking.current = false;
      setBusy(false);
    }
  };
  return (
    <View className="items-center gap-2 py-2">
      <Pressable
        accessibilityLabel="Escolher foto de perfil opcional"
        accessibilityRole="button"
        className="h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[#454545]"
        onPress={() => {
          setError('');
          setOpen(true);
        }}
      >
        {value ? (
          <Image
            contentFit="cover"
            source={{ uri: value.uri }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <UserRound color={colors.neutral[80]} size={44} strokeWidth={1.5} />
        )}
      </Pressable>

      <Text className="font-poppins text-base">Foto de perfil (opcional)</Text>

      <Modal
        transparent
        animationType="fade"
        visible={open}
        onRequestClose={() => !busy && setOpen(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full max-w-lg gap-4 rounded-2xl bg-white p-6">
            <Camera color={colors.primary[100]} size={28} />

            <Text className="font-poppins_semibold text-lg">
              Foto de perfil
            </Text>

            <Button
              withoutDelay
              disabled={busy}
              text="Tirar foto"
              onPress={() => pick(true)}
            />

            <Button
              withoutDelay
              disabled={busy}
              text="Escolher da galeria"
              onPress={() => pick(false)}
            />

            <ErrorText text={error} />

            {blocked && (
              <Button
                wired
                text="Abrir configurações"
                onPress={() =>
                  Linking.openSettings().catch(() =>
                    setError(
                      'Abra as configurações do aparelho para permitir o acesso.',
                    ),
                  )
                }
              />
            )}

            {value && (
              <Button
                wired
                disabled={busy}
                text="Remover foto"
                onPress={() => {
                  onChange(null);
                  setOpen(false);
                }}
              />
            )}

            <Button
              wired
              disabled={busy}
              text="Cancelar"
              onPress={() => setOpen(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default ProfilePhotoPicker;
