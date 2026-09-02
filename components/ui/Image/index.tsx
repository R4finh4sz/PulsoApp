// eslint-disable-next-line no-restricted-imports
import { Image as ExpoImage, ImageProps } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import Shimmer from '../Shimmer';

type Props = {
  withoutBackground?: boolean;
} & ImageProps;

const Image = ({ style, withoutBackground = false, ...props }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View className="overflow-hidden" style={style}>
      <ExpoImage
        style={{ flex: 1 }}
        onDisplay={() => setIsLoading(false)}
        {...props}
      />

      {isLoading && !withoutBackground && (
        <View className="absolute inset-0">
          <Shimmer />
        </View>
      )}
    </View>
  );
};

export default Image;
