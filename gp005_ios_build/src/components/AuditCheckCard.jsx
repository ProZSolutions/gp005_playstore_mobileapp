import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { common, Colors } from '../theme/common';
import { scale, verticalScale } from '../utils/scale';

export default function AuditCheckCard({
  index,
  total,
  check,
  answer, // 'pass' | 'fail' | undefined
  onAnswer,
  onChangeAnswer,
}) {
  return (
    <View style={[common.card, styles.card]}>
      <View style={styles.topRow}>
        <View style={[common.badge, common.badgeNeutral]}>
          <Text style={[common.badgeText, common.badgeNeutralText]}>
            Check {index + 1} of {total}
          </Text>
        </View>

        {answer === 'pass' && (
          <View style={[common.badge, common.badgePass]}>
            <Icon name="check-circle" size={scale(12)} color={Colors.tealText} />
            <Text style={[common.badgeText, common.badgePassText]}>Passed</Text>
          </View>
        )}
        {answer === 'fail' && (
          <View style={[common.badge, common.badgeFail]}>
            <Icon name="x-circle" size={scale(12)} color={Colors.redText} />
            <Text style={[common.badgeText, common.badgeFailText]}>Failed</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{check.title}</Text>
      <Text style={styles.description}>{check.description}</Text>

      {!answer ? (
        <View style={styles.answerRow}>
          <Pressable
            style={[styles.passButton]}
            onPress={() => onAnswer('pass')}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${check.title} as pass`}
          >
            <Icon name="check-circle" size={scale(16)} color={Colors.white} />
            <Text style={styles.passButtonText}>Pass</Text>
          </Pressable>
          <Pressable
            style={[styles.failButton]}
            onPress={() => onAnswer('fail')}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${check.title} as fail`}
          >
            <Icon name="x-circle" size={scale(16)} color={Colors.red} />
            <Text style={styles.failButtonText}>Fail</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={[common.buttonOutline, styles.changeButton]} onPress={onChangeAnswer}>
          <Text style={common.buttonOutlineText}>Change Answer</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: verticalScale(14) },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(18),
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
  },
  description: {
    fontSize: 12.5,
    color: Colors.inkSecondary,
    marginBottom: verticalScale(18),
    lineHeight: 18,
  },

  answerRow: {
    flexDirection: 'row',
    gap: scale(12),
  },
  passButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    backgroundColor: Colors.teal,
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
  },
  passButtonText: { color: Colors.white, fontSize: 13.5, fontWeight: '700' },
  failButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    backgroundColor: Colors.redLight,
    borderWidth: 1,
    borderColor: '#F4C7C6',
    borderRadius: scale(10),
    paddingVertical: verticalScale(12),
  },
  failButtonText: { color: Colors.red, fontSize: 13.5, fontWeight: '700' },

  changeButton: { marginTop: 0 },
});