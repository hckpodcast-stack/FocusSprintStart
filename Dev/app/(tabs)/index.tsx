import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  fetchWhaleTrades,
  formatUSD,
  formatAddress,
  getWhaleTier,
  timeAgo,
  type Trade,
} from '@/services/polymarket';
import { usePolling } from '@/hooks/usePolling';
import { Colors } from '@/constants/theme';

const c = Colors.dark;

const MIN_AMOUNTS = [1000, 5000, 10000, 50000];

export default function WhaleFeedScreen() {
  const [minAmount, setMinAmount] = useState(10000);

  const fetcher = useCallback(
    () => fetchWhaleTrades(minAmount, 50),
    [minAmount],
  );

  const { data: trades, loading, error, refetch } = usePolling(fetcher, 15000);

  const renderTrade = ({ item }: { item: Trade & { usdValue: number } }) => {
    const tier = getWhaleTier(item.usdValue);
    const isBuy = item.side === 'BUY';

    return (
      <View style={styles.tradeCard}>
        <View style={styles.tradeHeader}>
          <View style={styles.tradeLeft}>
            <View style={[styles.sideBadge, { backgroundColor: isBuy ? c.green + '20' : c.red + '20' }]}>
              <Text style={[styles.sideText, { color: isBuy ? c.green : c.red }]}>
                {item.side}
              </Text>
            </View>
            <Text style={[styles.tierBadge, { color: tier.color }]}>
              {tier.label}
            </Text>
          </View>
          <Text style={styles.timeText}>{timeAgo(item.timestamp)}</Text>
        </View>

        <Text style={styles.marketTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.tradeDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Outcome</Text>
            <Text style={[styles.detailValue, { color: item.outcome === 'Yes' ? c.green : c.red }]}>
              {item.outcome}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>
              {(parseFloat(item.price) * 100).toFixed(1)}c
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size</Text>
            <Text style={[styles.detailValue, styles.valueHighlight]}>
              {formatUSD(item.usdValue)}
            </Text>
          </View>
        </View>

        <View style={styles.walletRow}>
          <Text style={styles.walletLabel}>Trader</Text>
          <Text style={styles.walletValue}>
            {item.name || item.pseudonym || formatAddress(item.proxyWallet)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Whale Feed</Text>
        <Text style={styles.subtitle}>Live large trades on Polymarket</Text>
      </View>

      <View style={styles.filterRow}>
        {MIN_AMOUNTS.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={[
              styles.filterChip,
              minAmount === amt && styles.filterChipActive,
            ]}
            onPress={() => setMinAmount(amt)}
          >
            <Text
              style={[
                styles.filterText,
                minAmount === amt && styles.filterTextActive,
              ]}
            >
              {formatUSD(amt)}+
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !trades ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={styles.loadingText}>Scanning for whales...</Text>
        </View>
      ) : (
        <FlatList
          data={trades || []}
          renderItem={renderTrade}
          keyExtractor={(item, i) => `${item.transactionHash}-${i}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={c.tint}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No whale trades found</Text>
              <Text style={styles.emptySubtext}>
                Try lowering the minimum amount filter
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.liveIndicator}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>Auto-refreshing every 15s</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: c.text,
  },
  subtitle: {
    fontSize: 14,
    color: c.textSecondary,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  filterChipActive: {
    backgroundColor: c.tint + '20',
    borderColor: c.tint,
  },
  filterText: {
    fontSize: 13,
    color: c.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: c.tint,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  tradeCard: {
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tradeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sideText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tierBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: c.textMuted,
  },
  marketTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  tradeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailRow: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: c.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
  },
  valueHighlight: {
    color: c.tint,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: 10,
  },
  walletLabel: {
    fontSize: 12,
    color: c.textMuted,
  },
  walletValue: {
    fontSize: 13,
    color: c.textSecondary,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: c.textSecondary,
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.red + '15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: {
    color: c.red,
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    color: c.tint,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: c.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: c.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  liveIndicator: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.green,
  },
  liveText: {
    fontSize: 11,
    color: c.textSecondary,
  },
});
