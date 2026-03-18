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
  fetchTopMarkets,
  fetchTradesByMarket,
  formatUSD,
  getWhaleTier,
  timeAgo,
  type Market,
  type Trade,
} from '@/services/polymarket';
import { usePolling } from '@/hooks/usePolling';
import { Colors } from '@/constants/theme';

const c = Colors.dark;

interface MarketWithWhaleActivity extends Market {
  whaleTradeCount: number;
  totalWhaleVolume: number;
  latestWhaleTrade?: Trade & { usdValue: number };
}

export default function MarketsScreen() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [marketTrades, setMarketTrades] = useState<(Trade & { usdValue: number })[] | null>(null);
  const [loadingTrades, setLoadingTrades] = useState(false);

  const fetcher = useCallback(() => fetchTopMarkets(30), []);
  const { data: markets, loading, error, refetch } = usePolling(fetcher, 60000);

  const openMarket = async (market: Market) => {
    setSelectedMarket(market);
    setLoadingTrades(true);
    try {
      const trades = await fetchTradesByMarket(market.conditionId, 100);
      // Filter to whale-sized trades only
      const whaleTrades = trades.filter(t => t.usdValue >= 1000);
      setMarketTrades(whaleTrades);
    } catch {
      setMarketTrades([]);
    } finally {
      setLoadingTrades(false);
    }
  };

  const renderMarket = ({ item }: { item: Market }) => {
    const prices = JSON.parse(item.outcomePrices || '[]');
    const yesPrice = prices[0] ? (parseFloat(prices[0]) * 100).toFixed(0) : '?';
    const volume = parseFloat(item.volume || '0');

    return (
      <TouchableOpacity
        style={styles.marketCard}
        onPress={() => openMarket(item)}
        activeOpacity={0.7}
      >
        <View style={styles.marketHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'General'}</Text>
          </View>
          <Text style={styles.volumeText}>Vol: {formatUSD(volume)}</Text>
        </View>

        <Text style={styles.marketQuestion} numberOfLines={2}>
          {item.question}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.priceBar}>
            <View
              style={[
                styles.priceBarFill,
                { width: `${yesPrice}%` as any },
              ]}
            />
          </View>
          <View style={styles.priceLabels}>
            <Text style={[styles.priceLabel, { color: c.green }]}>
              Yes {yesPrice}c
            </Text>
            <Text style={[styles.priceLabel, { color: c.red }]}>
              No {100 - parseInt(yesPrice)}c
            </Text>
          </View>
        </View>

        <Text style={styles.tapHint}>Tap to see whale trades</Text>
      </TouchableOpacity>
    );
  };

  if (selectedMarket && marketTrades !== null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setSelectedMarket(null); setMarketTrades(null); }}>
            <Text style={styles.backButton}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Market Whales</Text>
        </View>

        <View style={styles.selectedMarketCard}>
          <Text style={styles.selectedMarketTitle}>{selectedMarket.question}</Text>
          <Text style={styles.selectedMarketVolume}>
            Volume: {formatUSD(parseFloat(selectedMarket.volume || '0'))}
          </Text>
        </View>

        {loadingTrades ? (
          <ActivityIndicator size="large" color={c.tint} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={marketTrades}
            keyExtractor={(item, i) => `${item.transactionHash}-${i}`}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>
                {marketTrades.length} whale trade{marketTrades.length !== 1 ? 's' : ''} found
              </Text>
            }
            renderItem={({ item }) => {
              const isBuy = item.side === 'BUY';
              const tier = getWhaleTier(item.usdValue);
              return (
                <View style={styles.tradeRow}>
                  <View style={styles.tradeRowTop}>
                    <View style={[styles.sideBadge, { backgroundColor: isBuy ? c.green + '20' : c.red + '20' }]}>
                      <Text style={[styles.sideText, { color: isBuy ? c.green : c.red }]}>
                        {item.side}
                      </Text>
                    </View>
                    <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
                    <Text style={styles.tradeTime}>{timeAgo(item.timestamp)}</Text>
                  </View>
                  <View style={styles.tradeRowBottom}>
                    <Text style={styles.tradeOutcome}>
                      {item.outcome} @ {(parseFloat(item.price) * 100).toFixed(1)}c
                    </Text>
                    <Text style={styles.tradeSize}>{formatUSD(item.usdValue)}</Text>
                  </View>
                  {(item.name || item.pseudonym) && (
                    <Text style={styles.traderName}>{item.name || item.pseudonym}</Text>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No whale trades on this market yet</Text>
              </View>
            }
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Top Markets</Text>
        <Text style={styles.subtitle}>Biggest markets by volume</Text>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && !markets ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={styles.loadingText}>Loading markets...</Text>
        </View>
      ) : (
        <FlatList
          data={markets || []}
          renderItem={renderMarket}
          keyExtractor={(item) => item.id || item.conditionId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              tintColor={c.tint}
            />
          }
        />
      )}
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
  backButton: {
    color: c.tint,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  marketCard: {
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: c.purple + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: c.purple,
    fontSize: 11,
    fontWeight: '600',
  },
  volumeText: {
    color: c.textMuted,
    fontSize: 12,
  },
  marketQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRow: {
    marginBottom: 8,
  },
  priceBar: {
    height: 6,
    backgroundColor: c.red + '30',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  priceBarFill: {
    height: '100%',
    backgroundColor: c.green,
    borderRadius: 3,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 11,
    color: c.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  selectedMarketCard: {
    backgroundColor: c.surface,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.tint + '40',
    marginBottom: 16,
  },
  selectedMarketTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
    lineHeight: 22,
  },
  selectedMarketVolume: {
    fontSize: 13,
    color: c.textSecondary,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textSecondary,
    marginBottom: 10,
  },
  tradeRow: {
    backgroundColor: c.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: c.border,
  },
  tradeRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  tradeTime: {
    fontSize: 11,
    color: c.textMuted,
  },
  tradeRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeOutcome: {
    fontSize: 13,
    color: c.textSecondary,
  },
  tradeSize: {
    fontSize: 15,
    fontWeight: '700',
    color: c.tint,
  },
  traderName: {
    fontSize: 12,
    color: c.textMuted,
    marginTop: 4,
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
    paddingTop: 40,
  },
  emptyText: {
    color: c.textSecondary,
    fontSize: 14,
  },
});
