import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const LEVEL_COLORS = {
  'Hunarmand': '#6b7280',
  'Maahir': '#10b981',
  'Ustad': '#f59e0b',
  'Grand Ustad': '#6353f7',
  'Legend': '#ef4444',
};

export default function DashboardScreen({ navigation }) {
  const { worker, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, earningsRes, bookingsRes] = await Promise.all([
        api.get('/workers/profile'),
        api.get('/workers/earnings'),
        api.get('/bookings/worker'),
      ]);
      setProfile(profileRes.data);
      setIsOnline(profileRes.data.worker.is_online);
      setEarnings(earningsRes.data.earnings);
      setBookings(bookingsRes.data.bookings);
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleOnline = async () => {
    setTogglingOnline(true);
    try {
      const response = await api.put('/workers/toggle-online');
      setIsOnline(response.data.is_online);
      Alert.alert('Status', response.data.message);
    } catch (error) {
      Alert.alert('Error', 'Could not update status');
    } finally {
      setTogglingOnline(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      Alert.alert('✅ Updated!', `Booking ${status}!`);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Could not update booking');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6353f7" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const levelProgress = profile?.levelProgress;
  const currentLevel = levelProgress?.currentLevel || worker?.level;
  const levelColor = LEVEL_COLORS[currentLevel] || '#6353f7';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.workerName}>{worker?.name}</Text>
          <Text style={styles.workerTrade}>{worker?.trade}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Online Toggle */}
      <TouchableOpacity
        style={[styles.onlineToggle, isOnline ? styles.onlineActive : styles.onlineInactive]}
        onPress={toggleOnline}
        disabled={togglingOnline}
      >
        {togglingOnline ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.onlineIcon}>{isOnline ? '🟢' : '🔴'}</Text>
            <Text style={styles.onlineText}>
              {isOnline ? 'Aap Online Hain — Tap to go Offline' : 'Aap Offline Hain — Tap to go Online'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Level Card */}
      {levelProgress && (
        <View style={[styles.levelCard, { borderLeftColor: levelColor }]}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.levelLabel}>Aapka Level</Text>
              <Text style={[styles.levelName, { color: levelColor }]}>
                {currentLevel}
              </Text>
            </View>
            <View style={styles.levelJobsContainer}>
              <Text style={styles.levelJobs}>{levelProgress.currentJobs}</Text>
              <Text style={styles.levelJobsLabel}>Total Jobs</Text>
            </View>
          </View>

          {/* Progress Bar */}
          {levelProgress.nextLevel && (
            <>
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  {
                    width: `${levelProgress.percentage}%`,
                    backgroundColor: levelColor
                  }
                ]} />
              </View>
              <Text style={styles.progressMessage}>
                {levelProgress.message}
              </Text>
              <Text style={styles.commissionText}>
                💰 Aapki commission: {levelProgress.commission}%
              </Text>
            </>
          )}

          {!levelProgress.nextLevel && (
            <Text style={styles.legendText}>
              🏆 Aap Legend hain! Pakistan ke best workers mein se ek!
            </Text>
          )}
        </View>
      )}

      {/* Earnings */}
      {earnings && (
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>💰 Kamai</Text>
          <View style={styles.earningsGrid}>
            <View style={styles.earningItem}>
              <Text style={styles.earningAmount}>
                PKR {Math.round(earnings.today)}
              </Text>
              <Text style={styles.earningLabel}>Aaj</Text>
            </View>
            <View style={styles.earningItem}>
              <Text style={styles.earningAmount}>
                PKR {Math.round(earnings.this_week)}
              </Text>
              <Text style={styles.earningLabel}>Is Hafte</Text>
            </View>
            <View style={styles.earningItem}>
              <Text style={styles.earningAmount}>
                PKR {Math.round(earnings.this_month)}
              </Text>
              <Text style={styles.earningLabel}>Is Mahine</Text>
            </View>
            <View style={styles.earningItem}>
              <Text style={[styles.earningAmount, { color: '#ef4444' }]}>
                PKR {Math.round(earnings.pending_payment)}
              </Text>
              <Text style={styles.earningLabel}>Pending</Text>
            </View>
          </View>
        </View>
      )}

      {/* Active Bookings */}
      <Text style={styles.sectionTitle}>📋 Bookings</Text>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Abhi koi booking nahi hai</Text>
          <Text style={styles.emptySubtext}>
            Online rahein — bookings ayengi!
          </Text>
        </View>
      ) : (
        bookings.map((booking) => (
          <View key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingService}>
                {booking.service_name}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.status) + '20' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(booking.status) }
                ]}>
                  {booking.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Text style={styles.bookingDetail}>
              👤 {booking.customer_name}
            </Text>
            <Text style={styles.bookingDetail}>
              📍 {booking.address}
            </Text>
            <Text style={styles.bookingDetail}>
              💰 PKR {booking.amount}
            </Text>

            {/* Action Buttons */}
            {booking.status === 'pending' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => updateBookingStatus(booking.id, 'accepted')}
                >
                  <Text style={styles.acceptBtnText}>✅ Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => updateBookingStatus(booking.id, 'cancelled')}
                >
                  <Text style={styles.declineBtnText}>❌ Decline</Text>
                </TouchableOpacity>
              </View>
            )}

            {booking.status === 'accepted' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateBookingStatus(booking.id, 'on_the_way')}
              >
                <Text style={styles.actionBtnText}>🚗 On My Way</Text>
              </TouchableOpacity>
            )}

            {booking.status === 'on_the_way' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateBookingStatus(booking.id, 'arrived')}
              >
                <Text style={styles.actionBtnText}>📍 I've Arrived</Text>
              </TouchableOpacity>
            )}

            {booking.status === 'arrived' && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => updateBookingStatus(booking.id, 'in_progress')}
              >
                <Text style={styles.actionBtnText}>🔧 Start Work</Text>
              </TouchableOpacity>
            )}

            {booking.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                onPress={() => updateBookingStatus(booking.id, 'completed')}
              >
                <Text style={styles.actionBtnText}>✅ Mark Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const getStatusColor = (status) => {
  const colors = {
    pending: '#f59e0b',
    accepted: '#3b82f6',
    on_the_way: '#8b5cf6',
    arrived: '#06b6d4',
    in_progress: '#f97316',
    completed: '#10b981',
    cancelled: '#ef4444',
  };
  return colors[status] || '#666';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a1a2e',
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  workerTrade: {
    fontSize: 14,
    color: '#9b93ff',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  onlineActive: {
    backgroundColor: '#10b981',
  },
  onlineInactive: {
    backgroundColor: '#6b7280',
  },
  onlineIcon: {
    fontSize: 20,
  },
  onlineText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  levelCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  levelName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  levelJobsContainer: {
    alignItems: 'center',
  },
  levelJobs: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  levelJobsLabel: {
    fontSize: 11,
    color: '#888',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  commissionText: {
    fontSize: 13,
    color: '#6353f7',
    fontWeight: '500',
  },
  legendText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
  },
  earningsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  earningItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  earningAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  earningLabel: {
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  bookingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  bookingDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  declineBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: '#6353f7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomSpace: {
    height: 40,
  },
});