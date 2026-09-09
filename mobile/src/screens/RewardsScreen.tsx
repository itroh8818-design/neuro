import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { LargeButton } from '../components/ui/LargeButton';
import { LargeText } from '../components/ui/LargeText';
import { HighContrastCard } from '../components/ui/HighContrastCard';
import { colors, spacing, borderRadius } from '../config/theme';
import { useAppStore } from '../store/useAppStore';
import {
  getRewardSummary,
  redeemReward,
  REWARD_OFFERS,
} from '../services/storage';
import { RewardOffer } from '../models/types';

export const RewardsScreen: React.FC = () => {
  const { currentUser } = useAppStore();
  const [balance, setBalance] = useState(0);
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);

  const loadRewards = async () => {
    if (!currentUser) return;
    const summary = await getRewardSummary(currentUser.id);
    setBalance(summary.balance);
    setRedeemedIds(summary.redeemed.map((item) => item.rewardId));
  };

  useEffect(() => {
    loadRewards();
  }, [currentUser?.id]);

  const handleRedeem = async (reward: RewardOffer) => {
    if (!currentUser) return;
    try {
      await redeemReward(currentUser.id, reward);
      await loadRewards();
      Alert.alert('Coupon unlocked', `${reward.couponCode} - ${reward.title}`);
    } catch {
      Alert.alert('Keep playing', `You need ${reward.pointsCost - balance} more points to unlock this offer.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <HighContrastCard variant="elevated" style={styles.balanceCard}>
        <LargeText size="sm" color={colors.textSecondary} align="center">REWARD POINTS</LargeText>
        <LargeText size="hero" weight="bold" align="center" style={styles.balance}>
          {balance}
        </LargeText>
        <LargeText size="sm" color={colors.textSecondary} align="center">
          Play a game to earn more points
        </LargeText>
      </HighContrastCard>

      <LargeText size="lg" weight="bold" style={styles.sectionTitle}>
        Healthcare offers
      </LargeText>
      <LargeText size="sm" color={colors.textSecondary} style={styles.helperText}>
        Sample partner offers. Unlock them with points earned from your games.
      </LargeText>

      {REWARD_OFFERS.map((reward) => {
        const isRedeemed = redeemedIds.includes(reward.id);
        const canRedeem = balance >= reward.pointsCost && !isRedeemed;
        return (
          <HighContrastCard key={reward.id} style={styles.rewardCard}>
            <View style={styles.rewardHeader}>
              <LargeText size="lg" weight="bold">{reward.partner}</LargeText>
              <LargeText size="sm" weight="bold" style={styles.cost}>{reward.pointsCost} pts</LargeText>
            </View>
            <LargeText size="md" weight="bold" style={styles.rewardTitle}>{reward.title}</LargeText>
            <LargeText size="sm" color={colors.textSecondary}>{reward.description}</LargeText>
            {isRedeemed ? (
              <View style={styles.codeBox}>
                <LargeText size="sm" weight="bold">Coupon: {reward.couponCode}</LargeText>
              </View>
            ) : (
              <LargeButton
                title={canRedeem ? 'Unlock coupon' : `Need ${Math.max(0, reward.pointsCost - balance)} more points`}
                onPress={() => handleRedeem(reward)}
                disabled={!canRedeem}
                variant={canRedeem ? 'primary' : 'outline'}
                size="medium"
                fullWidth
              />
            )}
          </HighContrastCard>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  balanceCard: { alignItems: 'center', padding: spacing.xxl, marginBottom: spacing.xl },
  balance: { color: colors.accent, marginVertical: spacing.sm },
  sectionTitle: { marginBottom: spacing.xs },
  helperText: { marginBottom: spacing.lg },
  rewardCard: { padding: spacing.lg, marginBottom: spacing.md },
  rewardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cost: { color: colors.accent },
  rewardTitle: { marginTop: spacing.sm, marginBottom: spacing.xs },
  codeBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.success + '20',
  },
});

export default RewardsScreen;
