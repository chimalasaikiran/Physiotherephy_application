import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants';
import { Spacing } from '@/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.xl * 2 - 14) / 2;

export interface MedicalService {
  id: string;
  title: string;
  description: string;
  imageKey: string;
  category?: string;
}

export interface ServiceCardProps {
  service: MedicalService;
  isSelected: boolean;
  onSelect: (service: MedicalService) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isSelected,
  onSelect,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.02 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 100,
    }).start();
  }, [isSelected, scaleAnim]);

  const getImageSource = (key: string) => {
    switch (key) {
      case 'service_back_pain':
        return require('../../../assets/images/service_back_pain.png');
      case 'service_neck_pain':
        return require('../../../assets/images/service_neck_pain.png');
      case 'service_sports_injury':
        return require('../../../assets/images/service_sports_injury.png');
      case 'service_post_surgery':
        return require('../../../assets/images/service_post_surgery.png');
      case 'service_knee_pain':
        return require('../../../assets/images/service_knee_pain.png');
      case 'service_home_visit':
        return require('../../../assets/images/service_home_visit.png');
      case 'service_online_consult':
        return require('../../../assets/images/service_online_consult.png');
      default:
        return require('../../../assets/images/service_back_pain.png');
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => onSelect(service)}
        accessibilityRole="button"
        accessibilityLabel={`Select service ${service.title}`}
        accessibilityState={{ selected: isSelected }}
        style={[
          styles.cardContainer,
          isSelected ? styles.cardSelected : styles.cardUnselected,
        ]}
      >
        {/* Top Selection Checkmark Badge */}
        {isSelected && (
          <View style={styles.checkmarkBadge}>
            <Ionicons name="checkmark-circle" size={22} color="#003D9B" />
          </View>
        )}

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(service.imageKey)}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        </View>

        {/* Text Content */}
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.titleText,
              isSelected && styles.titleSelectedText,
            ]}
            numberOfLines={1}
          >
            {service.title}
          </Text>

          <Text style={styles.descriptionText} numberOfLines={2}>
            {service.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#003D9B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardUnselected: {
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#003D9B',
    backgroundColor: '#F8FAFC',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  checkmarkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  titleText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: '#051A3E',
    marginBottom: 4,
  },
  titleSelectedText: {
    color: '#003D9B',
  },
  descriptionText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: '#64748B',
    lineHeight: 16,
  },
});
