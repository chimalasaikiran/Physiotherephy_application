import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Colors } from '@/constants';
import { Spacing } from '@/constants';

export const SkeletonLoader: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {/* Header skeleton */}
      <View style={styles.headerSkeleton}>
        <Animated.View style={[styles.avatarSkeleton, { opacity }]} />
        <View style={styles.headerTextGroup}>
          <Animated.View style={[styles.textLineShort, { opacity }]} />
          <Animated.View style={[styles.textLineLong, { opacity }]} />
        </View>
      </View>

      {/* Search bar skeleton */}
      <Animated.View style={[styles.searchSkeleton, { opacity }]} />

      {/* Stats skeleton */}
      <Animated.View style={[styles.statsSkeleton, { opacity }]} />

      {/* Program cards skeleton row */}
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.cardSkeleton, { opacity }]} />
        <Animated.View style={[styles.cardSkeleton, { opacity }]} />
      </View>

      {/* Doctor list skeleton */}
      <Animated.View style={[styles.doctorSkeleton, { opacity }]} />
      <Animated.View style={[styles.doctorSkeleton, { opacity }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    gap: 16,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.skeletonBase,
  },
  headerTextGroup: {
    gap: 8,
  },
  textLineShort: {
    width: 100,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.skeletonBase,
  },
  textLineLong: {
    width: 160,
    height: 18,
    borderRadius: 6,
    backgroundColor: Colors.skeletonBase,
  },
  searchSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.skeletonBase,
  },
  statsSkeleton: {
    width: '100%',
    height: 100,
    borderRadius: 16,
    backgroundColor: Colors.skeletonBase,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardSkeleton: {
    width: 220,
    height: 160,
    borderRadius: 20,
    backgroundColor: Colors.skeletonBase,
  },
  doctorSkeleton: {
    width: '100%',
    height: 80,
    borderRadius: 18,
    backgroundColor: Colors.skeletonBase,
  },
});

export default SkeletonLoader;
