declare module '*.png';

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';

  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.otf';

type ImageFormRN = {
  uri: string;
  name: string;
  type: string;
};

declare interface FormData {
  append(name: string, data: ImageFormRN): void;
}
