import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  ...rest
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
} & Omit<SymbolViewProps, 'name' | 'style' | 'tintColor' | 'type'>) {
  return (
    <SymbolView
      name={name}
      tintColor={color}
      size={size}
      type="monochrome"
      style={style}
      {...rest}
    />
  );
}
