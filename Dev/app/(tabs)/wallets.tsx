import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  fetchTradesByWallet,
  formatUSD,
  formatAddress,
  getWhaleTier,
  timeAgo,
  type Trade,
} from '@/services/polymarket';
import { Colors } from '@/constants/theme';

const c = Colors.dark;

// Some well-known whale addresses for quick access
const KNOWN_WHALES = [
  { label: 'Theo4', address: '0x1234' }, // placeholder - real addresses can be added
  { label: 'Fredi9999', address: '0x5678' },
];

interface WalletStats {
  totalVolume: number;
  tradeCount: number;
  buyCount: number;
  sellCount: number;
  avgTradeSize: number;
  topMarkets: string[];
}

function computeStats(trades: (Trade & { usdValue: number })[]): WalletStats {
  const totalVolume = trades.reduce((sum, t) => sum + t.usdValue, 0);
  const buyCount = trades.filter(t => t.side === 'BUY').length;
  const sellCount = trades.filter(t => t.side === 'SELL').length;
  const marketSet = new Set(trades.map(t => t.title));
  return {
    totalVolume,
    tradeCount: trades.length,
    buyCount,
    sellCount,
    avgTradeSize: trades.length > 0 ? totalVolume / trades.length : 0,
    topMarkets: Array.from(marketSet).slice(0, 5),
  };
}

export default function WalletsScreen() {
  const [address, setAddress] = useState('');
  const [trades, setTrades] = useState<(Trade & { usdValue: number })[] | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedWallets, setTrackedWallets] = useState<
    { address: string; label?: string }[]
  >([]);

  const lookupWallet = useCallback(async (addr: string) => {
    if (!addr.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTradesByWallet(addr.trim(), 100);
      setTrades(result);
      setStats(computeStats(result));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const trackWallet = () => {
    if (!address.trim()) return;
    if (trackedWallets.some(w => w.address === address.trim())) return;
    setTrackedWallets([...trackedWallets, { address: address.trim() }]);
  };

  const renderTrade = ({ item }: { item: Trade & { usdValue: number } }) => {
    const isBuy = item.side === 'BUY';
    return (
      <View style={styles.tradeRow}>
        <View style={styles.tradeRowLeft}>
          <View style={[styles.miniSideBadge, { backgroundColor: isBuy ? c.green + '20' : c.red + '20' }]}>
            <Text style={[styles.miniSideText, { color: isBuy ? c.green : c.red }]}>
              {item.side}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tradeMarket} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.tradeOutcome}>
              {item.outcome} @ {(parseFloat(item.price) * 100).toFixed(1)}c
            </Text>
          </View>
        </View>
        <View style={styles.tradeRowRight}>
          <Text style={styles.tradeAmount}>{formatUSD(item.usdValue)}</Text>
          <Text style={styles.tradeTime}>{timeAgo(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wallet Tracker</Text>
        <Text style={styles.subtitle}>Look up any Polymarket wallet</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter wallet address (0x...)"
          placeholderTextColor={c.textMuted}
          value={address}
          onChangeText={setAddress}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => lookupWallet(address)}
        >
          <Text style={styles.searchButtonText}>Look up</Text>
        </TouchableOpacity>
      </View>

      {trackedWallets.length > 0 && !trades && (
        <View style={styles.trackedSection}>
          <Text style={styles.sectionTitle}>Tracked Wallets</Text>
          {trackedWallets.map((w, i) => (
            <TouchableOpacity
              key={i}
              style={styles.trackedRow}
              onPress={() => {
                setAddress(w.address);
                lookupWallet(w.address);
              }}
            >
              <Text style={styles.trackedLabel}>
                {w.label || formatAddress(w.address)}
              </Text>
              <Text style={styles.trackedAddr}>{formatAddress(w.address)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.tint} />
          <Text style={styles.loadingText}>Loading wallet activity...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {stats && trades && !loading && (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatUSD(stats.totalVolume)}</Text>
              <Text style={styles.statLabel}>Total Volume</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.tradeCount}</Text>
              <Text style={styles.statLabel}>Trades</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: c.green }]}>{stats.buyCount}</Text>
              <Text style={styles.statLabel}>Buys</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: c.red }]}>{stats.sellCount}</Text>
              <Text style={styles.statLabel}>Sells</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.trackButton} onPress={trackWallet}>
              <Text style={styles.trackButtonText}>Track Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => { setTrades(null); setStats(null); setAddress(''); }}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Recent Trades</Text>
          <FlatList
            data={trades}
            renderItem={renderTrade}
            keyExtractor={(item, i) => `${item.transactionHash}-${i}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No trades found for this wallet</Text>
            }
          />
        </>
      )}

      {!trades && !loading && !error && trackedWallets.length === 0 && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderEmoji}>&#x1F50D;</Text>
          <Text style={styles.placeholderText}>
            Enter a Polymarket wallet address to view their trading activity and
            positions
          </Text>
        </View>
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
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: c.text,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: c.tint,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  trackedSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.text,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  trackedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.border,
    marginBottom: 6,
  },
  trackedLabel: {
    color: c.text,
    fontSize: 14,
    fontWeight: '500',
  },
  trackedAddr: {
    color: c.textMuted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: c.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: c.tint,
  },
  statLabel: {
    fontSize: 10,
    color: c.textMuted,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  trackButton: {
    flex: 1,
    backgroundColor: c.tint + '20',
    borderWidth: 1,
    borderColor: c.tint,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trackButtonText: {
    color: c.tint,
    fontWeight: '600',
    fontSize: 14,
  },
  clearButton: {
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: c.textSecondary,
    fontWeight: '500',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  tradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: c.border,
  },
  tradeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  miniSideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniSideText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tradeMarket: {
    fontSize: 13,
    color: c.text,
    fontWeight: '500',
  },
  tradeOutcome: {
    fontSize: 11,
    color: c.textMuted,
    marginTop: 1,
  },
  tradeRowRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  tradeAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: c.tint,
  },
  tradeTime: {
    fontSize: 11,
    color: c.textMuted,
    marginTop: 1,
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
  },
  emptyText: {
    color: c.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingTop: 40,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  placeholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  placeholderText: {
    color: c.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
