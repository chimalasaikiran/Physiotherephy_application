import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '@/constants';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';

const ITEM_HEIGHT = Spacing.wheelItemHeight || 44;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_COUNT = Math.floor(VISIBLE_ITEMS / 2);

interface WheelPickerProps {
  label: string;
  min: number;
  max: number;
  selectedValue: number | null;
  onValueChange: (value: number) => void;
  unit?: string;
}

export const WheelPicker: React.FC<WheelPickerProps> = ({
  label,
  min,
  max,
  selectedValue,
  onValueChange,
  unit,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Dynamically generate the numbers array
  const items = React.useMemo(() => {
    const list: number[] = [];
    for (let val = min; val <= max; val++) {
      list.push(val);
    }
    return list;
  }, [min, max]);

  // Initial scroll alignment
  useEffect(() => {
    if (selectedValue !== null && selectedValue >= min && selectedValue <= max) {
      const index = selectedValue - min;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, []);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const actualValue = min + index;
    if (actualValue >= min && actualValue <= max && actualValue !== selectedValue) {
      onValueChange(actualValue);
    }
  };

  const handleItemPress = (itemValue: number, index: number) => {
    onValueChange(itemValue);
    scrollViewRef.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Wheel Card Container */}
      <View style={styles.wheelCard}>
        {/* Selection Center Overlay Bar / Accent Lines */}
        <View style={styles.selectionOverlay}>
          <View style={styles.topDivider} />
          <View style={styles.bottomDivider} />
        </View>

        {/* ScrollView */}
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          scrollEventThrottle={16}
          nestedScrollEnabled
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top Padding Spacer */}
          <View style={{ height: ITEM_HEIGHT * PADDING_COUNT }} />

          {/* Render Items */}
          {items.map((item, index) => {
            const isSelected = item === selectedValue;
            return (
              <TouchableOpacity
                key={item}
                style={styles.itemContainer}
                onPress={() => handleItemPress(item, index)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected ? styles.selectedItemText : styles.unselectedItemText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Bottom Padding Spacer */}
          <View style={{ height: ITEM_HEIGHT * PADDING_COUNT }} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  wheelCard: {
    width: '100%',
    height: CONTAINER_HEIGHT,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    justifyContent: 'space-between',
    pointerEvents: 'none',
    zIndex: 10,
  },
  topDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 16,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 16,
  },
  scrollContent: {
    alignItems: 'stretch',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
  selectedItemText: {
    fontSize: 22,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.darkBlue,
  },
  unselectedItemText: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.regular,
    color: '#CBD5E1',
    opacity: 0.7,
  },
});
